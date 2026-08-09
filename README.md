# MyTrip Shared Dashboard

MyTrip is a free shared travel planner designed for:

- GitHub Pages as the frontend
- Google Apps Script as the backend
- Google Sheets as the database
- Google Maps links and embedded maps

## Included features

- Create a trip with destination, dates, budget and organiser
- Join a trip using a trip code and 4–8 digit PIN
- Share one live trip with several people
- Build a day-by-day itinerary
- Save places and open them in Google Maps
- Enter expenses with date, category and who paid
- See total budget, spent amount and balance
- Add travellers as editors or viewers
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

The Google Web App is publicly reachable so GitHub Pages can call it, but trip data is protected by a trip code and PIN. The PIN is stored in Google Sheets only as a SHA-256 hash. Use a private 6–8 digit PIN and share it only with your travel group.

This lightweight PIN model is suitable for ordinary travel plans and expenses. Do not store passports, card numbers, passwords, medical records or other highly sensitive data in this dashboard.
