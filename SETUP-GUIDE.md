# MyTrip Setup Guide — No Coding Installation Required

You will do everything in your web browser. Nothing needs to be installed on your computer.

## Part 1 — Create the Google backend

1. Open [Google Apps Script](https://script.google.com/) and sign in with the Google account that should own the MyTrip data.
2. Click **New project**.
3. At the top-left, rename the project to **MyTrip Backend**.
4. Open the supplied file `backend/Code.gs` on your computer.
5. In Apps Script, delete the sample `myFunction()` code and paste the complete contents of `Code.gs`.
6. Click **Save project**.

### Run the one-time setup

1. In the function list at the top, choose **setupMyTrip**.
2. Click **Run**.
3. Google will ask for permission. Select your Google account and allow access to Google Sheets.
4. If Google shows “This app isn’t verified”, click **Advanced**, then **Go to MyTrip Backend (unsafe)**. This warning appears because this is your own private script, not a published Google app.
5. Wait until the execution says **Completed**.

The script automatically creates a spreadsheet named **MyTrip Dashboard Data** with tabs for Trips, Members, TravellerAccounts, TripAssignments, Places, Itinerary, Expenses and Activity.

## Part 2 — Deploy the Google Web App

1. In Apps Script, click **Deploy** → **New deployment**.
2. Click the gear icon beside “Select type” and choose **Web app**.
3. Description: enter `MyTrip version 4.1`.
4. Execute as: choose **Me**.
5. Who has access: choose **Anyone**.
6. Click **Deploy** and approve access if requested.
7. Copy the **Web app URL**. It must end with `/exec`.

Keep that `/exec` URL ready for the next part. Do not use the URL ending in `/dev`.

## Part 3 — Connect the frontend

Choose either method below. Method A connects every visitor automatically. Method B is easiest when the site is already on GitHub.

### Method A — Put the URL in `config.js`

1. Open the supplied file `config.js`.
2. Paste the `/exec` URL between the quotation marks after `API_URL:`.
3. Save `config.js` and upload it with the other frontend files.

Example:

```javascript
window.MYTRIP_CONFIG = {
  API_URL: "https://script.google.com/macros/s/EXAMPLE_DEPLOYMENT_ID/exec",
  APP_NAME: "MyTrip",
  DEFAULT_CURRENCY: "INR"
};
```

### Method B — Connect from the dashboard

1. Leave `API_URL` blank and publish the frontend in Part 4.
2. Open the dashboard and click **Connect** beside “Google backend not connected”.
3. Paste the `/exec` URL and click **Test & connect**.

The dashboard checks the backend and remembers it in that browser. Invite links created by the administrator automatically carry the same public backend address so travellers can open the shared trip.

## Part 4 — Publish on GitHub Pages

1. Sign in at [GitHub](https://github.com/).
2. Click **New repository**.
3. Repository name: enter `MyTrip-Dashboard`.
4. Choose **Public**. GitHub Pages on a free account works most simply with a public repository.
5. Click **Create repository**.
6. Click **uploading an existing file**.
7. Upload these items into the repository root:

   - `index.html`
   - `styles.css`
   - `app.js`
   - `config.js`
   - the `backend` folder (optional, but useful as your backup)
   - `README.md`

8. Click **Commit changes**.
9. Open the repository **Settings** → **Pages**.
10. Under “Build and deployment”, choose **Deploy from a branch**.
11. Branch: choose **main** and folder **/(root)**.
12. Click **Save**.

GitHub will publish the dashboard in a few minutes. Its address will normally be:

`https://YOUR-GITHUB-USERNAME.github.io/MyTrip-Dashboard/`

## Part 5 — Create and share your first trip

1. Open your GitHub Pages dashboard.
2. If it says **Google backend not connected**, click **Connect**, paste the `/exec` URL, and wait for the green connected message.
3. Click **Create a new trip**.
4. Enter the trip name, destination, dates, budget, your name, your global Administrator password/PIN (6–64 characters), and a different 4–8 digit Traveller PIN for this trip.
5. The dashboard creates a trip code automatically.
6. Click **Invite** to copy the invite link.
7. Send the invite link and only the **Traveller PIN** to trusted travellers. For better security, send the PIN separately.

Use the same global Administrator password/PIN whenever you create another trip. Choose a different Traveller PIN for every trip. The login screen detects the access type automatically. Everyone using the same trip code sees the same Google Sheet data. Use **Refresh** to load changes made by another person.

### Administrator and Traveller access

| Action | Administrator | Traveller |
| --- | :---: | :---: |
| View and switch between all trips | ✓ | — |
| View the dashboard, Google Maps and print reports | ✓ | ✓ |
| Add and edit plans, places and expenses | ✓ | ✓ |
| Create Traveller IDs and assign trips | ✓ | — |
| Edit, disable/enable or delete trips | ✓ | — |
| Delete records | ✓ | — |
| Change trip settings and global Administrator access | ✓ | — |
| Change this trip’s Traveller PIN | ✓ | — |

Keep the global Administrator password/PIN with the organiser. Do not send it in a group invite. Send only the Traveller PIN belonging to that specific trip.

### If the Administrator PIN is forgotten

`MYTRIP_NEW_ADMIN_SECRET` is a temporary Apps Script **Script Property** used only for recovery. It is not the normal login PIN and you should not add it unless you need to reset a forgotten Administrator PIN.

1. In Apps Script, open **Project Settings** → **Script Properties**.
2. Add property `MYTRIP_NEW_ADMIN_SECRET` with the new 6–64 character Administrator password/PIN as its value.
3. In the editor, run `resetMyTripAdministratorPin()` once.

The function stores only the new SHA-256 hash and immediately deletes the temporary plain-text property. You do not need to redeploy after this recovery action.

### View all trips as Administrator

1. On the opening screen, click **Administrator · View all trips**.
2. Enter your one global Administrator password/PIN.
3. Select any trip and click **Open**.

Travellers cannot open this list. A Traveller PIN works only with its own trip code.

### Create a Traveller ID and assign trips

1. Open **Administrator · View all trips** with the one global Administrator PIN.
2. Click **Traveller accounts** → **New traveller**.
3. Enter the traveller’s name and a 4–8 digit personal PIN. A Traveller ID is generated automatically, or you can choose one.
4. Click **Assign trips** beside that traveller and select one or many trips.
5. Give the Traveller ID and personal PIN privately to that person.

The traveller clicks **Traveller · View my trips** on the opening screen. One login shows every active trip assigned to that Traveller ID.

### Assign multiple travellers to one trip

1. Open the Administrator **All trips** screen.
2. Click **Travellers** on the relevant trip card.
3. Select all traveller accounts that should share the trip, then click **Save assignments**.

### Disable or delete a trip

- **Disable** blocks both shared Traveller PIN access and personal Traveller ID access, while preserving all trip data. The Administrator can enable it again.
- **Delete** permanently removes the trip and all its plans, places, expenses, members and assignments. The dashboard requires the exact Trip ID as confirmation.

## How to use the dashboard

### Itinerary

- Click **Itinerary**.
- Click **Add plan**.
- Enter the date, time, activity, place and notes.
- The new item is saved for the full group.

### Places and Google Maps

- Click **Places & Map**.
- Use the search box to open a destination in Google Maps.
- Click **Save place** to add a place to the group list.
- Click **Map** beside any place to open its exact Google Maps search.

The basic dashboard uses Google Maps links and an embedded map, so no paid Maps API key is required.

### Expenses

- Click **Expenses** → **Add expense**.
- Enter the amount, date, category and person who paid.
- The budget, spent amount and available balance update automatically.

### Print or save PDF

- Click **Print & Export**.
- Choose **Itinerary only**, **Expenses only**, or **Complete trip book**.
- In the print window, select your printer or choose **Save as PDF**.

## Updating the dashboard later

### If you change frontend files

Upload the changed file to the same GitHub repository and commit it. GitHub Pages will update automatically, usually within a few minutes.

### If you change `Code.gs`

1. Paste the revised code into Apps Script and save it.
2. Click **Deploy** → **Manage deployments**.
3. Click the pencil/edit icon.
4. Under Version, choose **New version**.
5. Click **Deploy**.

Normally the `/exec` URL remains the same, so `config.js` does not need to be changed.

### Upgrading an existing MyTrip version 1, 2 or 3 installation

1. Replace your existing Apps Script code with the new `backend/Code.gs` and click **Save**.
2. Select **setupMyTrip** in the function list and click **Run** once. It adds the v4 traveller-account, assignment and trip-status columns/tabs without deleting existing trips, plans or expenses.
3. Click **Deploy** → **Manage deployments** → the pencil/edit icon.
4. Under Version, choose **New version**, then click **Deploy**.
5. Open any existing trip using its old Administrator PIN. On the first successful Administrator login, MyTrip safely adopts that PIN as the global Administrator access for all trips.
6. Click **All trips** to confirm that every trip is listed.
7. Open **Travellers** → **Security** and set a strong global Administrator password/PIN plus the Traveller PIN for that trip.
8. Open each other trip and assign a different Traveller PIN when different travel groups are involved.
9. Share only the relevant trip’s Traveller PIN with its travellers.

After the global Administrator access is established, old per-trip Administrator PINs are no longer accepted. The one global Administrator password/PIN opens every trip without changing or deleting existing trip data.

## Troubleshooting

### “Paste your Apps Script URL” message

Click **Connect** on the dashboard and paste the deployed `/exec` URL, or add it to `config.js`. Do not use the `/dev` URL.

### “Could not connect” message

Confirm that the Apps Script deployment is a **Web app**, “Execute as” is **Me**, “Who has access” is **Anyone**, and the URL ends in `/exec`. After changing Apps Script, deploy a **New version** before trying again.

### “Backend setup is incomplete”

Return to Apps Script and run `setupMyTrip()` once.

### “Incorrect trip PIN”

Check the trip code and its Traveller PIN with the organiser. Administrators should use the global Administrator password/PIN. Stored access secrets cannot be read because only their hashes are saved.

### “Choose a PIN containing 4 to 8 digits” after entering two valid PINs

That exact message comes from the old MyTrip version 1 Google backend, which accepts only one PIN. The new webpage requires backend version 4.1 for global Administrator access, personal Traveller IDs, trip status controls and separate trip PINs.

1. Replace the complete Apps Script `Code.gs` with the supplied version 4.1 file and click **Save**.
2. Select `setupMyTrip` and click **Run** once.
3. Click **Deploy** → **Manage deployments** → the pencil/edit icon.
4. Under **Version**, choose **New version**, then click **Deploy**.
5. Return to MyTrip and perform a hard refresh. The connection box should say **Google backend connected · v4.1.0** before creating or assigning trips.

Saving `Code.gs` alone does not update the public `/exec` Web App. The **New version** deployment step is essential.

### Dashboard still shows the old version

Open the page in a private/incognito window once, or do a hard refresh:

- Mac: `Command + Shift + R`
- Windows: `Ctrl + Shift + R`

### Apps Script change is not appearing

Saving the script is not enough. Deploy a **New version** through **Manage deployments**.

## Important safety note

Use MyTrip for plans, locations, budgets and ordinary travel expenses. Do not enter passport numbers, card details, bank details, passwords, medical documents or other highly sensitive information.
