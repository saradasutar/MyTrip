# MyTrip Dashboard 4.6.6

This version adds a separate travel-journal section for experience notes with the writer’s name.

This release requires Google backend **v4.5.0** for safe permanent deletion of duplicate traveller profiles. Existing trips and historical expenses are preserved.

## What changed

- Added **Trip experience notes** below the day-by-day itinerary.
- Added a prominent **Add experience** shortcut on the Overview dashboard and renamed the navigation item **Itinerary & Notes** so the journal is easy to find.
- Added a **Traveller-wise expense totals** section showing every trip member’s total paid amount, payment count and percentage of total spending.
- Added the same traveller-wise totals to Expense and Complete Trip Book printouts.
- Added a clear Administrator-only **Remove from trip** button to every non-organiser traveller card. It removes only the current trip assignment; the permanent profile, PIN and other trips remain unchanged.
- Traveller-wise expense summaries now show only people who have recorded a positive payment; travellers with ₹0 paid are hidden from both the dashboard and printout.
- Administrators can use **Existing traveller** to reuse a saved traveller profile from another trip without changing that person’s PIN or other assignments.
- Personal travellers get a prominent **My trips** dashboard shortcut showing every active trip assigned to their Traveller ID and personal PIN.
- Administrators can permanently **Delete profile** from the Traveller Directory when two accounts were created for the same person. Exact Traveller ID confirmation is required; all assignments for that duplicate ID are removed while historical expenses and notes remain.
- Every experience records its date, optional place, full note and **Written by** name.
- Admin and travellers can add and edit experience notes.
- The Administrator can delete an experience note.
- Itinerary and Complete Trip Book printouts include experience notes and writer names.
- Planning notes remain inside itinerary items; personal experiences are stored separately so one note does not overwrite another.
- The complete trip-member list remains visible in traveller views and in the expense **Paid by** list.
- Independent per-trip traveller enable/disable controls remain available.

## Step 1 — Update the Google backend

The current dashboard requires backend **v4.5.0**. It includes the experience-note and multi-trip features from v4.4 plus safe duplicate-profile deletion.

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

The login page should show **Google backend connected · v4.5.0**. Open **Administrator → All trips → Traveller profiles** to manage or delete a duplicate profile.
