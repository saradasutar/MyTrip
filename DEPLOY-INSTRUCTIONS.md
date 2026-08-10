# MyTrip Dashboard 4.6.1

This version adds a separate travel-journal section for experience notes with the writer’s name.

## What changed

- Added **Trip experience notes** below the day-by-day itinerary.
- Added a prominent **Add experience** shortcut on the Overview dashboard and renamed the navigation item **Itinerary & Notes** so the journal is easy to find.
- Every experience records its date, optional place, full note and **Written by** name.
- Admin and travellers can add and edit experience notes.
- The Administrator can delete an experience note.
- Itinerary and Complete Trip Book printouts include experience notes and writer names.
- Planning notes remain inside itinerary items; personal experiences are stored separately so one note does not overwrite another.
- The complete trip-member list remains visible in traveller views and in the expense **Paid by** list.
- Independent per-trip traveller enable/disable controls remain available.

## Step 1 — Update the Google backend

The new experience-note feature requires backend **v4.4.0**.

1. Open your existing MyTrip Google Apps Script project.
2. Open `Code.gs`, select all old code and replace it with `backend/Code.gs` from this package.
3. Save the Apps Script project.
4. Select `setupMyTrip` at the top of the Apps Script editor and click **Run** once.
5. Approve Google permission if requested. This safely creates the new `ExperienceNotes` sheet and adds missing columns without deleting existing trips.
6. Click **Deploy → Manage deployments**.
7. Open the existing deployment, choose **New version**, and deploy it with access set to **Anyone**.
8. Keep using the same `/exec` web-app URL.

## Step 2 — Update GitHub Pages

Upload and replace these four files in the `MyTrip` GitHub repository:

1. `index.html`
2. `app.js`
3. `styles.css`
4. `config.js`

Wait about two minutes and refresh the page. On a phone, close the old tab and open the dashboard again. On a computer, use `Ctrl+Shift+R` or `Command+Shift+R`.

## Check the update

The login page should show **Google backend connected · v4.4.0**. Open a trip and use **Add experience** on the Overview dashboard, or select **Itinerary & Notes** and use **Add experience note**.
