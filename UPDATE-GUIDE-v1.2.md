# Update an Existing WebLaunch Directory to v1.2

This guide is for the existing live Worker:

```text
https://weblaunch-directory.bryanssss-tools.workers.dev
```

Your D1 binding and runtime variables are already working, so this update is much easier than the original installation.

## Step 1 — Extract the v1.2 ZIP

1. Download the ZIP.
2. Right-click it.
3. Choose **Extract All**.
4. Open the extracted `weblaunch-directory` folder.

You should see folders including:

```text
functions
public
src
database
tests
```

## Step 2 — Upload the update to GitHub

1. Open the existing GitHub repository `bryanssss/weblaunch-directory`.
2. Press **Add file**.
3. Press **Upload files**.
4. Open the extracted `weblaunch-directory` folder on your computer.
5. Select everything inside the folder.
6. Drag the selected files and folders into GitHub.
7. Allow files with the same names to be replaced.
8. Use this commit message:

```text
Upgrade WebLaunch Directory to v1.2 automatic approval
```

9. Press **Commit changes**.

Do not upload the ZIP itself into the repository.

## Step 3 — Wait for Cloudflare

1. Open Cloudflare.
2. Open **Workers & Pages**.
3. Open `weblaunch-directory`.
4. Open **Deployments**.
5. Wait for the newest GitHub build.

The active deployment should use:

```text
Build command: npm run check
Deploy command: npx wrangler deploy
```

The build should pass 21 tests and become the active version with 100% traffic.

## Step 4 — No new secrets are required

Keep the existing values exactly as they are:

```text
TURNSTILE_SITE_KEY
TURNSTILE_SECRET_KEY
ADMIN_KEY
IP_HASH_SALT
SITE_NAME
SITE_URL
RATE_LIMIT_TIMEZONE
```

Do not delete the existing `DB` or `ASSETS` bindings.

## Step 5 — Test the health endpoint

Open:

```text
https://weblaunch-directory.bryanssss-tools.workers.dev/api/health
```

Every check must remain `true`.

## Step 6 — Test a new automatic submission

1. Open `/submit`.
2. Press `Ctrl + F5` to load the newest CSS and JavaScript.
3. Submit a new clean HTTPS homepage that has not been submitted before.
4. Complete Turnstile.
5. Press **Check and publish website**.

The success message should say the website is now live and provide a direct listing link.

New valid submissions no longer wait in Pending.

## Step 7 — Test category pages

Open:

```text
https://weblaunch-directory.bryanssss-tools.workers.dev/categories.html
```

Click **Travel**. The browser should open:

```text
https://weblaunch-directory.bryanssss-tools.workers.dev/category/travel
```

That page should show only Travel results rather than returning to the general category overview.

## Step 8 — Check the mobile dropdown

1. Open `/submit` on a phone or use Chrome mobile preview.
2. Open the category control.
3. The menu should use the website's dark design.
4. Scroll inside the menu to reach every category.
5. The arrow should remain safely inside the right edge.

## Step 9 — Check the PayPal button

The PayPal donation button appears in the footer on every public page and in a support section on the homepage. It points to:

```text
https://www.paypal.com/donate/?hosted_button_id=YE9H5NCNLWU38
```

Donations do not affect listing eligibility, ranking or featured placement.

## Step 10 — Handle an old Pending listing

Version 1.2 automatically publishes only new submissions that pass its checks.

For an old Pending listing, use one of these methods:

### Safer method

Open `/admin/`, choose **Legacy pending**, inspect the website and press **Approve**.

### Optional one-time SQL method

Only when every old Pending listing is trusted:

1. Open the connected D1 database.
2. Open **Console**.
3. Open `database/migrations/002-auto-approval.sql` from the repository.
4. Copy and execute it.

That query promotes every old Pending record. Do not run it when untrusted pending submissions exist.
