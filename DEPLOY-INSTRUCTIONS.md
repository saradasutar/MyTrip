# MyTrip Dashboard 4.7.0

This release shows the frontend and backend versions, adds Administrator-controlled feature access for each personal Traveller ID, and adds trip cover photos.

The dashboard requires Google backend **v4.6.0**. Existing trips, travellers, plans, places, expenses and experience notes are preserved.

## What changed

- The login page and trip dashboard both show the frontend and connected backend versions.
- In **Travellers**, the Administrator can open **Control access** for a named traveller and independently allow or hide:
  - Itinerary
  - Experience notes
  - Places & Map
  - Expenses
  - Traveller list
  - Print & Export
- Hidden records are withheld by the Google backend, not merely hidden with page styling.
- These controls apply to personal Traveller ID login for that one trip. The shared trip PIN remains common because it does not identify an individual traveller.
- The Administrator can add, change or remove a trip cover photo from the Overview or **Manage → Trip photo**.
- JPEG, PNG and WebP files up to 3 MB can be uploaded from a phone or computer and stored in the deploying Administrator's Google Drive.
- A public HTTPS image link can be used instead of uploading a file.
- The cover photo is included in the printable trip book.
- Existing experience notes, traveller-wise expense totals, multi-trip personal Traveller IDs, PIN management and duplicate-profile deletion remain available.

## Step 1 — Update the Google backend

1. Open the existing MyTrip Google Apps Script project.
2. Open `Code.gs`, select all old code and replace it with `backend/Code.gs` from this package.
3. Save the Apps Script project.
4. Select `setupMyTrip` and click **Run** once.
5. Approve the requested Google permissions. Google Drive permission is needed only to upload trip photos.
6. Wait for `setupMyTrip` to finish. It safely adds the new photo and feature-access columns without deleting existing data.
7. Click **Deploy → Manage deployments**.
8. Edit the existing deployment, select **New version**, and deploy with access set to **Anyone**.
9. Keep using the same `/exec` web-app URL.

## Step 2 — Update GitHub Pages

Replace these files in the `MyTrip` GitHub repository:

1. `index.html`
2. `app.js`
3. `styles.css`
4. `config.js`

Wait about two minutes, then use a hard refresh. On a phone, close the old tab and reopen the dashboard.

## Check the update

1. The login page should show **Frontend v4.7.0** and **Backend v4.6.0**.
2. Log in as Administrator and open a trip.
3. Open **Travellers → Control access** on a traveller with a personal Traveller ID.
4. Hide one feature, save, then log in using that Traveller ID and personal PIN. The menu and backend data for that feature should be absent.
5. Open **Manage → Trip photo**, upload a photo, and confirm it appears at the top of Overview.
