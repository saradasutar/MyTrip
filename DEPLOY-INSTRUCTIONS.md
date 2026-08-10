# MyTrip Dashboard 4.5.3

This version removes the approved-traveller display filtering that was not working reliably, while keeping independent traveller access controls.

## What changed

- Removed the Saved Places / Map list from the Overview page. The full **Places & Map** tab remains available.
- Removed the large trip-introduction banner.
- Moved Trip ID, trip name, dates, duration and traveller count into the top header.
- Moved trip management controls into the **Manage** menu in the top header.
- Reworked the spending section with clearer Budget, Total Expenses and Balance figures.
- Improved recent-expense rows with category, date, payer and amount.
- Traveller accounts show the complete trip member list, including available Traveller IDs.
- Overview member count and avatars use the complete trip member list.
- The expense **Paid by** list contains every member in the trip.
- Administrators can use **Disable for this trip** without changing the traveller’s PIN, profile or other trip assignments.
- **Manage trip access** can enable or disable any permanent traveller profile for the open trip.
- The permanent traveller directory labels the separate global action as **Disable everywhere**.
- Itinerary notes are labeled **Plan / experience note** so admin and travellers can update the visit experience and include it in the printed trip book.
- Small labels, descriptions, form text and mobile navigation are slightly bolder for easier reading.

## Update GitHub Pages

Upload and replace these four files in the `MyTrip` GitHub repository:

1. `index.html`
2. `app.js`
3. `styles.css`
4. `config.js`

Wait about two minutes and then refresh the page. On a phone, close the old tab and open the dashboard again. On a computer, use `Ctrl+Shift+R` or `Command+Shift+R`.

## Google backend

No Google Apps Script update is required when your login screen already shows backend **v4.3.0**. That backend already supports independent per-trip traveller assignments.
