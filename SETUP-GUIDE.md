# MyTrip Google Backend 4.5 Setup

This update preserves existing trips and adds safe deletion of duplicate traveller profiles while keeping historical expenses and notes.

1. Open the Apps Script project currently used by MyTrip.
2. Replace its entire `Code.gs` with the new `backend/Code.gs` supplied in the ZIP.
3. Click **Save**.
4. Choose the function `setupMyTrip` and click **Run** once.
5. Wait for the execution to finish successfully. The existing spreadsheet receives a new `ExperienceNotes` sheet; existing data is not removed.
6. Choose **Deploy → Manage deployments → Edit**.
7. Under Version, select **New version** and click **Deploy**.
8. Confirm that access remains **Anyone** and copy the `/exec` URL if Google shows it.
9. Open MyTrip and confirm the backend status says **v4.5.0**.

Do not create a new Apps Script project or a new spreadsheet. Updating the existing project keeps the same data and web-app URL.
