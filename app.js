(() => {
  "use strict";

  const config = window.MYTRIP_CONFIG || {};
  const apiStorageKey = "mytrip_google_backend_url";
  const requiredBackendVersion = "4.3.0";
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

  const state = { data: null, tab: "overview", pin: "", travellerId: "", loginMode: "trip", demoMode: false, mapQuery: "Goa, India", currentUser: "Traveller", accessRole: "traveller", permissions: {} };
  const labels = { overview: "Overview", itinerary: "Itinerary", places: "Places & Map", expenses: "Expenses", people: "Travellers", print: "Print & Export" };
  const demoTrips = [
    { tripId: "GOA26", name: "Goa Escape", destination: "Goa", startDate: "2026-11-19", endDate: "2026-11-23", budget: 85000, spent: 32450, travellerCount: 6, assignedTravellerCount: 3, assignedTravellerIds: ["ANITA-101", "ROHAN-202", "MEERA-303"], enabled: true, createdBy: "Sarada" },
    { tripId: "KER27", name: "Kerala Backwaters", destination: "Alappuzha", startDate: "2027-01-14", endDate: "2027-01-18", budget: 72000, spent: 8400, travellerCount: 4, assignedTravellerCount: 1, assignedTravellerIds: ["ANITA-101"], enabled: true, createdBy: "Sarada" },
    { tripId: "MYS26", name: "Mysuru Weekend", destination: "Mysuru", startDate: "2026-09-05", endDate: "2026-09-07", budget: 28000, spent: 12650, travellerCount: 3, assignedTravellerCount: 0, assignedTravellerIds: [], enabled: false, createdBy: "Sarada" }
  ];
  const demoTraveller = { travellerId: "ANITA-101", name: "Anita", active: true };
  const demoTravellerAccounts = [
    { travellerId: "ANITA-101", name: "Anita", email: "anita@example.com", phone: "+91 98765 43210", city: "Bengaluru", emergencyContact: "Ravi · +91 90000 10001", notes: "Vegetarian meals", active: true, tripCount: 2, tripIds: ["GOA26", "KER27"] },
    { travellerId: "ROHAN-202", name: "Rohan", email: "rohan@example.com", phone: "+91 98765 43211", city: "Mysuru", emergencyContact: "", notes: "", active: true, tripCount: 1, tripIds: ["GOA26"] },
    { travellerId: "MEERA-303", name: "Meera", email: "", phone: "+91 98765 43212", city: "Bengaluru", emergencyContact: "", notes: "", active: false, tripCount: 1, tripIds: ["GOA26"] }
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

  function backendVersionAtLeast(version, required) {
    const currentParts = String(version || "0").split(".").map((part) => Number.parseInt(part, 10) || 0);
    const requiredParts = String(required || "0").split(".").map((part) => Number.parseInt(part, 10) || 0);
    for (let index = 0; index < Math.max(currentParts.length, requiredParts.length); index++) {
      if ((currentParts[index] || 0) > (requiredParts[index] || 0)) return true;
      if ((currentParts[index] || 0) < (requiredParts[index] || 0)) return false;
    }
    return true;
  }

  function backendUpgradeError(version) {
    const shownVersion = version ? `version ${version}` : "an old version";
    const error = new Error(`Your Google backend is ${shownVersion}. Replace Code.gs with MyTrip version ${requiredBackendVersion}, run setupMyTrip(), then deploy a New version in Apps Script.`);
    error.code = "BACKEND_UPGRADE_REQUIRED";
    return error;
  }

  async function verifyBackendVersion(url = apiUrl) {
    const info = await requestAt(url, "ping");
    backendVersion = String(info && info.version || "");
    if (!backendVersionAtLeast(backendVersion, requiredBackendVersion)) throw backendUpgradeError(backendVersion);
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
    return { trip: data.trip || {}, members: data.members || [], assignments: data.assignments || [], places: data.places || [], itinerary: data.itinerary || [], expenses: (data.expenses || []).map((item) => ({ ...item, amount: Number(item.amount || 0) })) };
  }

  function isAdmin() { return state.accessRole === "administrator"; }
  function canAdd(type) { return ["plan", "place", "expense"].includes(type) || isAdmin(); }
  function canEditRecords() { return isAdmin() || state.permissions.editRecords !== false; }
  function authPayload(payload = {}) { return { tripId: state.data.trip.tripId, pin: state.pin, ...(state.travellerId ? { travellerId: state.travellerId } : {}), ...payload }; }

  async function openTrip(data, pin, demoMode, name, roleOverride, travellerId = "", loginMode = "trip") {
    state.data = normalize(clone(data)); state.pin = pin; state.demoMode = demoMode; state.currentUser = name || data.trip.createdBy || "Traveller";
    state.accessRole = roleOverride || data.accessRole || "traveller";
    state.travellerId = travellerId; state.loginMode = loginMode;
    state.permissions = data.permissions || {};
    $("#accessScreen").classList.add("hidden"); $("#dashboard").classList.remove("hidden");
    setTab("overview"); hydrateShell(); updatePrintArea();
  }

  function hydrateShell() {
    const { trip, members } = state.data;
    $("#tripTitle").textContent = `${trip.destination || trip.name}, here we come!`;
    $("#tripMeta").textContent = `${displayDate(trip.startDate, { day: "numeric", month: "long", year: "numeric" })}–${displayDate(trip.endDate, { day: "numeric", month: "long", year: "numeric" })} · ${nights()} nights · ${members.length} travellers`;
    $("#tripIdChip").innerHTML = `<small>TRIP ID</small><strong>${esc(trip.tripId)}</strong>`;
    const enabled = trip.enabled !== false && String(trip.enabled).toUpperCase() !== "FALSE";
    $("#tripStatus").textContent = enabled ? "● ACTIVE TRIP" : "● DISABLED TRIP";
    $("#tripStatus").classList.toggle("disabled", !enabled);
    $("#tripStatusButton").textContent = enabled ? "Disable trip" : "Enable trip";
    $("#sideTripName").textContent = trip.name; $("#sideTripDates").textContent = `${displayDate(trip.startDate, { day: "numeric", month: "short" })}–${displayDate(trip.endDate, { day: "numeric", month: "short", year: "numeric" })}`; $("#sideTripCode").textContent = `TRIP ID · ${trip.tripId}`;
    $("#currentUser").textContent = state.currentUser;
    $("#currentRoleLabel").textContent = isAdmin() ? "Global Administrator" : (state.travellerId ? `Traveller ID: ${state.travellerId}` : "Shared trip access");
    $("#accessBadge").textContent = isAdmin() ? "ADMINISTRATOR" : "TRAVELLER";
    $("#accessBadge").classList.toggle("traveller", !isAdmin());
    $("#inviteButton").classList.toggle("hidden", !isAdmin());
    $("#allTripsButton").classList.toggle("hidden", !isAdmin() && !state.travellerId);
    $("#allTripsButton").textContent = isAdmin() ? "◆ All trips" : "♙ My trips";
    $("#editTripButton").classList.toggle("hidden", !isAdmin());
    $("#tripStatusButton").classList.toggle("hidden", !isAdmin());
    $("#deleteTripButton").classList.toggle("hidden", !isAdmin());
    $("#topAvatars").innerHTML = members.slice(0, 3).map((member) => `<span title="${esc(member.name)}">${esc(initials(member.name))}</span>`).join("") + (members.length > 3 ? `<span>+${members.length - 3}</span>` : "");
  }

  function setTab(tab) {
    state.tab = tab; $("#crumbLabel").textContent = labels[tab];
    $$('[data-tab]').forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
    render(); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function heading(kicker, title, action = "", add = "") { return `<div class="view-head"><div><span class="kicker">${kicker}</span><h2>${title}</h2><p>${action}</p></div>${add && canAdd(add) ? `<button class="primary" data-add="${add}">＋ Add ${add}</button>` : ""}</div>`; }
  function panelHead(kicker, title, tab) { return `<div class="panel-head"><div><span class="kicker">${kicker}</span><h2>${title}</h2></div>${tab ? `<button data-go="${tab}">View all →</button>` : ""}</div>`; }
  function accessNotice() { const personal = Boolean(state.travellerId); return `<section class="permission-banner ${isAdmin() ? "admin" : "traveller"}"><i>${isAdmin() ? "◆" : "♙"}</i><div><b>${isAdmin() ? "Global Administrator access" : (personal ? `Personal traveller access · ${esc(state.travellerId)}` : "Shared trip access")}</b><p>${isAdmin() ? "Open every trip, assign travellers, edit details, disable access or permanently delete a trip." : "View and edit plans, places and expenses for this trip."}</p></div>${isAdmin() ? `<button data-all-trips>All trips</button><button data-security>Security</button>` : (personal ? `<button data-my-trips>My trips</button>` : `<span>SHARED TRIP</span>`)}</section>`; }

  function renderOverview() {
    const budget = Number(state.data.trip.budget || 0), total = spent(), percent = budget ? Math.min(100, Math.round(total / budget * 100)) : 0;
    const upcoming = [...state.data.itinerary].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).slice(0, 3);
    return `<section class="quick-actions" aria-label="Quick actions"><button data-add="plan"><i>＋</i><span><b>Add plan</b><small>Itinerary</small></span></button><button data-add="expense"><i>₹</i><span><b>Add expense</b><small>Spending</small></span></button><button data-add="place"><i>⌖</i><span><b>Add place</b><small>Map</small></span></button><button data-go="people"><i>♙</i><span><b>Travellers</b><small>PINs & access</small></span></button><button data-go="itinerary"><i>▦</i><span><b>Full plan</b><small>All days</small></span></button><button data-go="print"><i>▤</i><span><b>Print</b><small>Reports</small></span></button></section><section class="stats"><article class="stat"><i>◫</i><div><small>TRIP LENGTH</small><strong>${nights()} nights</strong><span>${displayDate(state.data.trip.startDate, { day: "numeric", month: "short" })}–${displayDate(state.data.trip.endDate, { day: "numeric", month: "short" })}</span></div></article><article class="stat"><i>₹</i><div><small>TOTAL BUDGET</small><strong>${money.format(budget)}</strong><span>${money.format(remaining())} remaining</span></div></article><article class="stat"><i>◎</i><div><small>PLACES SAVED</small><strong>${state.data.places.length}</strong><span>${state.data.places.filter((place) => place.plannedDay !== "Unplanned").length} planned</span></div></article><article class="stat"><i>♙</i><div><small>TRAVELLERS</small><strong>${state.data.members.length}</strong><span>Sharing this trip</span></div></article></section>
      <section class="main-grid"><article class="panel">${panelHead("WHAT’S NEXT", "Upcoming itinerary", "itinerary")}<div class="timeline">${upcoming.map((item) => `<div class="timeline-row"><span class="date"><small>${displayDate(item.date, { weekday: "short" }).toUpperCase()}</small><b>${displayDate(item.date, { day: "2-digit" })}</b></span><time>${displayTime(item.time)}</time><span><h3>${esc(item.title)}</h3><p>⌖ ${esc(item.place)}</p></span><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.place)}" target="_blank" rel="noreferrer">Map ↗</a></div>`).join("") || `<p>No plans yet.</p>`}</div><button class="dashed" data-add="plan">＋ Add something to the plan</button></article>
      <article class="panel">${panelHead("SPENDING", "Budget snapshot", "expenses")}<div class="budget"><div class="donut" style="background:conic-gradient(var(--coral) ${percent}%,#e9edef 0)"><b>${percent}%</b></div><div><small>TOTAL SPENT</small><strong>${money.format(total)}</strong><span>of ${money.format(budget)} budget</span></div></div><div class="progress"><i style="width:${percent}%"></i></div></article>
      <article class="panel">${panelHead("YOUR MAP", "Saved places", "places")}<div class="timeline">${state.data.places.slice(0, 4).map((place) => `<div class="expense-mini"><i>⌖</i><span><b>${esc(place.name)}</b><small>${esc(place.area)} · ${esc(place.category)}</small></span><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name}, ${place.area}`)}" target="_blank" rel="noreferrer">Map ↗</a></div>`).join("")}</div></article>
      <article class="panel">${panelHead("LATEST", "Recent expenses", "expenses")}<div>${state.data.expenses.slice(0, 3).map((expense) => `<div class="expense-mini"><i>₹</i><span><b>${esc(expense.label)}</b><small>Paid by ${esc(expense.paidBy)}</small></span><strong>${money.format(expense.amount)}</strong></div>`).join("")}</div><button class="dashed" data-add="expense">＋ Add an expense</button></article></section>`;
  }

  function renderItinerary() {
    const items = [...state.data.itinerary].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
    return `${heading("DAY BY DAY", "Trip itinerary", "Travellers can add and edit plans. The administrator can also delete them.", "plan")}<div class="filter-row"><button class="active">All days</button>${[...new Set(items.map((item) => item.date))].map((date) => `<button>${displayDate(date, { weekday: "short", day: "numeric" })}</button>`).join("")}</div><div class="plan-list">${items.map((item) => `<article class="plan-item"><span class="date"><small>${displayDate(item.date, { weekday: "short" }).toUpperCase()}</small><b>${displayDate(item.date, { day: "2-digit" })}</b></span><time>${displayTime(item.time)}</time><div><h3>${esc(item.title)}</h3><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.place)}" target="_blank" rel="noreferrer">⌖ ${esc(item.place)}</a><p>${esc(item.notes || "")}</p></div><span class="record-actions">${canEditRecords() ? `<button class="edit-control" data-edit data-sheet="Itinerary" data-id="${esc(item.id)}">Edit</button>` : ""}${isAdmin() ? `<button class="delete-control" data-delete data-sheet="Itinerary" data-id="${esc(item.id)}">Delete</button>` : ""}</span></article>`).join("")}</div>`;
  }

  function renderPlaces() {
    return `${heading("DISCOVER & SAVE", "Places and map", "Travellers can save and edit places; the administrator can also remove them.", "place")}<div class="map-search"><input id="mapQuery" value="${esc(state.mapQuery)}" aria-label="Search Google Maps"><button id="mapSearchButton">⌖ Search Google Maps</button></div><div class="places-layout"><div class="map-frame"><iframe title="Trip map" src="https://www.google.com/maps?q=${encodeURIComponent(state.mapQuery)}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div><div class="places-list">${state.data.places.map((place) => `<article class="place"><i class="place-icon">⌖</i><div><h3>${esc(place.name)}</h3><p>${esc(place.area)} · ${esc(place.category)}</p><small>${esc(place.plannedDay || "Unplanned")}</small></div><span class="row-actions"><button data-map="${esc(`${place.name}, ${place.area}`)}">Map ↗</button>${canEditRecords() ? `<button class="edit-control mini" data-edit data-sheet="Places" data-id="${esc(place.id)}">Edit</button>` : ""}${isAdmin() ? `<button class="delete-control mini" data-delete data-sheet="Places" data-id="${esc(place.id)}">×</button>` : ""}</span></article>`).join("")}</div></div>`;
  }

  function renderExpenses() {
    const budget = Number(state.data.trip.budget || 0), total = spent();
    return `${heading("SHARED SPENDING", "Trip expenses", "Travellers can add and edit spending. The administrator can also delete entries.", "expense")}<section class="expense-summary"><article class="summary-card"><small>TOTAL BUDGET</small><strong>${money.format(budget)}</strong><span>Set by organiser</span></article><article class="summary-card"><small>SPENT SO FAR</small><strong>${money.format(total)}</strong><span>${budget ? Math.round(total / budget * 100) : 0}% of budget</span></article><article class="summary-card"><small>AVAILABLE</small><strong>${money.format(budget - total)}</strong><span>For the rest of the trip</span></article></section><section class="table-panel"><div class="table-headline"><div><span class="kicker">ALL ENTRIES</span><h2>Expense details</h2></div><button data-print="expenses">▤ Print expenses</button></div><div class="expense-table"><div class="expense-table-header"><span>EXPENSE</span><span>DATE</span><span>CATEGORY</span><span>PAID BY</span><span>AMOUNT</span></div>${state.data.expenses.map((expense) => `<div class="expense-row"><span><i>₹</i>${esc(expense.label)}</span><span>${displayDate(expense.date)}</span><span>${esc(expense.category)}</span><span>${esc(expense.paidBy)}</span><span class="amount-cell"><strong>${money.format(expense.amount)}</strong>${canEditRecords() ? `<button class="edit-control mini" data-edit data-sheet="Expenses" data-id="${esc(expense.id)}">Edit</button>` : ""}${isAdmin() ? `<button class="delete-control mini" data-delete data-sheet="Expenses" data-id="${esc(expense.id)}">×</button>` : ""}</span></div>`).join("")}</div></section>`;
  }

  function renderPeople() {
    const totals = Object.fromEntries(state.data.members.map((member) => [member.name, state.data.expenses.filter((expense) => expense.paidBy === member.name).reduce((sum, expense) => sum + Number(expense.amount), 0)]));
    return `${heading("YOUR TRAVEL GROUP", "Travellers and personal PINs", isAdmin() ? "Give every traveller a separate personal PIN; the administrator can edit any personal PIN." : "Your personal PIN opens every trip assigned to your Traveller ID.", "travellers")}<div class="share-banner"><div><h3>Separate secure access for every traveller</h3><p>Trip ID <b>${esc(state.data.trip.tripId)}</b> · Each traveller signs in with their own Traveller ID and PIN</p></div>${isAdmin() ? `<span class="banner-actions"><button data-add="travellers">＋ Add travellers with PINs</button><button data-all-trips>All trips</button><button data-security>⚿ Security</button></span>` : `<span class="readonly-label">PERSONAL ACCESS</span>`}</div><div class="people-grid">${state.data.members.map((member) => `<article class="person ${member.travellerId ? "personal-access" : "shared-only"}"><i>${esc(initials(member.name))}</i><div><h3>${esc(member.name)}</h3><p>${member.travellerId ? `Traveller ID · ${esc(member.travellerId)}` : (member.role === "Organiser" ? "Trip organiser · Administrator access" : "No personal PIN yet")}</p></div><span>${esc(member.role)}</span><div class="person-access-badge ${member.travellerId ? "enabled" : "pending"}">${member.travellerId ? "PERSONAL PIN ENABLED" : (member.role === "Organiser" ? "ADMIN" : "PIN REQUIRED")}</div><footer><span><small>PAID FOR TRIP</small><b>${money.format(totals[member.name] || 0)}</b></span><span class="person-footer-actions">${isAdmin() && member.travellerId ? `<button class="pin-reset-control" data-reset-member-pin="${esc(member.id)}" aria-label="Edit PIN for ${esc(member.name)}">✎ Edit PIN</button>` : ""}${isAdmin() && !member.travellerId && member.role !== "Organiser" ? `<button class="pin-reset-control" data-give-pin="${esc(member.id)}" aria-label="Create PIN for ${esc(member.name)}">＋ Create PIN</button>` : ""}${isAdmin() && member.role !== "Organiser" ? `<button class="delete-control" data-delete data-sheet="Members" data-id="${esc(member.id)}">Remove</button>` : ""}</span></footer></article>`).join("")}</div>`;
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
    $$('[data-my-trips]').forEach((button) => button.addEventListener("click", showMyTrips));
    $$('[data-security]').forEach((button) => button.addEventListener("click", showSecurity));
    $$('[data-edit]').forEach((button) => button.addEventListener("click", () => showEditRecord(button.dataset.sheet, button.dataset.id)));
    $$('[data-give-pin]').forEach((button) => button.addEventListener("click", () => showAddTravellersToCurrentTrip(state.data.members.find((member) => String(member.id) === String(button.dataset.givePin)))));
    $$('[data-reset-member-pin]').forEach((button) => button.addEventListener("click", () => showResetCurrentTravellerPin(state.data.members.find((member) => String(member.id) === String(button.dataset.resetMemberPin)))));
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
    showModal("Connect Google backend", `<form class="modal-form" id="backendForm"><div class="setup-note"><i>G</i><div><b>MyTrip backend version 4.3 required</b><p>Replace your Apps Script <code>Code.gs</code>, run <code>setupMyTrip()</code>, and deploy a <b>New version</b>. Version 4.3 gives every traveller separate personal access and supports adding several travellers to one trip.</p></div></div><label>Google Apps Script Web App URL<input name="apiUrl" type="url" value="${esc(apiUrl)}" placeholder="https://script.google.com/macros/s/…/exec" autocomplete="url" required></label><p class="form-help">Use the deployed <b>/exec</b> URL, not the testing <b>/dev</b> URL. The connection and backend version are checked before they are saved.</p><a class="setup-guide-link" href="SETUP-GUIDE.md" target="_blank" rel="noreferrer">Open the Google setup guide ↗</a><div class="form-actions"><button type="button" data-cancel>Cancel</button><button type="submit">Test version 4.3 & connect</button></div></form>`);
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
        submit.disabled = false; submit.textContent = "Test version 4.3 & connect";
      }
    });
    $('[data-cancel]').addEventListener("click", closeModal);
  }

  function tripEnabled(trip) { return trip.enabled !== false && String(trip.enabled).toUpperCase() !== "FALSE"; }

  async function openListedTrip(tripId, pin, demoMode, role, traveller) {
    try {
      if (demoMode) {
        const summary = demoTrips.find((trip) => trip.tripId === tripId) || demoTrips[0];
        const bundle = clone(demo); bundle.trip = { ...bundle.trip, ...summary };
        closeModal(); await openTrip(bundle, pin, true, traveller ? traveller.name : summary.createdBy, role, traveller ? traveller.travellerId : "", traveller ? "personal" : "admin");
      } else {
        const payload = { tripId, pin, ...(traveller ? { travellerId: traveller.travellerId } : {}) };
        const bundle = await api("getTrip", payload);
        closeModal(); await openTrip(bundle, pin, false, traveller ? traveller.name : bundle.trip.createdBy, role, traveller ? traveller.travellerId : "", traveller ? "personal" : "admin");
      }
    } catch (error) { toast(error.message, true); }
  }

  function renderAllTrips(trips, administratorSecret, demoMode) {
    const items = trips || [];
    showModal("Administrator · All trips", `<div class="all-trips-modal"><div class="all-trips-summary"><span><small>ADMINISTRATOR LIBRARY</small><b>${items.length} ${items.length === 1 ? "trip" : "trips"}</b></span><span class="summary-actions"><button id="manageTravellerAccounts" class="secondary-action" type="button">♙ Traveller profiles</button><button id="createFromTrips" type="button">＋ Create trip</button></span></div><div class="trip-library admin-library">${items.map((trip) => `<article class="trip-library-card ${tripEnabled(trip) ? "" : "disabled-trip"}"><i>⌖</i><div class="trip-card-copy"><span class="trip-code">TRIP ID · ${esc(trip.tripId)}</span><h3>${esc(trip.name)}</h3><p>${esc(trip.destination)} · ${displayDate(trip.startDate, { day: "numeric", month: "short", year: "numeric" })}–${displayDate(trip.endDate, { day: "numeric", month: "short", year: "numeric" })}</p><small>Budget ${money.format(Number(trip.budget || 0))} · Spent ${money.format(Number(trip.spent || 0))} · Organiser ${esc(trip.createdBy || "—")}</small><small>${Number(trip.travellerCount || 0)} members · ${Number(trip.assignedTravellerCount || 0)} assigned profiles${trip.updatedAt ? ` · Updated ${displayDate(String(trip.updatedAt).slice(0, 10))}` : ""}</small><b class="status-pill ${tripEnabled(trip) ? "active" : "disabled"}">${tripEnabled(trip) ? "ACTIVE" : "DISABLED"}</b></div><div class="trip-card-actions"><button data-open-admin-trip="${esc(trip.tripId)}" type="button">Open</button><button data-edit-listed-trip="${esc(trip.tripId)}" type="button">Edit</button><button data-assign-trip="${esc(trip.tripId)}" type="button">Travellers</button><button data-toggle-trip="${esc(trip.tripId)}" data-enabled="${tripEnabled(trip)}" type="button">${tripEnabled(trip) ? "Disable" : "Enable"}</button><button class="danger-link" data-delete-trip="${esc(trip.tripId)}" type="button">Delete</button></div></article>`).join("") || `<div class="empty-trips"><b>No trips yet</b><p>Create your first trip with this Administrator password/PIN.</p></div>`}</div><p class="global-access-note">◆ This one Administrator PIN controls every trip. Traveller profiles can exist without any trip assignment.</p></div>`);
    $("#createFromTrips").addEventListener("click", () => { closeModal(); showCreateTrip(); });
    $("#manageTravellerAccounts").addEventListener("click", () => loadTravellerAccounts(administratorSecret, items, demoMode));
    $$('[data-open-admin-trip]').forEach((button) => button.addEventListener("click", () => openListedTrip(button.dataset.openAdminTrip, administratorSecret, demoMode, "administrator")));
    $$('[data-edit-listed-trip]').forEach((button) => button.addEventListener("click", async () => { await openListedTrip(button.dataset.editListedTrip, administratorSecret, demoMode, "administrator"); showEditTrip(); }));
    $$('[data-assign-trip]').forEach((button) => button.addEventListener("click", () => showTripTravellerAssignments(items.find((trip) => trip.tripId === button.dataset.assignTrip), items, administratorSecret, demoMode)));
    $$('[data-toggle-trip]').forEach((button) => button.addEventListener("click", async () => {
      const tripId = button.dataset.toggleTrip, enabled = button.dataset.enabled !== "true";
      try {
        if (demoMode) { const trip = demoTrips.find((item) => item.tripId === tripId); if (trip) trip.enabled = enabled; }
        else await api("setTripEnabled", { tripId, pin: administratorSecret, enabled });
        toast(`Trip ${enabled ? "enabled" : "disabled"}`); await loadAllTrips(administratorSecret, demoMode);
      } catch (error) { toast(error.message, true); }
    }));
    $$('[data-delete-trip]').forEach((button) => button.addEventListener("click", () => showDeleteTripConfirmation(button.dataset.deleteTrip, administratorSecret, demoMode)));
  }

  function showDeleteTripConfirmation(tripId, administratorSecret = state.pin, demoMode = state.demoMode) {
    showModal("Permanently delete trip", `<form class="modal-form" id="deleteTripForm"><div class="danger-note"><b>This cannot be undone</b><p>All plans, places, expenses, members and traveller assignments for <strong>${esc(tripId)}</strong> will be deleted.</p></div><label>Type the exact Trip ID to confirm<input name="confirmTripId" autocomplete="off" placeholder="${esc(tripId)}" required></label><div class="form-actions"><button type="button" data-cancel>Cancel</button><button class="danger-submit" type="submit">Delete permanently</button></div></form>`);
    $("#deleteTripForm").addEventListener("submit", async (event) => {
      event.preventDefault(); const confirmation = String(new FormData(event.currentTarget).get("confirmTripId") || "").trim().toUpperCase();
      if (confirmation !== tripId) return toast(`Type ${tripId} exactly`, true);
      try {
        if (demoMode) { const index = demoTrips.findIndex((trip) => trip.tripId === tripId); if (index >= 0) demoTrips.splice(index, 1); }
        else await api("deleteTrip", { tripId, pin: administratorSecret, confirmTripId: confirmation });
        toast(`Trip ${tripId} deleted`); await loadAllTrips(administratorSecret, demoMode);
      } catch (error) { toast(error.message, true); }
    });
    $('[data-cancel]').addEventListener("click", closeModal);
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

  async function loadMyTrips(pin, traveller, demoMode) {
    try {
      if (!demoMode) await ensureCurrentBackend();
      const result = demoMode ? { traveller, trips: demoTrips.filter((trip) => tripEnabled(trip) && traveller.tripIds.includes(trip.tripId)) } : await api("listMyTrips", { travellerId: traveller.travellerId, pin });
      renderMyTrips(result.trips || [], pin, result.traveller || traveller, demoMode);
    } catch (error) { toast(error.message, true); }
  }

  function renderMyTrips(trips, pin, traveller, demoMode) {
    showModal("Traveller profile · My trips", `<div class="all-trips-modal"><div class="self-profile-card"><i>${esc(initials(traveller.name))}</i><div><span>TRAVELLER ID · ${esc(traveller.travellerId)}</span><h3>${esc(traveller.name)}</h3><p>${[traveller.phone, traveller.email, traveller.city].filter(Boolean).map(esc).join(" · ") || "Personal traveller profile"}</p></div><b>${trips.length} ${trips.length === 1 ? "ALLOWED TRIP" : "ALLOWED TRIPS"}</b></div><div class="profile-trip-heading self"><div><span class="kicker">ALL MY TRIPS</span><h3>Trips available with this personal PIN</h3></div></div><div class="trip-library">${trips.map((trip) => `<article class="trip-library-card"><i>♙</i><div><span class="trip-code">TRIP ID · ${esc(trip.tripId)}</span><h3>${esc(trip.name)}</h3><p>${esc(trip.destination)} · ${displayDate(trip.startDate, { day: "numeric", month: "short", year: "numeric" })}–${displayDate(trip.endDate, { day: "numeric", month: "short", year: "numeric" })}</p><small>${Number(trip.travellerCount || 0)} travellers · ${money.format(Number(trip.spent || 0))} spent</small></div><button data-open-my-trip="${esc(trip.tripId)}" type="button">Open →</button></article>`).join("") || `<div class="empty-trips"><b>No active trips assigned</b><p>Ask the administrator to assign trips to Traveller ID ${esc(traveller.travellerId)}.</p></div>`}</div><p class="global-access-note">♙ This permanent profile automatically shows every active trip assigned now or in the future.</p></div>`);
    $$('[data-open-my-trip]').forEach((button) => button.addEventListener("click", () => openListedTrip(button.dataset.openMyTrip, pin, demoMode, "traveller", traveller)));
  }

  function showMyTrips() {
    if (!apiUrlReady() && !state.demoMode) return showBackendSetup(showMyTrips);
    if (state.travellerId) return loadMyTrips(state.pin, { travellerId: state.travellerId, name: state.currentUser, tripIds: demoTraveller.tripIds || ["GOA26", "KER27"] }, state.demoMode);
    showModal("Traveller · My trips", `<form class="modal-form" id="myTripsLoginForm"><div class="security-note traveller-note"><i>♙</i><p>Enter the Traveller ID and personal PIN created by your administrator. One login shows every trip assigned to you.</p></div><label>Traveller ID<input name="travellerId" maxlength="30" autocomplete="username" placeholder="e.g. ANITA-101" required></label><label>Personal Traveller PIN<input name="pin" type="password" inputmode="numeric" minlength="4" maxlength="8" autocomplete="current-password" placeholder="4–8 digits" required></label><div class="form-actions"><button type="button" data-cancel>Cancel</button><button type="submit">View my trips</button></div></form>`);
    $("#myTripsLoginForm").addEventListener("submit", async (event) => {
      event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      await loadMyTrips(String(values.pin), { travellerId: String(values.travellerId).trim().toUpperCase(), name: "Traveller", tripIds: [] }, false);
    });
    $('[data-cancel]').addEventListener("click", closeModal);
  }

  async function loadTravellerAccounts(administratorSecret, trips, demoMode) {
    try {
      const travellers = demoMode ? demoTravellerAccounts : (await api("listTravellerAccounts", { pin: administratorSecret })).travellers;
      renderTravellerAccounts(travellers || [], trips || [], administratorSecret, demoMode);
    } catch (error) { toast(error.message, true); }
  }

  function renderTravellerAccounts(travellers, trips, administratorSecret, demoMode) {
    showModal("Traveller profiles", `<div class="traveller-manager"><div class="all-trips-summary"><span><small>PERMANENT TRAVELLER DIRECTORY</small><b>${travellers.length} profiles</b></span><span class="summary-actions"><button id="backToAllTrips" class="secondary-action" type="button">← All trips</button><button id="createTravellerAccount" type="button">＋ Add traveller</button></span></div><p class="directory-note">Every profile remains in this directory. All trips assigned now or later are collected under the same Traveller ID.</p><div class="account-list">${travellers.map((traveller) => `<article class="account-card ${traveller.active ? "" : "inactive"}"><span class="account-avatar">${esc(initials(traveller.name))}</span><div class="account-profile"><span>${esc(traveller.travellerId)}</span><h3>${esc(traveller.name)}</h3><p>${[traveller.phone, traveller.email].filter(Boolean).map(esc).join(" · ") || "Contact details not added"}</p><small>${[traveller.city, traveller.emergencyContact ? `Emergency: ${traveller.emergencyContact}` : ""].filter(Boolean).map(esc).join(" · ") || "City and emergency contact not added"}</small><div class="account-trip-status ${Number(traveller.tripCount || 0) ? "assigned" : "unassigned"}">${Number(traveller.tripCount || 0) ? `${Number(traveller.tripCount)} assigned ${Number(traveller.tripCount) === 1 ? "trip" : "trips"}: ${(traveller.tripIds || []).map(esc).join(", ")}` : "NO TRIP ASSIGNED"}</div></div><div class="account-actions"><button data-view-account="${esc(traveller.travellerId)}">View profile</button><button data-account-trips="${esc(traveller.travellerId)}">Assign trips</button><button class="pin-account-control" data-reset-account="${esc(traveller.travellerId)}">✎ Edit PIN</button><button data-toggle-account="${esc(traveller.travellerId)}" data-active="${Boolean(traveller.active)}">${traveller.active ? "Disable" : "Enable"}</button></div></article>`).join("") || `<div class="empty-trips"><b>No traveller profiles</b><p>Add a traveller profile now. A trip does not need to be assigned.</p></div>`}</div></div>`);
    $("#backToAllTrips").addEventListener("click", () => renderAllTrips(trips, administratorSecret, demoMode));
    $("#createTravellerAccount").addEventListener("click", () => showCreateTravellerAccount(trips, administratorSecret, demoMode));
    $$('[data-view-account]').forEach((button) => button.addEventListener("click", () => showTravellerProfile(travellers.find((item) => item.travellerId === button.dataset.viewAccount), trips, administratorSecret, demoMode)));
    $$('[data-account-trips]').forEach((button) => button.addEventListener("click", () => showTravellerTripAssignments(travellers.find((item) => item.travellerId === button.dataset.accountTrips), trips, administratorSecret, demoMode)));
    $$('[data-reset-account]').forEach((button) => button.addEventListener("click", () => showResetTravellerPin(travellers.find((item) => item.travellerId === button.dataset.resetAccount), trips, administratorSecret, demoMode)));
    $$('[data-toggle-account]').forEach((button) => button.addEventListener("click", async () => {
      const travellerId = button.dataset.toggleAccount, active = button.dataset.active !== "true";
      try {
        if (demoMode) { const account = demoTravellerAccounts.find((item) => item.travellerId === travellerId); if (account) account.active = active; }
        else await api("setTravellerActive", { pin: administratorSecret, travellerId, active });
        toast(`Traveller account ${active ? "enabled" : "disabled"}`); await loadTravellerAccounts(administratorSecret, trips, demoMode);
      } catch (error) { toast(error.message, true); }
    }));
  }

  function showCreateTravellerAccount(trips, administratorSecret, demoMode) {
    showModal("Add traveller profile", `<form class="modal-form" id="createTravellerAccountForm"><div class="security-note traveller-note"><i>♙</i><p>This saves an independent traveller profile. <b>No trip will be assigned automatically.</b></p></div><div class="form-row"><label>Traveller name<input name="name" maxlength="80" placeholder="e.g. Anita Sutar" required></label><label>Traveller ID <small>(optional)</small><input name="travellerId" maxlength="30" placeholder="Generated if blank"></label></div><div class="form-row"><label>Phone<input name="phone" type="tel" maxlength="30" placeholder="e.g. +91 98765 43210"></label><label>Email<input name="email" type="email" maxlength="120" placeholder="name@example.com"></label></div><label>City or location<input name="city" maxlength="80" placeholder="e.g. Bengaluru"></label><label>Emergency contact<input name="emergencyContact" maxlength="120" placeholder="Name and phone number"></label><label>Notes<textarea name="notes" rows="3" maxlength="1000" placeholder="Food preference, accessibility requirement or other useful note"></textarea></label><label>Personal PIN<input name="pin" type="password" inputmode="numeric" minlength="4" maxlength="8" pattern="[0-9]{4,8}" placeholder="4–8 digits" required></label><p class="form-help">After saving, the profile will show <b>No trip assigned</b>. Assign one or more trips only when required.</p><div class="form-actions"><button type="button" data-cancel>Cancel</button><button type="submit">Save without trip</button></div></form>`);
    $("#createTravellerAccountForm").addEventListener("submit", async (event) => {
      event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      try {
        let created;
        if (demoMode) { created = { ...values, travellerId: String(values.travellerId || `TRV-${Math.floor(100 + Math.random() * 900)}`).toUpperCase(), active: true, tripCount: 0, tripIds: [] }; delete created.pin; demoTravellerAccounts.push(created); }
        else created = await api("createTravellerAccount", { pin: administratorSecret, traveller: values });
        toast(`Traveller profile saved without a trip · ID ${created.travellerId}`); await loadTravellerAccounts(administratorSecret, trips, demoMode);
      } catch (error) { toast(error.message, true); }
    });
    $('[data-cancel]').addEventListener("click", () => loadTravellerAccounts(administratorSecret, trips, demoMode));
  }

  function showTravellerProfile(traveller, trips, administratorSecret, demoMode) {
    if (!traveller) return toast("Traveller profile not found", true);
    const allowed = (traveller.tripIds || []).map((tripId) => trips.find((trip) => trip.tripId === tripId)).filter(Boolean);
    showModal("Traveller profile", `<div class="traveller-profile-view"><div class="profile-hero"><i>${esc(initials(traveller.name))}</i><div><span>${esc(traveller.travellerId)}</span><h2>${esc(traveller.name)}</h2><p>${traveller.active ? "Active personal access" : "Inactive personal access"}</p></div></div><div class="profile-detail-grid"><span><small>PHONE</small><b>${esc(traveller.phone || "Not added")}</b></span><span><small>EMAIL</small><b>${esc(traveller.email || "Not added")}</b></span><span><small>CITY</small><b>${esc(traveller.city || "Not added")}</b></span><span><small>EMERGENCY CONTACT</small><b>${esc(traveller.emergencyContact || "Not added")}</b></span></div>${traveller.notes ? `<div class="profile-notes"><small>NOTES</small><p>${esc(traveller.notes)}</p></div>` : ""}<div class="profile-trip-heading"><div><span class="kicker">ALLOWED TRIPS</span><h3>${allowed.length} ${allowed.length === 1 ? "trip" : "trips"} in this profile</h3></div><button id="profileAssignTrips" type="button">Manage trips</button></div><div class="profile-trip-list">${allowed.map((trip) => `<article><div><span>TRIP ID · ${esc(trip.tripId)}</span><h4>${esc(trip.name)}</h4><p>${esc(trip.destination)} · ${displayDate(trip.startDate, { day: "numeric", month: "short", year: "numeric" })}–${displayDate(trip.endDate, { day: "numeric", month: "short", year: "numeric" })}</p></div><b class="status-pill ${tripEnabled(trip) ? "active" : "disabled"}">${tripEnabled(trip) ? "ACTIVE" : "DISABLED"}</b></article>`).join("") || `<div class="empty-profile-trips"><b>No trip assigned</b><p>This permanent profile is ready. Trips can be added later.</p></div>`}</div><div class="form-actions profile-actions"><button id="profileBack" type="button">← Back</button><button id="profileEdit" type="button">Edit details</button><button id="profileEditPin" class="pin-primary-action" type="button">✎ Edit PIN</button></div></div>`);
    $("#profileAssignTrips").addEventListener("click", () => showTravellerTripAssignments(traveller, trips, administratorSecret, demoMode));
    $("#profileEdit").addEventListener("click", () => showEditTravellerAccount(traveller, trips, administratorSecret, demoMode));
    $("#profileEditPin").addEventListener("click", () => showResetTravellerPin(traveller, trips, administratorSecret, demoMode));
    $("#profileBack").addEventListener("click", () => loadTravellerAccounts(administratorSecret, trips, demoMode));
  }

  function showEditTravellerAccount(traveller, trips, administratorSecret, demoMode) {
    if (!traveller) return toast("Traveller profile not found", true);
    showModal("Edit traveller details", `<form class="modal-form" id="editTravellerAccountForm"><div class="profile-id-banner"><span>TRAVELLER ID</span><b>${esc(traveller.travellerId)}</b><small>${Number(traveller.tripCount || 0) ? `${Number(traveller.tripCount)} assigned trips` : "No trip assigned"}</small></div><label>Traveller name<input name="name" maxlength="80" value="${esc(traveller.name)}" required></label><div class="form-row"><label>Phone<input name="phone" type="tel" maxlength="30" value="${esc(traveller.phone || "")}"></label><label>Email<input name="email" type="email" maxlength="120" value="${esc(traveller.email || "")}"></label></div><label>City or location<input name="city" maxlength="80" value="${esc(traveller.city || "")}"></label><label>Emergency contact<input name="emergencyContact" maxlength="120" value="${esc(traveller.emergencyContact || "")}"></label><label>Notes<textarea name="notes" rows="3" maxlength="1000">${esc(traveller.notes || "")}</textarea></label><div class="form-actions"><button type="button" data-cancel>Cancel</button><button type="submit">Save details</button></div></form>`);
    $("#editTravellerAccountForm").addEventListener("submit", async (event) => {
      event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      try {
        if (demoMode) Object.assign(traveller, values);
        else await api("updateTravellerAccount", { pin: administratorSecret, travellerId: traveller.travellerId, traveller: values });
        toast("Traveller details updated"); await loadTravellerAccounts(administratorSecret, trips, demoMode);
      } catch (error) { toast(error.message, true); }
    });
    $('[data-cancel]').addEventListener("click", () => loadTravellerAccounts(administratorSecret, trips, demoMode));
  }

  function showResetTravellerPin(traveller, trips, administratorSecret, demoMode) {
    showModal("Edit traveller PIN", `<form class="modal-form" id="resetTravellerPinForm"><div class="security-note traveller-note"><i>♙</i><p>Administrator is setting a new personal PIN for <b>${esc(traveller.name)}</b> · ${esc(traveller.travellerId)}. Their old PIN will stop working immediately.</p></div><label>New personal PIN<input name="newPin" type="password" inputmode="numeric" minlength="4" maxlength="8" pattern="[0-9]{4,8}" placeholder="4–8 digits" required></label><label>Confirm new PIN<input name="confirmPin" type="password" inputmode="numeric" minlength="4" maxlength="8" pattern="[0-9]{4,8}" placeholder="Enter the same PIN again" required></label><div class="form-actions"><button type="button" data-cancel>Cancel</button><button type="submit">Save new PIN</button></div></form>`);
    $("#resetTravellerPinForm").addEventListener("submit", async (event) => {
      event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      if (values.newPin !== values.confirmPin) return toast("The two PIN entries do not match", true);
      try { if (!demoMode) await api("resetTravellerPin", { pin: administratorSecret, travellerId: traveller.travellerId, newPin: values.newPin }); toast("Personal Traveller PIN updated"); await loadTravellerAccounts(administratorSecret, trips, demoMode); }
      catch (error) { toast(error.message, true); }
    });
    $('[data-cancel]').addEventListener("click", () => loadTravellerAccounts(administratorSecret, trips, demoMode));
  }

  function showTripTravellerAssignments(trip, trips, administratorSecret, demoMode) {
    if (!trip) return toast("Trip not found", true);
    const continueWith = (travellers) => {
      const current = new Set(trip.assignedTravellerIds || []);
      showModal(`Travellers · ${trip.tripId}`, `<form class="modal-form assignment-form" id="tripTravellerAssignmentForm"><div class="security-note"><i>♙</i><p>Select multiple traveller accounts for <b>${esc(trip.name)}</b>. One traveller can be assigned to many trips.</p></div><div class="check-list">${travellers.map((traveller) => `<label class="check-card ${traveller.active ? "" : "inactive"}"><input type="checkbox" name="travellerIds" value="${esc(traveller.travellerId)}" ${current.has(traveller.travellerId) ? "checked" : ""} ${traveller.active ? "" : "disabled"}><span><b>${esc(traveller.name)}</b><small>${esc(traveller.travellerId)} · ${traveller.active ? "Active" : "Inactive"}</small></span></label>`).join("") || `<p>No traveller accounts exist yet.</p>`}</div><div class="form-actions"><button type="button" data-cancel>Cancel</button><button type="submit">Save assignments</button></div></form>`);
      $("#tripTravellerAssignmentForm").addEventListener("submit", async (event) => {
        event.preventDefault(); const selected = new Set(new FormData(event.currentTarget).getAll("travellerIds")); const additions = [...selected].filter((id) => !current.has(id)); const removals = [...current].filter((id) => !selected.has(id));
        try {
          if (demoMode) {
            trip.assignedTravellerIds = [...selected]; trip.assignedTravellerCount = selected.size;
            demoTravellerAccounts.forEach((account) => { account.tripIds = account.tripIds || []; account.tripIds = selected.has(account.travellerId) ? [...new Set([...account.tripIds, trip.tripId])] : account.tripIds.filter((id) => id !== trip.tripId); account.tripCount = account.tripIds.length; });
          } else {
            if (additions.length) await api("assignTravellers", { tripId: trip.tripId, pin: administratorSecret, travellerIds: additions });
            for (const travellerId of removals) await api("removeTravellerAssignment", { tripId: trip.tripId, pin: administratorSecret, travellerId });
          }
          toast("Trip traveller assignments updated"); await loadAllTrips(administratorSecret, demoMode);
        } catch (error) { toast(error.message, true); }
      });
      $('[data-cancel]').addEventListener("click", () => renderAllTrips(trips, administratorSecret, demoMode));
    };
    if (demoMode) continueWith(demoTravellerAccounts); else api("listTravellerAccounts", { pin: administratorSecret }).then((result) => continueWith(result.travellers || [])).catch((error) => toast(error.message, true));
  }

  function showTravellerTripAssignments(traveller, trips, administratorSecret, demoMode) {
    const current = new Set(traveller.tripIds || []);
    showModal(`Assign trips · ${traveller.name}`, `<form class="modal-form assignment-form" id="travellerTripAssignmentForm"><div class="security-note traveller-note"><i>♙</i><p>Select every trip that <b>${esc(traveller.name)}</b> should open with personal Traveller ID ${esc(traveller.travellerId)}.</p></div><div class="check-list">${trips.map((trip) => `<label class="check-card"><input type="checkbox" name="tripIds" value="${esc(trip.tripId)}" ${current.has(trip.tripId) ? "checked" : ""}><span><b>${esc(trip.name)}</b><small>${esc(trip.tripId)} · ${tripEnabled(trip) ? "Active" : "Disabled"}</small></span></label>`).join("")}</div><div class="form-actions"><button type="button" data-cancel>Cancel</button><button type="submit">Save assigned trips</button></div></form>`);
    $("#travellerTripAssignmentForm").addEventListener("submit", async (event) => {
      event.preventDefault(); const selected = new Set(new FormData(event.currentTarget).getAll("tripIds")); const additions = [...selected].filter((id) => !current.has(id)); const removals = [...current].filter((id) => !selected.has(id));
      try {
        if (demoMode) { traveller.tripIds = [...selected]; traveller.tripCount = selected.size; demoTrips.forEach((trip) => { trip.assignedTravellerIds = trip.assignedTravellerIds || []; trip.assignedTravellerIds = selected.has(trip.tripId) ? [...new Set([...trip.assignedTravellerIds, traveller.travellerId])] : trip.assignedTravellerIds.filter((id) => id !== traveller.travellerId); trip.assignedTravellerCount = trip.assignedTravellerIds.length; }); }
        else {
          if (additions.length) await api("assignTravellerToTrips", { pin: administratorSecret, travellerId: traveller.travellerId, tripIds: additions, role: "Editor" });
          for (const tripId of removals) await api("removeTravellerAssignment", { tripId, pin: administratorSecret, travellerId: traveller.travellerId });
        }
        toast("Traveller trip assignments updated"); await loadTravellerAccounts(administratorSecret, trips, demoMode);
      } catch (error) { toast(error.message, true); }
    });
    $('[data-cancel]').addEventListener("click", () => loadTravellerAccounts(administratorSecret, trips, demoMode));
  }

  function travellerPinRow(index, member) {
    const lockedName = Boolean(member);
    return `<section class="bulk-traveller-row"><header><b>Traveller ${index + 1}</b>${lockedName ? `<span>Existing trip member</span>` : `<button type="button" data-remove-traveller aria-label="Remove traveller">×</button>`}</header><div class="form-row"><label>Traveller name<input data-field="name" maxlength="80" value="${esc(member ? member.name : "")}" ${lockedName ? "readonly" : ""} placeholder="Full name" required></label><label>Separate personal PIN<input data-field="pin" type="password" inputmode="numeric" minlength="4" maxlength="8" pattern="[0-9]{4,8}" placeholder="4–8 digits" required></label></div><div class="form-row"><label>Phone <small>(optional)</small><input data-field="phone" type="tel" maxlength="30" placeholder="+91 …"></label><label>Email <small>(optional)</small><input data-field="email" type="email" maxlength="120" placeholder="name@example.com"></label></div><div class="form-row"><label>City <small>(optional)</small><input data-field="city" maxlength="80"></label><label>Trip role<select data-field="role"><option>Editor</option><option>Viewer</option></select></label></div></section>`;
  }

  function showAddTravellersToCurrentTrip(existingMember) {
    if (!isAdmin()) return toast("Administrator access required", true);
    const singleMember = Boolean(existingMember);
    showModal(singleMember ? "Give traveller a personal PIN" : "Add travellers with separate PINs", `<form class="modal-form" id="bulkTravellerForm"><div class="security-note traveller-note"><i>♙</i><p>${singleMember ? `Create personal access for <b>${esc(existingMember.name)}</b> and assign it to this trip.` : `Add several travellers to <b>${esc(state.data.trip.name)}</b>. Enter a different personal PIN for every traveller.`}</p></div><div id="newTravellerRows"></div>${singleMember ? "" : `<button class="add-row-button" id="addTravellerRow" type="button">＋ Add another traveller</button>`}<p class="form-help">Each traveller receives a unique Traveller ID. The personal PIN is stored only as a secure hash and cannot be viewed later.</p><div class="form-actions"><button type="button" data-cancel>Cancel</button><button type="submit">${singleMember ? "Create PIN and assign" : "Create and add to trip"}</button></div></form>`);
    const rows = $("#newTravellerRows");
    const addRow = (member) => {
      rows.insertAdjacentHTML("beforeend", travellerPinRow(rows.children.length, member));
      $$('[data-remove-traveller]', rows).forEach((button) => { button.onclick = () => { button.closest(".bulk-traveller-row").remove(); $$(".bulk-traveller-row header b", rows).forEach((label, index) => { label.textContent = `Traveller ${index + 1}`; }); }; });
    };
    addRow(existingMember || null);
    if ($("#addTravellerRow")) $("#addTravellerRow").addEventListener("click", () => addRow(null));
    $("#bulkTravellerForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const travellers = $$(".bulk-traveller-row", rows).map((row) => Object.fromEntries(["name", "pin", "phone", "email", "city", "role"].map((field) => [field, row.querySelector(`[data-field="${field}"]`).value.trim()])));
      if (!travellers.length) return toast("Add at least one traveller", true);
      const pinSet = new Set(travellers.map((traveller) => traveller.pin));
      if (pinSet.size !== travellers.length) return toast("Choose a different personal PIN for every traveller", true);
      try {
        let assigned;
        if (state.demoMode) {
          assigned = travellers.map((traveller) => {
            const travellerId = `${traveller.name.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 8) || "TRV"}-${Math.floor(100 + Math.random() * 900)}`;
            const profile = { ...traveller, travellerId, active: true, tripCount: 1, tripIds: [state.data.trip.tripId] }; delete profile.pin; demoTravellerAccounts.push(profile);
            const member = state.data.members.find((item) => !item.travellerId && item.name === traveller.name);
            if (member) { member.travellerId = travellerId; member.role = traveller.role; }
            else state.data.members.push({ id: uid(), travellerId, name: traveller.name, role: traveller.role });
            return { traveller: profile, role: traveller.role };
          });
        } else {
          const result = await api("assignTravellers", authPayload({ travellers })); assigned = result.travellers || [];
          const latest = await api("getTrip", authPayload()); state.data = normalize(latest); state.accessRole = latest.accessRole; state.permissions = latest.permissions || {};
        }
        hydrateShell(); render(); updatePrintArea(); showCreatedTravellerAccess(travellers, assigned);
      } catch (error) { toast(error.message, true); }
    });
    $('[data-cancel]').addEventListener("click", closeModal);
  }

  function showCreatedTravellerAccess(travellers, assigned) {
    const accessRows = travellers.map((traveller, index) => ({ ...traveller, travellerId: assigned[index] && assigned[index].traveller ? assigned[index].traveller.travellerId : "Created" }));
    const copyText = accessRows.map((item) => `${item.name}\nTraveller ID: ${item.travellerId}\nPersonal PIN: ${item.pin}\nTrip ID: ${state.data.trip.tripId}`).join("\n\n");
    showModal("Traveller access created", `<div class="created-access"><div class="success-note"><b>✓ ${accessRows.length} traveller ${accessRows.length === 1 ? "access" : "accesses"} created</b><p>Give each traveller only their own Traveller ID and personal PIN. These PINs are shown once on this screen.</p></div><div class="created-access-list">${accessRows.map((item) => `<article><i>${esc(initials(item.name))}</i><div><h3>${esc(item.name)}</h3><span>TRAVELLER ID <b>${esc(item.travellerId)}</b></span><span>PERSONAL PIN <b>${esc(item.pin)}</b></span><span>TRIP ID <b>${esc(state.data.trip.tripId)}</b></span></div></article>`).join("")}</div><div class="form-actions"><button id="copyTravellerAccess" type="button">Copy all access details</button><button id="finishTravellerAccess" type="button">Done</button></div></div>`);
    $("#copyTravellerAccess").addEventListener("click", async () => { try { await navigator.clipboard.writeText(copyText); toast("Traveller access details copied"); } catch { toast("Could not copy automatically", true); } });
    $("#finishTravellerAccess").addEventListener("click", closeModal);
  }

  function showResetCurrentTravellerPin(member) {
    if (!isAdmin()) return toast("Administrator access required", true);
    if (!member || !member.travellerId) return toast("This traveller does not have personal access yet", true);
    showModal("Edit traveller PIN", `<form class="modal-form" id="currentTravellerPinForm"><div class="profile-id-banner"><span>TRAVELLER ID</span><b>${esc(member.travellerId)}</b><small>${esc(member.name)}</small></div><div class="security-note"><i>⚿</i><p>Only the Administrator can edit this personal PIN. The traveller’s old PIN will stop working immediately.</p></div><label>New personal PIN<input name="newPin" type="password" inputmode="numeric" minlength="4" maxlength="8" pattern="[0-9]{4,8}" placeholder="4–8 digits" required></label><label>Confirm new PIN<input name="confirmPin" type="password" inputmode="numeric" minlength="4" maxlength="8" pattern="[0-9]{4,8}" required></label><div class="form-actions"><button type="button" data-cancel>Cancel</button><button type="submit">Save new PIN</button></div></form>`);
    $("#currentTravellerPinForm").addEventListener("submit", async (event) => {
      event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      if (values.newPin !== values.confirmPin) return toast("The two PIN entries do not match", true);
      try {
        if (!state.demoMode) await api("resetTravellerPin", { pin: state.pin, travellerId: member.travellerId, newPin: values.newPin });
        closeModal(); toast(`Personal PIN updated for ${member.name}`);
      } catch (error) { toast(error.message, true); }
    });
    $('[data-cancel]').addEventListener("click", closeModal);
  }

  function showAddModal(type) {
    if (!canAdd(type)) return toast("Global Administrator access required for this action", true);
    if (type === "travellers") return showAddTravellersToCurrentTrip();
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
      if (!state.demoMode) await api(`add${type[0].toUpperCase()}${type.slice(1)}`, authPayload({ record }));
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

  async function toggleCurrentTripStatus() {
    if (!isAdmin()) return toast("Administrator access required", true);
    const enabled = !(state.data.trip.enabled !== false && String(state.data.trip.enabled).toUpperCase() !== "FALSE");
    try {
      if (!state.demoMode) await api("setTripEnabled", { tripId: state.data.trip.tripId, pin: state.pin, enabled });
      state.data.trip.enabled = enabled; hydrateShell(); render(); toast(`Trip ${enabled ? "enabled" : "disabled"}`);
    } catch (error) { toast(error.message, true); }
  }

  function showEditRecord(sheet, id) {
    if (!canEditRecords()) return toast("You do not have permission to edit this record", true);
    const collection = { Itinerary: "itinerary", Places: "places", Expenses: "expenses" }[sheet];
    const record = collection && state.data[collection].find((item) => String(item.id) === String(id));
    if (!record) return toast("Record not found", true);
    let fields = "";
    if (sheet === "Itinerary") fields = `<label>Plan title<input name="title" value="${esc(record.title)}" required></label><div class="form-row"><label>Date<input name="date" type="date" value="${esc(record.date)}" required></label><label>Time<input name="time" type="time" value="${esc(record.time)}" required></label></div><label>Place<input name="place" value="${esc(record.place)}" required></label><label>Notes<textarea name="notes" rows="3">${esc(record.notes || "")}</textarea></label>`;
    if (sheet === "Places") fields = `<label>Place name<input name="name" value="${esc(record.name)}" required></label><label>Area or address<input name="area" value="${esc(record.area || "")}"></label><div class="form-row"><label>Category<input name="category" value="${esc(record.category || "")}"></label><label>Planned day<input name="plannedDay" value="${esc(record.plannedDay || "Unplanned")}"></label></div><label>Notes<textarea name="notes" rows="3">${esc(record.notes || "")}</textarea></label>`;
    if (sheet === "Expenses") fields = `<label>Expense description<input name="label" value="${esc(record.label)}" required></label><div class="form-row"><label>Amount<input name="amount" type="number" min="0.01" step="0.01" value="${esc(record.amount)}" required></label><label>Date<input name="date" type="date" value="${esc(record.date)}" required></label></div><div class="form-row"><label>Category<input name="category" value="${esc(record.category || "")}"></label><label>Paid by<input name="paidBy" value="${esc(record.paidBy || "")}" required></label></div><label>Notes<textarea name="notes" rows="3">${esc(record.notes || "")}</textarea></label>`;
    showModal(`Edit ${sheet === "Itinerary" ? "plan" : sheet.slice(0, -1).toLowerCase()}`, `<form class="modal-form" id="editRecordForm">${fields}<div class="form-actions"><button type="button" data-cancel>Cancel</button><button type="submit">Save changes</button></div></form>`);
    $("#editRecordForm").addEventListener("submit", async (event) => {
      event.preventDefault(); const update = Object.fromEntries(new FormData(event.currentTarget).entries()); if (sheet === "Expenses") update.amount = Number(update.amount);
      try {
        if (!state.demoMode) await api("updateRecord", authPayload({ sheet, id, record: update }));
        Object.assign(record, update); closeModal(); render(); updatePrintArea(); toast("Changes saved for everyone");
      } catch (error) { toast(error.message, true); }
    });
    $('[data-cancel]').addEventListener("click", closeModal);
  }

  async function deleteItem(sheet, id) {
    if (!isAdmin()) return toast("Global Administrator access required to delete records", true);
    const collection = { Itinerary: "itinerary", Places: "places", Expenses: "expenses", Members: "members" }[sheet];
    try {
      if (!state.demoMode) await api("deleteRecord", authPayload({ sheet, id }));
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
    try { const data = await api("getTrip", authPayload()); state.data = normalize(data); state.accessRole = data.accessRole; state.permissions = data.permissions || {}; hydrateShell(); render(); updatePrintArea(); toast("Latest trip data loaded"); } catch (error) { toast(error.message, true); }
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
  $("#joinForm").addEventListener("submit", async (event) => { event.preventDefault(); const data = new FormData(event.currentTarget); try { const trip = await api("getTrip", { tripId: String(data.get("tripId")).trim().toUpperCase(), pin: String(data.get("pin")) }); await openTrip(trip, String(data.get("pin")), false, "", "", "", "trip"); } catch (error) { toast(error.message, true); } });
  $("#adminDemoButton").addEventListener("click", () => openTrip(demo, "654321", true, "Sarada", "administrator"));
  $("#travellerDemoButton").addEventListener("click", () => openTrip(demo, "1234", true, "Anita", "traveller"));
  $("#showAllTripsButton").addEventListener("click", showAllTrips);
  $("#showMyTripsButton").addEventListener("click", showMyTrips);
  $("#showCreateButton").addEventListener("click", async () => {
    if (!apiUrlReady()) return showBackendSetup(() => $("#showCreateButton").click());
    try { await ensureCurrentBackend(); showCreateTrip(); }
    catch (error) { toast(error.message, true); showBackendSetup(() => $("#showCreateButton").click()); }
  });
  $("#closeModal").addEventListener("click", closeModal); $("#modal").addEventListener("mousedown", (event) => { if (event.target === event.currentTarget) closeModal(); });
  $("#mainNav").addEventListener("click", (event) => { const button = event.target.closest("[data-tab]"); if (button) setTab(button.dataset.tab); });
  $("#inviteButton").addEventListener("click", showInvite); $("#allTripsButton").addEventListener("click", () => isAdmin() ? showAllTrips() : showMyTrips()); $("#connectBackendButton").addEventListener("click", () => showBackendSetup()); $("#editTripButton").addEventListener("click", showEditTrip); $("#tripStatusButton").addEventListener("click", toggleCurrentTripStatus); $("#deleteTripButton").addEventListener("click", () => showDeleteTripConfirmation(state.data.trip.tripId)); $("#syncButton").addEventListener("click", refreshTrip); $("#leaveTrip").addEventListener("click", () => location.reload());
  $$('[data-add]').forEach((button) => button.addEventListener("click", () => showAddModal(button.dataset.add)));

  const inviteQuery = new URLSearchParams(location.search);
  const invitedApi = inviteQuery.get("api");
  if (!validApiUrl(config.API_URL) && validApiUrl(invitedApi)) { apiUrl = invitedApi; saveStoredApiUrl(apiUrl); }
  updateBackendStatus();
  if (apiUrlReady()) ensureCurrentBackend().catch(() => {});
  const invitedTrip = inviteQuery.get("trip"); if (invitedTrip) $("#joinTripId").value = invitedTrip.toUpperCase();
})();
