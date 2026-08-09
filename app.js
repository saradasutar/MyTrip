(() => {
  "use strict";

  const config = window.MYTRIP_CONFIG || {};
  const configured = /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(config.API_URL || "");
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: config.DEFAULT_CURRENCY || "INR", maximumFractionDigits: 0 });
  const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const demo = {
    trip: { tripId: "GOA26", name: "Goa Escape", destination: "Goa", startDate: "2026-11-19", endDate: "2026-11-23", budget: 85000, currency: "INR", createdBy: "Sarada" },
    members: [
      { id: "m1", name: "Sarada", role: "Organiser" }, { id: "m2", name: "Anita", role: "Editor" },
      { id: "m3", name: "Rohan", role: "Editor" }, { id: "m4", name: "Meera", role: "Editor" },
      { id: "m5", name: "Vikram", role: "Viewer" }, { id: "m6", name: "Neha", role: "Editor" }
    ],
    itinerary: [
      { id: "i1", date: "2026-11-19", time: "10:30", title: "Arrive & check in", place: "Casa Sol, Panjim", notes: "Drop bags, freshen up and have a light lunch." },
      { id: "i2", date: "2026-11-19", time: "16:30", title: "Fontainhas heritage walk", place: "Altinho, Panjim", notes: "Start near the Maruti Temple. Carry water." },
      { id: "i3", date: "2026-11-20", time: "09:00", title: "Old Goa churches", place: "Basilica of Bom Jesus", notes: "Visit the Basilica and Sé Cathedral before lunch." },
      { id: "i4", date: "2026-11-20", time: "14:30", title: "Divar Island ferry", place: "Old Goa Ferry Terminal", notes: "Keep one hour for the village lanes and river views." },
      { id: "i5", date: "2026-11-21", time: "08:00", title: "South Goa beach day", place: "Palolem Beach", notes: "Breakfast en route; sunset from the north end." }
    ],
    places: [
      { id: "p1", name: "Fontainhas", area: "Panjim", category: "Culture", plannedDay: "Day 1" },
      { id: "p2", name: "Basilica of Bom Jesus", area: "Old Goa", category: "Heritage", plannedDay: "Day 2" },
      { id: "p3", name: "Divar Island", area: "North Goa", category: "Nature", plannedDay: "Day 2" },
      { id: "p4", name: "Palolem Beach", area: "Canacona", category: "Beach", plannedDay: "Day 3" },
      { id: "p5", name: "Reis Magos Fort", area: "Verem", category: "History", plannedDay: "Unplanned" },
      { id: "p6", name: "Ritz Classic", area: "Panjim", category: "Food", plannedDay: "Day 1" }
    ],
    expenses: [
      { id: "e1", date: "2026-11-18", label: "Casa Sol · 4 nights", category: "Stay", paidBy: "Sarada", amount: 18500 },
      { id: "e2", date: "2026-11-08", label: "Bengaluru–Goa flights", category: "Travel", paidBy: "Anita", amount: 9640 },
      { id: "e3", date: "2026-11-19", label: "Lunch · Ritz Classic", category: "Food", paidBy: "Rohan", amount: 2310 },
      { id: "e4", date: "2026-11-19", label: "Airport taxi", category: "Local travel", paidBy: "Sarada", amount: 1200 },
      { id: "e5", date: "2026-11-20", label: "Heritage walk tickets", category: "Activities", paidBy: "Meera", amount: 800 }
    ]
  };

  const state = { data: null, tab: "overview", pin: "", demoMode: false, mapQuery: "Goa, India", currentUser: "Traveller" };
  const labels = { overview: "Overview", itinerary: "Itinerary", places: "Places & Map", expenses: "Expenses", people: "Travellers", print: "Print & Export" };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function toast(message, error = false) { const element = $("#toast"); element.textContent = `${error ? "!" : "✓"} ${message}`; element.style.background = error ? "#a34343" : "#17263c"; element.classList.remove("hidden"); clearTimeout(toast.timer); toast.timer = setTimeout(() => element.classList.add("hidden"), 2800); }
  function displayDate(date, options = { day: "2-digit", month: "short", year: "numeric" }) { if (!date) return "—"; return new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", options); }
  function displayTime(value) { if (!value) return ""; const [hours, minutes] = String(value).split(":"); const date = new Date(2000, 0, 1, Number(hours), Number(minutes)); return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }); }
  function initials(name) { return String(name || "T").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }
  function nights() { return Math.max(0, Math.round((new Date(state.data.trip.endDate) - new Date(state.data.trip.startDate)) / 86400000)); }
  function spent() { return state.data.expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0); }
  function remaining() { return Number(state.data.trip.budget || 0) - spent(); }
  function apiUrlReady() { if (!configured) { toast("First paste your Apps Script /exec URL in config.js", true); return false; } return true; }

  async function api(action, payload = {}) {
    if (!apiUrlReady()) throw new Error("Backend URL is not configured.");
    const response = await fetch(config.API_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action, ...payload }) });
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || "The request could not be completed.");
    return result.data;
  }

  function normalize(data) {
    return { trip: data.trip || {}, members: data.members || [], places: data.places || [], itinerary: data.itinerary || [], expenses: (data.expenses || []).map((item) => ({ ...item, amount: Number(item.amount || 0) })) };
  }

  async function openTrip(data, pin, demoMode, name) {
    state.data = normalize(clone(data)); state.pin = pin; state.demoMode = demoMode; state.currentUser = name || data.trip.createdBy || "Traveller";
    $("#accessScreen").classList.add("hidden"); $("#dashboard").classList.remove("hidden");
    setTab("overview"); hydrateShell(); updatePrintArea();
  }

  function hydrateShell() {
    const { trip, members } = state.data;
    $("#tripTitle").textContent = `${trip.destination || trip.name}, here we come! ☀`;
    $("#tripMeta").textContent = `${displayDate(trip.startDate, { day: "numeric", month: "long", year: "numeric" })}–${displayDate(trip.endDate, { day: "numeric", month: "long", year: "numeric" })} · ${nights()} nights · ${members.length} travellers`;
    $("#sideTripName").textContent = trip.name; $("#sideTripDates").textContent = `${displayDate(trip.startDate, { day: "numeric", month: "short" })}–${displayDate(trip.endDate, { day: "numeric", month: "short", year: "numeric" })}`;
    $("#currentUser").textContent = state.currentUser;
    $("#topAvatars").innerHTML = members.slice(0, 3).map((member) => `<span title="${esc(member.name)}">${esc(initials(member.name))}</span>`).join("") + (members.length > 3 ? `<span>+${members.length - 3}</span>` : "");
  }

  function setTab(tab) {
    state.tab = tab; $("#crumbLabel").textContent = labels[tab];
    $$('[data-tab]').forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
    render(); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function heading(kicker, title, action = "", add = "") { return `<div class="view-head"><div><span class="kicker">${kicker}</span><h2>${title}</h2><p>${action}</p></div>${add ? `<button class="primary" data-add="${add}">＋ Add ${add}</button>` : ""}</div>`; }
  function panelHead(kicker, title, tab) { return `<div class="panel-head"><div><span class="kicker">${kicker}</span><h2>${title}</h2></div>${tab ? `<button data-go="${tab}">View all →</button>` : ""}</div>`; }

  function renderOverview() {
    const budget = Number(state.data.trip.budget || 0), total = spent(), percent = budget ? Math.min(100, Math.round(total / budget * 100)) : 0;
    const upcoming = [...state.data.itinerary].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).slice(0, 3);
    return `<section class="stats"><article class="stat"><i>◫</i><div><small>TRIP LENGTH</small><strong>${nights()} nights</strong><span>${displayDate(state.data.trip.startDate, { day: "numeric", month: "short" })}–${displayDate(state.data.trip.endDate, { day: "numeric", month: "short" })}</span></div></article><article class="stat"><i>₹</i><div><small>TOTAL BUDGET</small><strong>${money.format(budget)}</strong><span>${money.format(remaining())} remaining</span></div></article><article class="stat"><i>◎</i><div><small>PLACES SAVED</small><strong>${state.data.places.length}</strong><span>${state.data.places.filter((place) => place.plannedDay !== "Unplanned").length} planned</span></div></article><article class="stat"><i>♙</i><div><small>TRAVELLERS</small><strong>${state.data.members.length}</strong><span>Sharing this trip</span></div></article></section>
      <section class="main-grid"><article class="panel">${panelHead("WHAT’S NEXT", "Upcoming itinerary", "itinerary")}<div class="timeline">${upcoming.map((item) => `<div class="timeline-row"><span class="date"><small>${displayDate(item.date, { weekday: "short" }).toUpperCase()}</small><b>${displayDate(item.date, { day: "2-digit" })}</b></span><time>${displayTime(item.time)}</time><span><h3>${esc(item.title)}</h3><p>⌖ ${esc(item.place)}</p></span><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.place)}" target="_blank" rel="noreferrer">Map ↗</a></div>`).join("") || `<p>No plans yet.</p>`}</div><button class="dashed" data-add="plan">＋ Add something to the plan</button></article>
      <article class="panel">${panelHead("SPENDING", "Budget snapshot", "expenses")}<div class="budget"><div class="donut" style="background:conic-gradient(var(--coral) ${percent}%,#e9edef 0)"><b>${percent}%</b></div><div><small>TOTAL SPENT</small><strong>${money.format(total)}</strong><span>of ${money.format(budget)} budget</span></div></div><div class="progress"><i style="width:${percent}%"></i></div></article>
      <article class="panel">${panelHead("YOUR MAP", "Saved places", "places")}<div class="timeline">${state.data.places.slice(0, 4).map((place) => `<div class="expense-mini"><i>⌖</i><span><b>${esc(place.name)}</b><small>${esc(place.area)} · ${esc(place.category)}</small></span><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name}, ${place.area}`)}" target="_blank" rel="noreferrer">Map ↗</a></div>`).join("")}</div></article>
      <article class="panel">${panelHead("LATEST", "Recent expenses", "expenses")}<div>${state.data.expenses.slice(0, 3).map((expense) => `<div class="expense-mini"><i>₹</i><span><b>${esc(expense.label)}</b><small>Paid by ${esc(expense.paidBy)}</small></span><strong>${money.format(expense.amount)}</strong></div>`).join("")}</div><button class="dashed" data-add="expense">＋ Add an expense</button></article></section>`;
  }

  function renderItinerary() {
    const items = [...state.data.itinerary].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
    return `${heading("DAY BY DAY", "Trip itinerary", "Everything the group plans appears here in time order.", "plan")}<div class="filter-row"><button class="active">All days</button>${[...new Set(items.map((item) => item.date))].map((date) => `<button>${displayDate(date, { weekday: "short", day: "numeric" })}</button>`).join("")}</div><div class="plan-list">${items.map((item) => `<article class="plan-item"><span class="date"><small>${displayDate(item.date, { weekday: "short" }).toUpperCase()}</small><b>${displayDate(item.date, { day: "2-digit" })}</b></span><time>${displayTime(item.time)}</time><div><h3>${esc(item.title)}</h3><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.place)}" target="_blank" rel="noreferrer">⌖ ${esc(item.place)}</a><p>${esc(item.notes || "")}</p></div><button>•••</button></article>`).join("")}</div>`;
  }

  function renderPlaces() {
    return `${heading("DISCOVER & SAVE", "Places and map", "Search or open any saved place directly in Google Maps.", "place")}<div class="map-search"><input id="mapQuery" value="${esc(state.mapQuery)}" aria-label="Search Google Maps"><button id="mapSearchButton">⌖ Search Google Maps</button></div><div class="places-layout"><div class="map-frame"><iframe title="Trip map" src="https://www.google.com/maps?q=${encodeURIComponent(state.mapQuery)}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div><div class="places-list">${state.data.places.map((place) => `<article class="place"><i class="place-icon">⌖</i><div><h3>${esc(place.name)}</h3><p>${esc(place.area)} · ${esc(place.category)}</p><small>${esc(place.plannedDay || "Unplanned")}</small></div><button data-map="${esc(`${place.name}, ${place.area}`)}">Map ↗</button></article>`).join("")}</div></div>`;
  }

  function renderExpenses() {
    const budget = Number(state.data.trip.budget || 0), total = spent();
    return `${heading("SHARED SPENDING", "Trip expenses", "Record who paid and keep the group budget clear.", "expense")}<section class="expense-summary"><article class="summary-card"><small>TOTAL BUDGET</small><strong>${money.format(budget)}</strong><span>Set by organiser</span></article><article class="summary-card"><small>SPENT SO FAR</small><strong>${money.format(total)}</strong><span>${budget ? Math.round(total / budget * 100) : 0}% of budget</span></article><article class="summary-card"><small>AVAILABLE</small><strong>${money.format(budget - total)}</strong><span>For the rest of the trip</span></article></section><section class="table-panel"><div class="table-headline"><div><span class="kicker">ALL ENTRIES</span><h2>Expense details</h2></div><button data-print="expenses">▤ Print expenses</button></div><div class="expense-table"><div class="expense-table-header"><span>EXPENSE</span><span>DATE</span><span>CATEGORY</span><span>PAID BY</span><span>AMOUNT</span></div>${state.data.expenses.map((expense) => `<div class="expense-row"><span><i>₹</i>${esc(expense.label)}</span><span>${displayDate(expense.date)}</span><span>${esc(expense.category)}</span><span>${esc(expense.paidBy)}</span><strong>${money.format(expense.amount)}</strong></div>`).join("")}</div></section>`;
  }

  function renderPeople() {
    const totals = Object.fromEntries(state.data.members.map((member) => [member.name, state.data.expenses.filter((expense) => expense.paidBy === member.name).reduce((sum, expense) => sum + Number(expense.amount), 0)]));
    return `${heading("YOUR TRAVEL GROUP", "Travellers", `${state.data.members.length} people can view and update this shared trip.`, "traveller")}<div class="share-banner"><div><h3>Shared trip access</h3><p>Trip code <b>${esc(state.data.trip.tripId)}</b> · Protected with a group PIN</p></div><button data-invite>Copy invite link</button></div><div class="people-grid">${state.data.members.map((member) => `<article class="person"><i>${esc(initials(member.name))}</i><div><h3>${esc(member.name)}</h3><p>Shared trip member</p></div><span>${esc(member.role)}</span><footer><small>PAID FOR TRIP</small><b>${money.format(totals[member.name] || 0)}</b></footer></article>`).join("")}</div>`;
  }

  function renderPrint() {
    return `${heading("READY FOR PAPER", "Print and export", "Create a clean A4 copy or save any report as PDF.")}<div class="print-grid"><article class="print-card"><i>▦</i><h3>Itinerary only</h3><p>Day-by-day plan, timings, places and notes.</p><button data-print="plan">Print itinerary →</button></article><article class="print-card"><i>₹</i><h3>Expenses only</h3><p>Budget summary and every expense entry.</p><button data-print="expenses">Print expenses →</button></article><article class="print-card"><i>▤</i><h3>Complete trip book</h3><p>Trip overview, full plan and expense statement.</p><button data-print="full">Print everything →</button></article></div>`;
  }

  function render() {
    if (!state.data) return;
    const renderers = { overview: renderOverview, itinerary: renderItinerary, places: renderPlaces, expenses: renderExpenses, people: renderPeople, print: renderPrint };
    $("#view").innerHTML = renderers[state.tab](); bindViewActions();
  }

  function bindViewActions() {
    $$('[data-go]').forEach((button) => button.addEventListener("click", () => setTab(button.dataset.go)));
    $$('[data-add]').forEach((button) => button.addEventListener("click", () => showAddModal(button.dataset.add)));
    $$('[data-print]').forEach((button) => button.addEventListener("click", () => printReport(button.dataset.print)));
    $$('[data-map]').forEach((button) => button.addEventListener("click", () => openMap(button.dataset.map)));
    $$('[data-invite]').forEach((button) => button.addEventListener("click", showInvite));
    if ($("#mapSearchButton")) $("#mapSearchButton").addEventListener("click", () => { state.mapQuery = $("#mapQuery").value.trim() || state.data.trip.destination; openMap(state.mapQuery); render(); });
  }

  function openMap(query) { window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, "_blank", "noopener,noreferrer"); }
  function showModal(title, html) { $("#modalTitle").textContent = title; $("#modalBody").innerHTML = html; $("#modal").classList.remove("hidden"); }
  function closeModal() { $("#modal").classList.add("hidden"); $("#modalBody").innerHTML = ""; }
  const actions = `<div class="form-actions"><button type="button" data-cancel>Cancel</button><button type="submit">Save for everyone</button></div>`;

  function showAddModal(type) {
    if (type === "plan") showModal("Add to itinerary", `<form class="modal-form" data-form="plan"><label>Plan title<input name="title" placeholder="e.g. Sunset cruise" required></label><div class="form-row"><label>Date<input name="date" type="date" min="${esc(state.data.trip.startDate)}" max="${esc(state.data.trip.endDate)}" value="${esc(state.data.trip.startDate)}" required></label><label>Time<input name="time" type="time" value="10:00" required></label></div><label>Place<input name="place" placeholder="Place or address" required></label><label>Notes<textarea name="notes" rows="3" placeholder="Tickets, reminders, meeting point…"></textarea></label>${actions}</form>`);
    if (type === "place") showModal("Save a place", `<form class="modal-form" data-form="place"><label>Place name<input name="name" placeholder="e.g. Dudhsagar Falls" required></label><label>Area or address<input name="area" placeholder="Goa" required></label><div class="form-row"><label>Category<select name="category"><option>Beach</option><option>Food</option><option>Culture</option><option>Nature</option><option>Shopping</option><option>Stay</option></select></label><label>Plan for<select name="plannedDay"><option>Unplanned</option><option>Day 1</option><option>Day 2</option><option>Day 3</option><option>Day 4</option><option>Day 5</option></select></label></div>${actions}</form>`);
    if (type === "expense") showModal("Add an expense", `<form class="modal-form" data-form="expense"><label>What was it for?<input name="label" placeholder="e.g. Dinner at Fisherman’s Wharf" required></label><div class="form-row"><label>Amount (₹)<input name="amount" type="number" min="1" step="0.01" required></label><label>Date<input name="date" type="date" value="${esc(state.data.trip.startDate)}" required></label></div><div class="form-row"><label>Category<select name="category"><option>Food</option><option>Stay</option><option>Travel</option><option>Local travel</option><option>Activities</option><option>Shopping</option><option>Other</option></select></label><label>Paid by<select name="paidBy">${state.data.members.map((member) => `<option>${esc(member.name)}</option>`).join("")}</select></label></div>${actions}</form>`);
    if (type === "traveller") showModal("Add a traveller", `<form class="modal-form" data-form="member"><label>Name<input name="name" placeholder="Traveller’s name" required></label><label>Access role<select name="role"><option>Editor</option><option>Viewer</option></select></label>${actions}</form>`);
    const form = $('[data-form]'); if (form) form.addEventListener("submit", saveForm); const cancel = $('[data-cancel]'); if (cancel) cancel.addEventListener("click", closeModal);
  }

  async function saveForm(event) {
    event.preventDefault();
    const form = event.currentTarget, type = form.dataset.form, values = Object.fromEntries(new FormData(form).entries());
    const record = { id: uid(), ...values }; if (type === "expense") record.amount = Number(record.amount);
    const collection = { plan: "itinerary", place: "places", expense: "expenses", member: "members" }[type];
    try {
      if (!state.demoMode) await api(`add${type[0].toUpperCase()}${type.slice(1)}`, { tripId: state.data.trip.tripId, pin: state.pin, record });
      state.data[collection].push(record); closeModal(); render(); hydrateShell(); updatePrintArea(); toast(`${type === "member" ? "Traveller" : type[0].toUpperCase() + type.slice(1)} saved for everyone`);
    } catch (error) { toast(error.message, true); }
  }

  function showInvite() {
    const link = `${location.origin}${location.pathname}?trip=${encodeURIComponent(state.data.trip.tripId)}`;
    showModal("Invite your travel group", `<div class="invite-box"><p>Share this link and the PIN separately with people you trust. Everyone will see the same Google-backed trip.</p><div class="copy-field"><input id="inviteLink" value="${esc(link)}" readonly><button id="copyInvite">Copy</button></div><div class="pin-box"><span>TRIP CODE<b>${esc(state.data.trip.tripId)}</b></span><span>ACCESS PIN<b>••••</b></span></div></div>`);
    $("#copyInvite").addEventListener("click", async () => { try { await navigator.clipboard.writeText(link); } catch (_) {} toast("Invite link copied"); });
  }

  function updatePrintArea() {
    if (!state.data) return; const budget = Number(state.data.trip.budget || 0);
    $("#printArea").innerHTML = `<header><div><span class="kicker">MYTRIP · TRIP BOOK</span><h1>${esc(state.data.trip.name)}</h1><p>${displayDate(state.data.trip.startDate)}–${displayDate(state.data.trip.endDate)} · ${state.data.members.length} travellers</p></div><b>${esc(state.data.trip.tripId)}</b></header><section class="print-plan"><h2>Itinerary</h2>${[...state.data.itinerary].sort((a,b)=>`${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).map((item) => `<article><time>${displayDate(item.date, { weekday:"short", day:"2-digit", month:"short" })} · ${displayTime(item.time)}</time><div><h3>${esc(item.title)}</h3><span>${esc(item.place)}</span><p>${esc(item.notes || "")}</p></div></article>`).join("")}</section><section class="print-expenses"><h2>Expense statement</h2><div class="print-totals"><span><small>Budget</small><b>${money.format(budget)}</b></span><span><small>Spent</small><b>${money.format(spent())}</b></span><span><small>Balance</small><b>${money.format(remaining())}</b></span></div><table><thead><tr><th>Date</th><th>Expense</th><th>Category</th><th>Paid by</th><th>Amount</th></tr></thead><tbody>${state.data.expenses.map((expense) => `<tr><td>${displayDate(expense.date)}</td><td>${esc(expense.label)}</td><td>${esc(expense.category)}</td><td>${esc(expense.paidBy)}</td><td>${money.format(expense.amount)}</td></tr>`).join("")}</tbody></table></section>`;
  }

  function printReport(target) { document.body.dataset.print = target; updatePrintArea(); const clear = () => { delete document.body.dataset.print; removeEventListener("afterprint", clear); }; addEventListener("afterprint", clear); print(); setTimeout(clear, 1200); }

  async function refreshTrip() {
    if (state.demoMode) return toast("Demo data is already up to date");
    try { const data = await api("getTrip", { tripId: state.data.trip.tripId, pin: state.pin }); state.data = normalize(data); hydrateShell(); render(); updatePrintArea(); toast("Latest trip data loaded"); } catch (error) { toast(error.message, true); }
  }

  $("#joinForm").addEventListener("submit", async (event) => { event.preventDefault(); const data = new FormData(event.currentTarget); try { const trip = await api("getTrip", { tripId: String(data.get("tripId")).trim().toUpperCase(), pin: String(data.get("pin")) }); await openTrip(trip, String(data.get("pin")), false); } catch (error) { toast(error.message, true); } });
  $("#demoButton").addEventListener("click", () => openTrip(demo, "1234", true, "Sarada"));
  $("#showCreateButton").addEventListener("click", () => { showModal("Create a new trip", `<form class="modal-form" id="createTripForm"><label>Trip name<input name="name" placeholder="e.g. Kerala family holiday" required></label><label>Destination<input name="destination" placeholder="e.g. Kochi, Kerala" required></label><div class="form-row"><label>Start date<input name="startDate" type="date" required></label><label>End date<input name="endDate" type="date" required></label></div><div class="form-row"><label>Total budget (₹)<input name="budget" type="number" min="0" value="50000" required></label><label>Your name<input name="createdBy" required></label></div><label>Choose an access PIN<input name="pin" type="password" inputmode="numeric" minlength="4" maxlength="8" placeholder="4–8 digits" required></label>${actions}</form>`); $("#createTripForm").addEventListener("submit", async (event) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries()); try { if (!configured) throw new Error("Paste your Apps Script /exec URL in config.js first."); const result = await api("createTrip", { trip: { ...values, budget: Number(values.budget) }, pin: values.pin }); closeModal(); await openTrip(result, values.pin, false, values.createdBy); toast(`Trip created. Code: ${result.trip.tripId}`); } catch (error) { toast(error.message, true); } }); $('[data-cancel]').addEventListener("click", closeModal); });
  $("#closeModal").addEventListener("click", closeModal); $("#modal").addEventListener("mousedown", (event) => { if (event.target === event.currentTarget) closeModal(); });
  $("#mainNav").addEventListener("click", (event) => { const button = event.target.closest("[data-tab]"); if (button) setTab(button.dataset.tab); });
  $("#inviteButton").addEventListener("click", showInvite); $("#syncButton").addEventListener("click", refreshTrip); $("#leaveTrip").addEventListener("click", () => location.reload());
  $$('[data-add]').forEach((button) => button.addEventListener("click", () => showAddModal(button.dataset.add)));

  const invitedTrip = new URLSearchParams(location.search).get("trip"); if (invitedTrip) $("#joinTripId").value = invitedTrip.toUpperCase();
})();
