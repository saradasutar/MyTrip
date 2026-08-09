# MyTrip Shared Dashboard

MyTrip is a free shared travel planner designed for:

- GitHub Pages as the frontend
- Google Apps Script as the backend
- Google Sheets as the database
- Google Maps links and embedded maps

## Included features

- Create a trip with destination, dates, budget and organiser
- Open every trip with one global Administrator password/PIN
- Give every trip its own separate Traveller PIN
- View and switch between all trips from one Administrator screen
- Verify Google backend version 3 before creating trips, avoiding misleading old-PIN errors
- Automatic role detection with permissions enforced by the Google backend
- In-page Google backend connection and verification for existing GitHub sites
- Share one live trip with several people
- Build a day-by-day itinerary
- Save places and open them in Google Maps
- Enter expenses with date, category and who paid
- See total budget, spent amount and balance
- Let travellers add itinerary items and expenses without exposing admin controls
- Let the administrator manage saved places, travellers, PINs, edits and deletions
- Print the itinerary only
- Print the expense statement only
- Print a complete trip book or save it as PDF
- Responsive desktop and mobile layout
- Working demo mode before backend setup

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Main GitHub Pages dashboard |
| `styles.css` | Colours, layout, mobile and print design |
| `app.js` | Dashboard interactions and backend connection |
| `config.js` | Optional default Google Apps Script `/exec` URL |
| `backend/Code.gs` | Google backend and Sheet database code |
| `backend/appsscript.json` | Apps Script project settings |
| `SETUP-GUIDE.md` | Complete non-coder deployment instructions |

Start with `SETUP-GUIDE.md`.

## Access and security

MyTrip uses one **global Administrator password/PIN** (6–64 characters) for the organiser. It opens the **All trips** screen and every individual trip. Each trip has a different **Traveller PIN** (4–8 digits), so people joining one journey cannot open another journey unless you give them its PIN. The Google backend checks the role again for every request.

| Capability | Administrator | Traveller |
| --- | :---: | :---: |
| View and switch between all trips | ✓ | — |
| View trip, maps and reports | ✓ | ✓ |
| Add itinerary items and expenses | ✓ | ✓ |
| Save places and manage travellers | ✓ | — |
| Delete records | ✓ | — |
| Change the global Administrator secret | ✓ | — |
| Change the current trip’s Traveller PIN | ✓ | — |

Only SHA-256 hashes of the access secrets are stored. Keep the global Administrator password/PIN private and share only the relevant trip’s Traveller PIN.

This lightweight PIN model is suitable for ordinary travel plans and expenses. Do not store passports, card numbers, passwords, medical records or other highly sensitive data in this dashboard.
