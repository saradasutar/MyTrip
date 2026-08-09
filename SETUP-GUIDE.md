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

The script automatically creates a spreadsheet named **MyTrip Dashboard Data** with separate tabs for Trips, Members, Places, Itinerary, Expenses and Activity.

## Part 2 — Deploy the Google Web App

1. In Apps Script, click **Deploy** → **New deployment**.
2. Click the gear icon beside “Select type” and choose **Web app**.
3. Description: enter `MyTrip version 2`.
4. Execute as: choose **Me**.
5. Who has access: choose **Anyone**.
6. Click **Deploy** and approve access if requested.
7. Copy the **Web app URL**. It must end with `/exec`.

Keep that `/exec` URL ready for the next part. Do not use the URL ending in `/dev`.

## Part 3 — Connect the frontend

1. Open the supplied file `config.js`.
2. Find this text:

   `PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE`

3. Replace only that text with the `/exec` URL copied in Part 2. Keep the quotation marks.
4. Save `config.js`.

Example:

```javascript
window.MYTRIP_CONFIG = {
  API_URL: "https://script.google.com/macros/s/EXAMPLE_DEPLOYMENT_ID/exec",
  APP_NAME: "MyTrip",
  DEFAULT_CURRENCY: "INR"
};
```

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
2. Click **Create a new trip**.
3. Enter the trip name, destination, dates, budget, your name, a 6–8 digit Administrator PIN, and a different 4–8 digit Traveller PIN.
4. The dashboard creates a trip code automatically.
5. Click **Invite** to copy the invite link.
6. Send the invite link and only the **Traveller PIN** to trusted travellers. For better security, send the PIN separately.

The login screen automatically detects which PIN was entered and applies its permissions. Everyone using the same trip code sees the same Google Sheet data. Use **Refresh** to load changes made by another person.

### Administrator and Traveller access

| Action | Administrator | Traveller |
| --- | :---: | :---: |
| View the dashboard, Google Maps and print reports | ✓ | ✓ |
| Add plans and expenses | ✓ | ✓ |
| Save or remove places | ✓ | — |
| Add or remove travellers | ✓ | — |
| Delete records | ✓ | — |
| Change trip settings and both PINs | ✓ | — |

Keep the Administrator PIN with the trip organiser. Do not send it in the group invite.

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

### Upgrading an existing MyTrip version 1 installation

1. Replace your existing Apps Script code with the new `backend/Code.gs` and click **Save**.
2. Select **setupMyTrip** in the function list and click **Run** once. It adds the two new security columns without deleting existing trips, plans or expenses.
3. Click **Deploy** → **Manage deployments** → the pencil/edit icon.
4. Under Version, choose **New version**, then click **Deploy**.
5. Sign in to an existing trip using its old PIN. During migration, that PIN is treated as the Administrator PIN.
6. Open **Travellers** → **Security**, then set a new Administrator PIN and a different Traveller PIN.
7. Share only the Traveller PIN with your group.

Changing both PINs completes the migration and disables the old version 1 PIN.

## Troubleshooting

### “Paste your Apps Script URL” message

The URL in `config.js` is missing or is not the deployed `/exec` URL.

### “Backend setup is incomplete”

Return to Apps Script and run `setupMyTrip()` once.

### “Incorrect trip PIN”

Check the PIN with the organiser. The stored PINs cannot be read from the Sheet because only their hashes are saved. If the organiser has changed both PINs, the old PIN no longer works.

### Dashboard still shows the old version

Open the page in a private/incognito window once, or do a hard refresh:

- Mac: `Command + Shift + R`
- Windows: `Ctrl + Shift + R`

### Apps Script change is not appearing

Saving the script is not enough. Deploy a **New version** through **Manage deployments**.

## Important safety note

Use MyTrip for plans, locations, budgets and ordinary travel expenses. Do not enter passport numbers, card details, bank details, passwords, medical documents or other highly sensitive information.
