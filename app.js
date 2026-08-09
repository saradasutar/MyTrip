(() => {
  "use strict";

  const config = window.MYTRIP_CONFIG || {};
  const apiStorageKey = "mytrip_google_backend_url";
  const requiredBackendMajor = 3;
  const validApiUrl = (value) => /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(String(value || "").trim());
  function readStoredApiUrl() { try { return localStorage.getItem(apiStorageKey) || ""; } catch { return ""; } }
  function saveStoredApiUrl(value) { try { localStorage.setItem(apiStorageKey, value); } catch {} }
  let apiUrl = validApiUrl(config.API_URL) ? String(config.API_URL).trim() : (validApiUrl(readStoredApiUrl()) ? readStoredApiUrl() : "");
  let backendState = apiUrl ? "checking" : "missing";
  let backendVersion = "";
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

  const state = { data: null, tab: "overview", pin: "", demoMode: false, mapQuery: "Goa, India", currentUser: "Traveller", accessRole: "traveller", permissions: {} };
  const labels = { overview: "Overview", itinerary: "Itinerary", places: "Places & Map", expenses: "Expenses", people: "Travellers", print: "Print & Export" };
  const demoTrips = [
    { tripId: "GOA26", name: "Goa Escape", destination: "Goa", startDate: "2026-11-19", endDate: "2026-11-23", budget: 85000, spent: 32450, travellerCount: 6, createdBy: "Sarada" },
    { tripId: "KER27", name: "Kerala Backwaters", destination: "Alappuzha", startDate: "2027-01-14", endDate: "2027-01-18", budget: 72000, spent: 8400, travellerCount: 4, createdBy: "Sarada" },
    { tripId: "MYS26", name: "Mysuru Weekend", destination: "Mysuru", startDate: "2026-09-05", endDate: "2026-09-07", budget: 28000, spent: 12650, travellerCount: 3, createdBy: "Sarada" }
  ];

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function toast(message, error = false) { const element = $("#toast"); element.textContent = `${error ? "!" : "✓"} ${message}`; element.style.background = error ? "#a34343" : "#17263c"; element.classList.remove("hidden"); clearTimeout(toast.timer); toast.timer = setTimeout(() => element.classList.add("hidden"), error ? 9000 : 2800); }
  function displayDate(date, options = { day: "2-digit", month: "short", year: "numeric" }) { if (!date) return "—"; return new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", options); }
  function displayTime(value) { if (!value) return ""; const [hours, minutes] = String(value).split(":"); const date = new Date(2000, 0, 1, Number(hours), Number(minutes)); return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }); }
  function initials(name) { return String(name || "T").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(); }
  function nights() { return Math.max(0, Math.round((new Date(state.data.trip.endDate) - new Date(state.data.trip.startDate)) / 86400000)); }
  function spent() { return state.data.expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0); }
  function remaining() { return Number(state.data.trip.budget || 0) - spent(); }
  function apiUrlReady() { return validApiUrl(apiUrl); }

  async function requestAt(url, action, payload = {}) {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action, ...payload }) });
    if (!response.ok) throw new Error(`Google backend returned HTTP ${response.status}.`);
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || "The request could not be completed.");
    return result.data;
  }

  function backendMajor(version) {
    const major = Number.parseInt(String(version || "0").split(".")[0], 10);
    return Number.isFinite(major) ? major : 0;
  }

  function backendUpgradeError(version) {
    const shownVersion = version ? `version ${version}` : "an old version";
    const error = new Error(`Your Google backend is ${shownVersion}. Replace Code.gs with MyTrip version 3, run setupMyTrip(), then deploy a New version in Apps Script.`);
    error.code = "BACKEND_UPGRADE_REQUIRED";
    return error;
  }

  async function verifyBackendVersion(url = apiUrl) {
    const info = await requestAt(url, "ping");
    backendVersion = String(info && info.version || "");
    if (backendMajor(backendVersion) < requiredBackendMajor) throw backendUpgradeError(backendVersion);
    return info;
  }

  async function ensureCurrentBackend() {
    if (!apiUrlReady()) throw new Error("Connect the Google backend first.");
    backendState = "checking"; updateBackendStatus();
    try {
      const info = await verifyBackendVersion();
      backendState = "ready"; updateBackendStatus();
      return info;
    } catch (error) {
      backendState = error.code === "BACKEND_UPGRADE_REQUIRED" ? "outdated" : "error";
      updateBackendStatus();
      throw error;
    }
  }

  async function api(action, payload = {}) {
    if (!apiUrlReady()) throw new Error("Connect the Google backend first.");
    return requestAt(apiUrl, action, payload);
  }

  function normalize(data) {
    return { trip: data.trip || {}, members: data.members || [], places: data.places || [], itinerary: data.itinerary || [], expenses: (data.expenses || []).map((item) => ({ ...item, amount: Number(item.amount || 0) })) };
  }

  function isAdmin() { return state.accessRole === "administrator"; }
  function canAdd(type) { return type === "plan" || type === "expense" || isAdmin(); }

  async function openTrip(data, pin, demoMode, name, roleOverride) {
    state.data = normalize(clone(data)); state.pin = pin; state.demoMode = demoMode; state.currentUser = name || data.trip.createdBy || "Traveller";
    state.accessRole = roleOverride || data.accessRole || "traveller";
    state.permissions = data.permissions || {};
    $("#accessScreen").classList.add("hidden"); $("#dashboard").classList.remove("hidden");
    setTab("overview"); hydrateShell(); updatePrintArea();
  }

  function hydrateShell() {
    const { trip, members } = state.data;
    $("#tripTitle").textContent = `${trip.destination || trip.name}, here we come! ☀`;
    $("#tripMeta").textContent = `${displayDate(trip.startDate, { day: "numeric", month: "long", year: "numeric" })}–${displayDate(trip.endDate, { day: "numeric", month: "long", year: "numeric" })} · ${nights()} nights · ${members.length} travellers`;
    $("#sideTripName").textContent = trip.name; $("#sideTripDates").textContent = `${displayDate(trip.startDate, { day: "numeric", month: "short" })}–${displayDate(trip.endDate, { day: "numeric", month: "short", year: "numeric" })}`;
    $("#currentUser").textContent = state.currentUser;
    $("#currentRoleLabel").textContent = isAdmin() ? "Global Administrator" : "Traveller access";
    $("#accessBadge").textContent = isAdmin() ? "ADMINISTRATOR" : "TRAVELLER";
    $("#accessBadge").classList.toggle("traveller", !isAdmin());
    $("#inviteButton").classList.toggle("hidden", !isAdmin());
    $("#allTripsButton").classList.toggle("hidden", !isAdmin());
    $("#editTripButton").classList.toggle("hidden", !isAdmin());
    $("#topAvatars").innerHTML = members.slice(0, 3).map((member) => `<span title="${esc(member.name)}">${esc(initials(member.name))}</span>`).join("") + (members.length > 3 ? `<span>+${members.length - 3}</span>` : "");
  }

  function setTab(tab) {
    state.tab = tab; $("#crumbLabel").textContent = labels[tab];
    $$('[data-tab]').forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
    render(); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function heading(kicker, title, action = "", add = "") { return `<div class="view-head"><div><span class="kicker">${kicker}</span><h2>${title}</h2><p>${action}</p></div>${add && canAdd(add) ? `<button class="primary" data-add="${add}">＋ Add ${add}</button>` : ""}</div>`; }
  function panelHead(kicker, title, tab) { return `<div class="panel-head"><div><span class="kicker">${kicker}</span><h2>${title}</h2></div>${tab ? `<button data-go="${tab}">View all →</button>` : ""}</div>`; }
  function accessNotice() { return `<section class="permission-banner ${isAdmin() ? "admin" : "traveller"}"><i>${isAdmin() ? "◆" : "♙"}</i><div><b>${isAdmin() ? "Global Administrator access" : "Traveller access"}</b><p>${isAdmin() ? "You can open every trip, manage each trip’s Traveller PIN, and use all administrative controls." : "You can use only this trip: view, add plans and expenses, use maps and print."}</p></div>${isAdmin() ? `<button data-all-trips>All trips</button><button data-security>Security</button>` : `<span>TRIP-ONLY ACCESS</span>`}</section>`; }

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
    return `${heading("DAY BY DAY", "Trip itinerary", "Travellers can add plans; only the administrator can edit or delete them.", "plan")}<div class="filter-row"><button class="active">All days</button>${[...new Set(items.map((item) => item.date))].map((date) => `<button>${displayDate(date, { weekday: "short", day: "numeric" })}</button>`).join("")}</div><div class="plan-list">${items.map((item) => `<article class="plan-item"><span class="date"><small>${displayDate(item.date, { weekday: "short" }).toUpperCase()}</small><b>${displayDate(item.date, { day: "2-digit" })}</b></span><time>${displayTime(item.time)}</time><div><h3>${esc(item.title)}</h3><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.place)}" target="_blank" rel="noreferrer">⌖ ${esc(item.place)}</a><p>${esc(item.notes || "")}</p></div>${isAdmin() ? `<button class="delete-control" data-delete data-sheet="Itinerary" data-id="${esc(item.id)}">Delete</button>` : `<span class="locked-control">🔒</span>`}</article>`).join("")}</div>`;
  }

  function renderPlaces() {
    return `${heading("DISCOVER & SAVE", "Places and map", "Everyone can use the map; saved places are managed by the administrator.", "place")}<div class="map-search"><input id="mapQuery" value="${esc(state.mapQuery)}" aria-label="Search Google Maps"><button id="mapSearchButton">⌖ Search Google Maps</button></div><div class="places-layout"><div class="map-frame"><iframe title="Trip map" src="https://www.google.com/maps?q=${encodeURIComponent(state.mapQuery)}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div><div class="places-list">${state.data.places.map((place) => `<article class="place"><i class="place-icon">⌖</i><div><h3>${esc(place.name)}</h3><p>${esc(place.area)} · ${esc(place.category)}</p><small>${esc(place.plannedDay || "Unplanned")}</small></div><span class="row-actions"><button data-map="${esc(`${place.name}, ${place.area}`)}">Map ↗</button>${isAdmin() ? `<button class="delete-control mini" data-delete data-sheet="Places" data-id="${esc(place.id)}">×</button>` : ""}</span></article>`).join("")}</div></div>`;
  }

  function renderExpenses() {
    const budget = Number(state.data.trip.budget || 0), total = spent();
    return `${heading("SHARED SPENDING", "Trip expenses", "Travellers can add spending; only the administrator can edit or delete entries.", "expense")}<section class="expense-summary"><article class="summary-card"><small>TOTAL BUDGET</small><strong>${money.format(budget)}</strong><span>Set by organiser</span></article><article class="summary-card"><small>SPENT SO FAR</small><strong>${money.format(total)}</strong><span>${budget ? Math.round(total / budget * 100) : 0}% of budget</span></article><article class="summary-card"><small>AVAILABLE</small><strong>${money.format(budget - total)}</strong><span>For the rest of the trip</span></article></section><section class="table-panel"><div class="table-headline"><div><span class="kicker">ALL ENTRIES</span><h2>Expense details</h2></div><button data-print="expenses">▤ Print expenses</button></div><div class="expense-table"><div class="expense-table-header"><span>EXPENSE</span><span>DATE</span><span>CATEGORY</span><span>PAID BY</span><span>AMOUNT</span></div>${state.data.expenses.map((expense) => `<div class="expense-row"><span><i>₹</i>${esc(expense.label)}</span><span>${displayDate(expense.date)}</span><span>${esc(expense.category)}</span><span>${esc(expense.paidBy)}</span><span class="amount-cell"><strong>${money.format(expense.amount)}</strong>${isAdmin() ? `<button class="delete-control mini" data-delete data-sheet="Expenses" data-id="${esc(expense.id)}">×</button>` : ""}</span></div>`).join("")}</div></section>`;
  }

  function renderPeople() {
    const totals = Object.fromEntries(state.data.members.map((member) => [member.name, state.data.expenses.filter((expense) => expense.paidBy === member.name).reduce((sum, expense) => sum + Number(expense.amount), 0)]));
    return `${heading("YOUR TRAVEL GROUP", "Travellers", isAdmin() ? "Set the separate Traveller PIN for this trip; your Administrator access remains global." : "Traveller details are read-only with your current trip PIN.", "traveller")}<div class="share-banner"><div><h3>Global admin · Separate trip access</h3><p>Trip code <b>${esc(state.data.trip.tripId)}</b> · This trip has its own Traveller PIN</p></div>${isAdmin() ? `<span class="banner-actions"><button data-all-trips>All trips</button><button data-security>⚿ Security</button><button data-invite>Copy invite link</button></span>` : `<span class="readonly-label">TRIP ONLY</span>`}</div><div class="people-grid">${state.data.members.map((member) => `<article class="person"><i>${esc(initials(member.name))}</i><div><h3>${esc(member.name)}</h3><p>Shared trip member</p></div><span>${esc(member.role)}</span><footer><span><small>PAID FOR TRIP</small><b>${money.format(totals[member.name] || 0)}</b></span>${isAdmin() && member.role !== "Organiser" ? `<button class="delete-control" data-delete data-sheet="Members" data-id="${esc(member.id)}">Remove</button>` : ""}</footer></article>`).join("")}</div>`;
  }

  function renderPrint() {
    return `${heading("READY FOR PAPER", "Print and export", "Create a clean A4 copy or save any report as PDF.")}<div class="print-grid"><article class="print-card"><i>▦</i><h3>Itinerary only</h3><p>Day-by-day plan, timings, places and notes.</p><button data-print="plan">Print itinerary →</button></article><article class="print-card"><i>₹</i><h3>Expenses only</h3><p>Budget summary and every expense entry.</p><button data-print="expenses">Print expenses →</button></article><article class="print-card"><i>▤</i><h3>Complete trip book</h3><p>Trip overview, full plan and expense statement.</p><button data-print="full">Print everything →</button></article></div>`;
  }

  function render() {
    if (!state.data) return;
    const renderers = { overview: renderOverview, itinerary: renderItinerary, places: renderPlaces, expenses: renderExpenses, people: renderPeople, print: renderPrint };
    $("#view").innerHTML = accessNotice() + renderers[state.tab](); bindViewActions();
  }

  function bindViewActions() {
    $$('[data-go]').forEach((button) => button.addEventListener("click", () => setTab(button.dataset.go)));
    $$('[data-add]').forEach((button) => button.addEventListener("click", () => showAddModal(button.dataset.add)));
    $$('[data-print]').forEach((button) => button.addEventListener("click", () => printReport(button.dataset.print)));
    $$('[data-map]').forEach((button) => button.addEventListener("click", () => openMap(button.dataset.map)));
    $$('[data-invite]').forEach((button) => button.addEventListener("click", showInvite));
    $$('[data-all-trips]').forEach((button) => button.addEventListener("click", showAllTrips));
    $$('[data-security]').forEach((button) => button.addEventListener("click", showSecurity));
    $$('[data-delete]').forEach((button) => button.addEventListener("click", () => deleteItem(button.dataset.sheet, button.dataset.id)));
    if ($("#mapSearchButton")) $("#mapSearchButton").addEventListener("click", () => { state.mapQuery = $("#mapQuery").value.trim() || state.data.trip.destination; openMap(state.mapQuery); render(); });
  }

  function openMap(query) { window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, "_blank", "noopener,noreferrer"); }
  function showModal(title, html) { $("#modalTitle").textContent = title; $("#modalBody").innerHTML = html; $("#modal").classList.remove("hidden"); }
  function closeModal() { $("#modal").classList.add("hidden"); $("#modalBody").innerHTML = ""; }
  const actions = `<div class="form-actions"><button type="button" data-cancel>Cancel</button><button type="submit">Save for everyone</button></div>`;

  function updateBackendStatus() {
    const panel = $("#backendStatus");
    const connected = backendState === "ready";
    panel.classList.toggle("connected", connected);
    panel.classList.toggle("outdated", backendState === "outdated");
    const labels = {
      missing: "Google backend not connected",
      checking: "Checking Google backend…",
      ready: `Google backend connected · v${backendVersion}`,
      outdated: `Google backend v${backendVersion || "1"} needs update`,
      error: "Google backend connection failed"
    };
    panel.querySelector("b").textContent = labels[backendState] || labels.missing;
    panel.querySelector("button").textContent = backendState === "outdated" ? "How to update" : (connected ? "Change" : "Connect");
  }

  function showBackendSetup(afterConnect) {
    showModal("Connect Google backend", `<form class="modal-form" id="backendForm"><div class="setup-note"><i>G</i><div><b>MyTrip backend version 3 required</b><p>Replace your Apps Script <code>Code.gs</code>, run <code>setupMyTrip()</code>, and deploy a <b>New version</b>. Saving the script without deploying a new version leaves the old PIN system active.</p></div></div><label>Google Apps Script Web App URL<input name="apiUrl" type="url" value="${esc(apiUrl)}" placeholder="https://script.google.com/macros/s/…/exec" autocomplete="url" required></label><p class="form-help">Use the deployed <b>/exec</b> URL, not the testing <b>/dev</b> URL. The connection and backend version are checked before they are saved.</p><a class="setup-guide-link" href="SETUP-GUIDE.md" target="_blank" rel="noreferrer">Open the Google setup guide ↗</a><div class="form-actions"><button type="button" data-cancel>Cancel</button><button type="submit">Test version 3 & connect</button></div></form>`);
    const form = $("#backendForm");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const candidate = String(new FormData(form).get("apiUrl") || "").trim();
      if (!validApiUrl(candidate)) return toast("Enter a valid Apps Script URL ending in /exec", true);
      const submit = form.querySelector('button[type="submit"]');
      submit.disabled = true; submit.textContent = "Checking…";
      try {
        const info = await verifyBackendVersion(candidate);
        apiUrl = candidate; backendVersion = String(info.version || ""); backendState = "ready"; saveStoredApiUrl(candidate); updateBackendStatus(); closeModal(); toast(`Google backend version ${backendVersion} connected`);
        if (typeof afterConnect === "function") afterConnect();
      } catch (error) {
        backendState = error.code === "BACKEND_UPGRADE_REQUIRED" ? "outdated" : "error";
        updateBackendStatus();
        toast(error.code === "BACKEND_UPGRADE_REQUIRED" ? error.message : `Could not connect: ${error.message}`, true);
        submit.disabled = false; submit.textContent = "Test version 3 & connect";
      }
    });
    $('[data-cancel]').addEventListener("click", closeModal);
  }

  function renderAllTrips(trips, administratorSecret, demoMode) {
    const items = trips || [];
    showModal("All trips", `<div class="all-trips-modal"><div class="all-trips-summary"><span><small>ADMINISTRATOR LIBRARY</small><b>${items.length} ${items.length === 1 ? "trip" : "trips"}</b></span><button id="createFromTrips" type="button">＋ Create new trip</button></div><div class="trip-library">${items.map((trip) => `<article class="trip-library-card"><i>⌖</i><div><span>${esc(trip.tripId)}</span><h3>${esc(trip.name)}</h3><p>${esc(trip.destination)} · ${displayDate(trip.startDate, { day: "numeric", month: "short", year: "numeric" })}–${displayDate(trip.endDate, { day: "numeric", month: "short", year: "numeric" })}</p><small>${Number(trip.travellerCount || 0)} travellers · ${money.format(Number(trip.spent || 0))} spent</small></div><button data-open-admin-trip="${esc(trip.tripId)}" type="button">Open →</button></article>`).join("") || `<div class="empty-trips"><b>No trips yet</b><p>Create your first trip with this Administrator password/PIN.</p></div>`}</div><p class="global-access-note">◆ The same Administrator password/PIN opens every trip. Traveller PINs remain separate for each trip.</p></div>`);
    $("#createFromTrips").addEventListener("click", () => { closeModal(); $("#showCreateButton").click(); });
    $$('[data-open-admin-trip]').forEach((button) => button.addEventListener("click", async () => {
      const tripId = button.dataset.openAdminTrip;
      try {
        if (demoMode) {
          const summary = demoTrips.find((trip) => trip.tripId === tripId) || demoTrips[0];
          const bundle = clone(demo); bundle.trip = { ...bundle.trip, ...summary };
          closeModal(); await openTrip(bundle, administratorSecret, true, summary.createdBy, "administrator");
        } else {
          const bundle = await api("getTrip", { tripId, pin: administratorSecret });
          closeModal(); await openTrip(bundle, administratorSecret, false, bundle.trip.createdBy, "administrator");
        }
      } catch (error) { toast(error.message, true); }
    }));
  }

  async function loadAllTrips(administratorSecret, demoMode) {
    try {
      if (!demoMode) await ensureCurrentBackend();
      const trips = demoMode ? demoTrips : (await api("listTrips", { pin: administratorSecret })).trips;
      renderAllTrips(trips, administratorSecret, demoMode);
    } catch (error) { toast(error.message, true); }
  }

  function showAllTrips() {
    if (!apiUrlReady() && !state.demoMode) return showBackendSetup(showAllTrips);
    if (state.data && isAdmin()) return loadAllTrips(state.pin, state.demoMode);
    showModal("Administrator · All trips", `<form class="modal-form" id="allTripsLoginForm"><div class="security-note"><i>◆</i><p>Use your one global Administrator password/PIN to see every trip. Traveller PINs cannot open this list.</p></div><label>Global Administrator password/PIN<input name="adminPin" type="password" minlength="4" maxlength="64" autocomplete="current-password" placeholder="Your administrator access" required></label><div class="form-actions"><button type="button" data-cancel>Cancel</button><button type="submit">View all trips</button></div></form>`);
    $("#allTripsLoginForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const secret = String(new FormData(event.currentTarget).get("adminPin") || "");
      await loadAllTrips(secret, false);
    });
    $('[data-cancel]').addEventListener("click", closeModal);
  }

  function showAddModal(type) {
    if (!canAdd(type)) return toast("Global Administrator access required for this action", true);
    if (type === "plan") showModal("Add to itinerary", `<form class="modal-form" data-form="plan"><label>Plan title<input name="title" placeholder="e.g. Sunset cruise" required></label><div class="form-row"><label>Date<input name="date" type="date" min="${esc(state.data.trip.startDate)}" max="${esc(state.data.trip.endDate)}" value="${esc(state.data.trip.startDate)}" required></label><label>Time<input name="time" type="time" value="10:00" required></label></div><label>Place<input name="place" placeholder="Place or address" required></label><label>Notes<textarea name="notes" rows="3" placeholder="Tickets, reminders, meeting point…"></textarea></label>${actions}</form>`);
    if (type === "place") showModal("Save a place", `<form class="modal-form" data-form="place"><label>Place name<input name="name" placeholder="e.g. Dudhsagar Falls" required></label><label>Area or address<input name="area" placeholder="Goa" required></label><div class="form-row"><label>Category<select name="category"><option>Beach</option><option>Food</option><option>Culture</option><option>Nature</option><option>Shopping</option><option>Stay</option></select></label><label>Plan for<select name="plannedDay"><option>Unplanned</option><option>Day 1</option><option>Day 2</option><option>Day 3</option><option>Day 4</option><option>Day 5</option></select></label></div>${actions}</form>`);
    if (type === "expense") showModal("Add an expense", `<form class="modal-form" data-form="expense"><label>What was it for?<input name="label" placeholder="e.g. Dinner at Fisherman’s Wharf" required></label><div class="form-row"><label>Amount (₹)<input name="amount" type="number" min="1" step="0.01" required></label><label>Date<input name="date" type="date" value="${esc(state.data.trip.startDate)}" required></label></div><div class="form-row"><label>Category<select name="category"><option>Food</option><option>Stay</option><option>Travel</option><option>Local travel</option><option>Activities</option><option>Shopping</option><option>Other</option></select></label><label>Paid by<select name="paidBy">${state.data.members.map((member) => `<option>${esc(member.name)}</option>`).join("")}</select></label></div>${actions}</form>`);
    if (type === "traveller") showModal("Add a traveller", `<form class="modal-form" data-form="member"><label>Name<input name="name" placeholder="Traveller’s name" required></label><label>Access role<select name="role"><option>Editor</option><option>Viewer</option></select></label>${actions}</form>`);
    const form = $('[data-form]'); if (form) form.addEventListener("submit", saveForm); const cancel = $('[data-cancel]'); if (cancel) cancel.addEventListener("click", closeModal);
  }

  async function saveForm(event) {
    event.preventDefault();
    const form = event.currentTarget, type = form.dataset.form, values = Object.fromEntries(new FormData(form).entries());
    if (!canAdd(type)) return toast("Global Administrator access required for this action", true);
    const record = { id: uid(), ...values }; if (type === "expense") record.amount = Number(record.amount);
    record.createdBy = state.currentUser;
    const collection = { plan: "itinerary", place: "places", expense: "expenses", member: "members" }[type];
    try {
      if (!state.demoMode) await api(`add${type[0].toUpperCase()}${type.slice(1)}`, { tripId: state.data.trip.tripId, pin: state.pin, record });
      state.data[collection].push(record); closeModal(); render(); hydrateShell(); updatePrintArea(); toast(`${type === "member" ? "Traveller" : type[0].toUpperCase() + type.slice(1)} saved for everyone`);
    } catch (error) { toast(error.message, true); }
  }

  function showInvite() {
    if (!isAdmin()) return toast("Global Administrator access required to invite travellers", true);
    const inviteParams = new URLSearchParams({ trip: state.data.trip.tripId });
    if (!validApiUrl(config.API_URL) && apiUrlReady()) inviteParams.set("api", apiUrl);
    const link = `${location.origin}${location.pathname}?${inviteParams.toString()}`;
    showModal("Invite your travel group", `<div class="invite-box"><p>Share this link and only this trip’s Traveller PIN. Never share the global Administrator password/PIN.</p><div class="copy-field"><input id="inviteLink" value="${esc(link)}" readonly><button id="copyInvite">Copy</button></div><div class="pin-box"><span>TRIP CODE<b>${esc(state.data.trip.tripId)}</b></span><span>TRAVELLER PIN<b>••••</b></span></div><small>The Traveller PIN is different for each trip and is not displayed after creation.</small></div>`);
    $("#copyInvite").addEventListener("click", async () => { try { await navigator.clipboard.writeText(link); } catch {} toast("Invite link copied"); });
  }

  function showSecurity() {
    if (!isAdmin()) return toast("Global Administrator access required for Security settings", true);
    showModal("Security settings", `<form class="modal-form" id="securityForm"><div class="security-note"><i>◆</i><p>The Administrator password/PIN is global and changes access for every trip. The Traveller PIN below changes only for <b>${esc(state.data.trip.name)}</b>.</p></div><label>New global Administrator password/PIN<input name="adminPin" type="password" minlength="6" maxlength="64" autocomplete="new-password" placeholder="6–64 characters" required></label><label>New Traveller PIN for this trip<input name="travellerPin" type="password" inputmode="numeric" minlength="4" maxlength="8" pattern="[0-9]{4,8}" placeholder="4–8 digits" required></label>${actions}</form>`);
    $("#securityForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      if (values.adminPin === values.travellerPin) return toast("The two PINs must be different", true);
      try {
        if (!state.demoMode) await api("changePins", { tripId: state.data.trip.tripId, pin: state.pin, adminPin: values.adminPin, travellerPin: values.travellerPin });
        state.pin = String(values.adminPin); closeModal(); toast("Global Administrator access and this trip’s Traveller PIN were updated");
      } catch (error) { toast(error.message, true); }
    });
    $('[data-cancel]').addEventListener("click", closeModal);
  }

  function showEditTrip() {
    if (!isAdmin()) return toast("Global Administrator access required to edit trip settings", true);
    const trip = state.data.trip;
    showModal("Edit trip settings", `<form class="modal-form" id="editTripForm"><label>Trip name<input name="name" value="${esc(trip.name)}" required></label><label>Destination<input name="destination" value="${esc(trip.destination)}" required></label><div class="form-row"><label>Start date<input name="startDate" type="date" value="${esc(trip.startDate)}" required></label><label>End date<input name="endDate" type="date" value="${esc(trip.endDate)}" required></label></div><label>Total budget (₹)<input name="budget" type="number" min="0" step="0.01" value="${esc(trip.budget)}" required></label>${actions}</form>`);
    $("#editTripForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      if (new Date(values.endDate) < new Date(values.startDate)) return toast("End date cannot be before the start date", true);
      const update = { ...values, budget: Number(values.budget) };
      try {
        if (!state.demoMode) await api("updateTrip", { tripId: trip.tripId, pin: state.pin, trip: update });
        state.data.trip = { ...trip, ...update }; closeModal(); hydrateShell(); render(); updatePrintArea(); toast("Trip settings updated by administrator");
      } catch (error) { toast(error.message, true); }
    });
    $('[data-cancel]').addEventListener("click", closeModal);
  }

  async function deleteItem(sheet, id) {
    if (!isAdmin()) return toast("Global Administrator access required to delete records", true);
    const collection = { Itinerary: "itinerary", Places: "places", Expenses: "expenses", Members: "members" }[sheet];
    try {
      if (!state.demoMode) await api("deleteRecord", { tripId: state.data.trip.tripId, pin: state.pin, sheet, id });
      state.data[collection] = state.data[collection].filter((item) => String(item.id) !== String(id));
      hydrateShell(); render(); updatePrintArea(); toast("Record deleted by administrator");
    } catch (error) { toast(error.message, true); }
  }

  function updatePrintArea() {
    if (!state.data) return; const budget = Number(state.data.trip.budget || 0);
    $("#printArea").innerHTML = `<header><div><span class="kicker">MYTRIP · TRIP BOOK</span><h1>${esc(state.data.trip.name)}</h1><p>${displayDate(state.data.trip.startDate)}–${displayDate(state.data.trip.endDate)} · ${state.data.members.length} travellers</p></div><b>${esc(state.data.trip.tripId)}</b></header><section class="print-plan"><h2>Itinerary</h2>${[...state.data.itinerary].sort((a,b)=>`${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).map((item) => `<article><time>${displayDate(item.date, { weekday:"short", day:"2-digit", month:"short" })} · ${displayTime(item.time)}</time><div><h3>${esc(item.title)}</h3><span>${esc(item.place)}</span><p>${esc(item.notes || "")}</p></div></article>`).join("")}</section><section class="print-expenses"><h2>Expense statement</h2><div class="print-totals"><span><small>Budget</small><b>${money.format(budget)}</b></span><span><small>Spent</small><b>${money.format(spent())}</b></span><span><small>Balance</small><b>${money.format(remaining())}</b></span></div><table><thead><tr><th>Date</th><th>Expense</th><th>Category</th><th>Paid by</th><th>Amount</th></tr></thead><tbody>${state.data.expenses.map((expense) => `<tr><td>${displayDate(expense.date)}</td><td>${esc(expense.label)}</td><td>${esc(expense.category)}</td><td>${esc(expense.paidBy)}</td><td>${money.format(expense.amount)}</td></tr>`).join("")}</tbody></table></section>`;
  }

  function printReport(target) { document.body.dataset.print = target; updatePrintArea(); const clear = () => { delete document.body.dataset.print; removeEventListener("afterprint", clear); }; addEventListener("afterprint", clear); print(); setTimeout(clear, 1200); }

  async function refreshTrip() {
    if (state.demoMode) return toast("Demo data is already up to date");
    try { const data = await api("getTrip", { tripId: state.data.trip.tripId, pin: state.pin }); state.data = normalize(data); state.accessRole = data.accessRole; state.permissions = data.permissions || {}; hydrateShell(); render(); updatePrintArea(); toast("Latest trip data loaded"); } catch (error) { toast(error.message, true); }
  }

  function showCreateTrip() {
    showModal("Create a new trip", `<form class="modal-form" id="createTripForm"><label>Trip name<input name="name" placeholder="e.g. Kerala family holiday" required></label><label>Destination<input name="destination" placeholder="e.g. Kochi, Kerala" required></label><div class="form-row"><label>Start date<input name="startDate" type="date" required></label><label>End date<input name="endDate" type="date" required></label></div><div class="form-row"><label>Total budget (₹)<input name="budget" type="number" min="0" value="50000" required></label><label>Your name<input name="createdBy" required></label></div><label>Global Administrator password/PIN<input name="adminPin" type="password" minlength="6" maxlength="64" autocomplete="current-password" placeholder="Same administrator access for every trip" required></label><label>Traveller PIN for this trip<input name="travellerPin" type="password" inputmode="numeric" minlength="4" maxlength="8" pattern="[0-9]{4,8}" placeholder="4–8 digits" required></label><p class="form-help">Use your one global Administrator password/PIN. Choose a different Traveller PIN for each trip and share only that PIN.</p>${actions}</form>`);
    $("#createTripForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      if (values.adminPin === values.travellerPin) return toast("The Administrator secret and Traveller PIN must be different", true);
      try {
        await ensureCurrentBackend();
        const result = await api("createTrip", { trip: { ...values, budget: Number(values.budget) }, adminPin: values.adminPin, travellerPin: values.travellerPin });
        closeModal(); await openTrip(result, values.adminPin, false, values.createdBy, "administrator"); toast(`Trip created. Code: ${result.trip.tripId}`);
      } catch (error) { toast(error.message, true); }
    });
    $('[data-cancel]').addEventListener("click", closeModal);
  }

  $("#joinForm").addEventListener("submit", (event) => { if (!apiUrlReady()) { event.preventDefault(); event.stopImmediatePropagation(); showBackendSetup(() => $("#joinForm").requestSubmit()); } }, true);
  $("#joinForm").addEventListener("submit", async (event) => { event.preventDefault(); const data = new FormData(event.currentTarget); try { const trip = await api("getTrip", { tripId: String(data.get("tripId")).trim().toUpperCase(), pin: String(data.get("pin")) }); await openTrip(trip, String(data.get("pin")), false); } catch (error) { toast(error.message, true); } });
  $("#adminDemoButton").addEventListener("click", () => openTrip(demo, "654321", true, "Sarada", "administrator"));
  $("#travellerDemoButton").addEventListener("click", () => openTrip(demo, "1234", true, "Anita", "traveller"));
  $("#showAllTripsButton").addEventListener("click", showAllTrips);
  $("#showCreateButton").addEventListener("click", async () => {
    if (!apiUrlReady()) return showBackendSetup(() => $("#showCreateButton").click());
    try { await ensureCurrentBackend(); showCreateTrip(); }
    catch (error) { toast(error.message, true); showBackendSetup(() => $("#showCreateButton").click()); }
  });
  $("#closeModal").addEventListener("click", closeModal); $("#modal").addEventListener("mousedown", (event) => { if (event.target === event.currentTarget) closeModal(); });
  $("#mainNav").addEventListener("click", (event) => { const button = event.target.closest("[data-tab]"); if (button) setTab(button.dataset.tab); });
  $("#inviteButton").addEventListener("click", showInvite); $("#allTripsButton").addEventListener("click", showAllTrips); $("#connectBackendButton").addEventListener("click", () => showBackendSetup()); $("#editTripButton").addEventListener("click", showEditTrip); $("#syncButton").addEventListener("click", refreshTrip); $("#leaveTrip").addEventListener("click", () => location.reload());
  $$('[data-add]').forEach((button) => button.addEventListener("click", () => showAddModal(button.dataset.add)));

  const inviteQuery = new URLSearchParams(location.search);
  const invitedApi = inviteQuery.get("api");
  if (!validApiUrl(config.API_URL) && validApiUrl(invitedApi)) { apiUrl = invitedApi; saveStoredApiUrl(apiUrl); }
  updateBackendStatus();
  if (apiUrlReady()) ensureCurrentBackend().catch(() => {});
  const invitedTrip = inviteQuery.get("trip"); if (invitedTrip) $("#joinTripId").value = invitedTrip.toUpperCase();
})();
