# MyTrip Shared Dashboard

MyTrip is a free shared travel planner designed for:

- GitHub Pages as the frontend
- Google Apps Script as the backend
- Google Sheets as the database
- Google Maps links and embedded maps

## Included features

- Create a trip with destination, dates, budget and organiser
- Join a trip using a trip code and an Administrator or Traveller PIN
- Automatic role detection with permissions enforced by the Google backend
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
| `config.js` | Your Google Apps Script `/exec` URL |
| `backend/Code.gs` | Google backend and Sheet database code |
| `backend/appsscript.json` | Apps Script project settings |
| `SETUP-GUIDE.md` | Complete non-coder deployment instructions |

Start with `SETUP-GUIDE.md`.

## Access and security

Each trip has two different PINs. The **Administrator PIN** (6–8 digits) unlocks all controls. The **Traveller PIN** (4–8 digits) allows the group to view the trip, use Google Maps, add itinerary items and expenses, and print reports. The backend checks the role again for every request, so hiding a button is not the only protection.

| Capability | Administrator | Traveller |
| --- | :---: | :---: |
| View trip, maps and reports | ✓ | ✓ |
| Add itinerary items and expenses | ✓ | ✓ |
| Save places and manage travellers | ✓ | — |
| Delete records | ✓ | — |
| Change both PINs and trip settings | ✓ | — |

Only SHA-256 hashes of the PINs are stored in Google Sheets. Keep the Administrator PIN private and share only the Traveller PIN with your group.

This lightweight PIN model is suitable for ordinary travel plans and expenses. Do not store passports, card numbers, passwords, medical records or other highly sensitive data in this dashboard.
