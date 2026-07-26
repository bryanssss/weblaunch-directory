# WebLaunch Directory Setup Guide

This guide assumes you have never deployed a full website before. Complete the steps in order and do not skip a step.

## What You Are Building

You will connect four pieces:

1. **GitHub** stores the project files.
2. **Cloudflare Pages** displays the website.
3. **Cloudflare D1** stores submissions and approved listings.
4. **Cloudflare Turnstile** stops many automated spam submissions.

GitHub Pages is **not** used for the live application because the submission form needs secure server-side code and a database.

---

# Part 1 — Unzip the Project

1. Download the ZIP supplied with this guide.
2. Find it in your Downloads folder.
3. Right-click it.
4. Choose **Extract All** on Windows, or double-click it on a Mac.
5. Open the extracted `weblaunch-directory` folder.
6. Check that you can see folders named `public`, `functions`, `database`, `tests` and `tools`.

Do not upload the ZIP itself to GitHub. Upload the files and folders inside the extracted project.

---

# Part 2 — Put the Project on GitHub

## Create an Empty Repository

1. Sign in to GitHub.
2. Press the **+** button near the top-right corner.
3. Choose **New repository**.
4. Repository name: `weblaunch-directory`
5. Description:

   `A free, human-reviewed directory for discovering and submitting independent websites.`

6. Select **Public**.
7. Do **not** tick **Add a README file**.
8. Do **not** add a `.gitignore`.
9. Do **not** choose a licence, because all three files already exist in the project.
10. Press **Create repository**.

## Upload the Project Files

1. On the empty repository page, press **uploading an existing file**. If that link is not visible, choose **Add file → Upload files**.
2. Open the extracted `weblaunch-directory` folder on your computer.
3. Select everything inside it.
4. Drag all selected files and folders into the GitHub upload area.
5. Wait until GitHub finishes listing the files.
6. In the commit message box, type:

   `Initial WebLaunch Directory release`

7. Choose **Commit directly to the main branch**.
8. Press **Commit changes**.
9. Wait for the repository page to reload.
10. Check that GitHub shows the `public`, `functions` and `database` folders.

### Important

Never upload secret keys to GitHub. The project contains placeholders only. Your real keys will be stored privately inside Cloudflare later.

---

# Part 3 — Deploy the First Version to Cloudflare Pages

1. Create or sign in to a Cloudflare account.
2. Open **Workers & Pages** in the Cloudflare dashboard.
3. Choose **Create application**.
4. Choose the **Pages** or **Pages with Git** option.
5. Choose **Connect to Git**.
6. Select **GitHub**.
7. Authorise Cloudflare when GitHub asks.
8. Select the `weblaunch-directory` repository.
9. Press **Begin setup**.

Use these build settings:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | `None` |
| Build command | Leave empty |
| Build output directory | `public` |
| Root directory | Leave empty |

10. Press **Save and Deploy**.
11. Wait for the deployment to finish.
12. Press **Continue to project**.
13. Cloudflare will show an address similar to:

```text
https://weblaunch-directory.pages.dev
```

14. Copy your actual address and save it somewhere. You need it in later steps.

The pages will open now, but submissions will remain disabled until the database, Turnstile and private variables are connected.

---

# Part 4 — Create the D1 Database

1. In the Cloudflare dashboard, open **Storage & Databases**.
2. Choose **D1 SQL Database**.
3. Press **Create database**.
4. Database name:

```text
weblaunch-directory-db
```

5. Press **Create**.
6. Open the new database.
7. Open its **Console** tab.
8. On your computer, open:

```text
database/schema.sql
```

9. Select all the text in that file and copy it.
10. Paste it into the D1 Console.
11. Press **Execute**.
12. Look for a successful result. You should not see a red SQL error.

The database now contains tables for websites, submission limits, reports and report limits.

---

# Part 5 — Connect the Database to the Website

1. Return to **Workers & Pages**.
2. Open your `weblaunch-directory` Pages project.
3. Open **Settings**.
4. Open **Bindings**.
5. Press **Add**.
6. Choose **D1 database binding**.
7. Variable name must be exactly:

```text
DB
```

8. Select the `weblaunch-directory-db` database.
9. Save the binding.
10. Add it to the **Production** environment. Add it to **Preview** too when Cloudflare offers that choice.

Capital letters matter. `DB` is correct. `db` is not correct.

---

# Part 6 — Create the Turnstile Anti-Spam Widget

1. In Cloudflare, open **Turnstile**.
2. Press **Add widget**.
3. Widget name:

```text
WebLaunch Directory Submission Form
```

4. Under hostname management, enter only the hostname from your Pages address.

Example:

```text
weblaunch-directory.pages.dev
```

Do not include `https://` and do not include a slash.

5. Choose **Managed** mode.
6. Press **Create**.
7. Cloudflare displays two values:
   - **Sitekey** — safe to use publicly.
   - **Secret key** — private.
8. Keep this page open or copy both values into a temporary private note.

The project validates Turnstile again on the server. The visible widget by itself is not treated as proof.

---

# Part 7 — Generate the Two Project Secrets

1. Open the extracted project folder on your computer.
2. Open the `tools` folder.
3. Double-click `generate-secrets.html`.
4. It opens in your browser.
5. You will see:
   - `ADMIN_KEY`
   - `IP_HASH_SALT`
6. Keep this page open until you add both values to Cloudflare.

The generator works locally in your browser and does not send the values anywhere.

- `ADMIN_KEY` opens your moderation dashboard.
- `IP_HASH_SALT` protects the one-way email and IP hashes stored in the database.

Do not share either value and do not paste them into GitHub.

---

# Part 8 — Add Variables and Secrets to Cloudflare

1. Return to your Pages project.
2. Open **Settings**.
3. Open **Variables and Secrets**.
4. Add the following values one at a time.

## Normal Text Variables

### 1. Site name

Name:

```text
SITE_NAME
```

Value:

```text
WebLaunch Directory
```

Type: normal text or plaintext.

### 2. Live site address

Name:

```text
SITE_URL
```

Value: your real Pages address, without a final slash.

Example:

```text
https://weblaunch-directory.pages.dev
```

Type: normal text or plaintext.

### 3. Daily-limit timezone

Name:

```text
RATE_LIMIT_TIMEZONE
```

Value:

```text
Europe/London
```

Type: normal text or plaintext.

### 4. Turnstile public sitekey

Name:

```text
TURNSTILE_SITE_KEY
```

Value: paste the Turnstile **Sitekey**.

Type: normal text or plaintext.

## Secret Variables

Choose the **Secret** type for each of these.

### 5. Turnstile secret key

Name:

```text
TURNSTILE_SECRET_KEY
```

Value: paste the private Turnstile **Secret key**.

### 6. Moderator key

Name:

```text
ADMIN_KEY
```

Value: paste the `ADMIN_KEY` from `tools/generate-secrets.html`.

### 7. Hashing salt

Name:

```text
IP_HASH_SALT
```

Value: paste the `IP_HASH_SALT` from `tools/generate-secrets.html`.

Save every variable. Add them to the **Production** environment. Adding the same values to **Preview** is useful when you want test deployments to work too.

---

# Part 9 — Redeploy After Adding the Settings

Bindings and variables do not change an already-finished deployment until the project is deployed again.

1. Open the **Deployments** tab in your Pages project.
2. Find the newest production deployment.
3. Open its menu, usually shown as three dots.
4. Choose **Retry deployment** or **Redeploy**.
5. Wait for a green success message.

Another way to redeploy is to make a small change in GitHub and commit it. Cloudflare automatically deploys every new commit on the connected production branch.

---

# Part 10 — Check That Everything Is Connected

Open this address, replacing the beginning with your real Pages address:

```text
https://YOUR-PROJECT.pages.dev/api/health
```

A correctly configured project returns something similar to:

```json
{
  "ready": true,
  "checks": {
    "database": true,
    "turnstileSiteKey": true,
    "turnstileSecret": true,
    "adminKey": true,
    "ipHashSalt": true
  }
}
```

If any item says `false`, return to the matching step and correct its name or value. Variable names must match exactly.

---

# Part 11 — Test a Real Submission

1. Open your live homepage.
2. Press **Submit a website**.
3. Use a real HTTPS website that you own or officially represent.
4. Enter a description between 50 and 350 characters.
5. Choose a category.
6. Tick both confirmation boxes.
7. Complete Turnstile.
8. Press **Submit website for review**.
9. You should see a green success message.

The listing does not appear publicly yet because it is waiting for manual review.

---

# Part 12 — Approve the Submission

1. Open:

```text
https://YOUR-PROJECT.pages.dev/admin/
```

2. Paste your private `ADMIN_KEY`.
3. Press **Open dashboard**.
4. The new submission appears under **Pending**.
5. Open the submitted website in a new tab and inspect it.
6. Press **Approve** when it follows the rules.
7. Return to the public homepage.
8. Refresh the page.
9. The approved listing should now appear.

Other moderator buttons let you:

- Reject a pending listing
- Feature an approved listing
- Suspend a listing
- Restore a rejected or suspended listing
- View visitor reports
- Permanently delete a record

The administrator key is kept only in the current browser tab using session storage. Closing the tab locks the dashboard again.

---

# Part 13 — Test the Two-Per-Day Limit

Only do this with websites you are allowed to submit.

1. Make one valid submission.
2. Make a second valid submission using the same email and internet connection.
3. Attempt a third valid submission.
4. The third submission should be rejected with a daily-limit message.

The counter uses the `Europe/London` calendar date because that is the value in `RATE_LIMIT_TIMEZONE`.

---

# Part 14 — Add Your Own Domain Later

The free `pages.dev` address is enough to launch. A custom domain is optional.

1. Open your Pages project.
2. Open **Custom domains**.
3. Press **Set up a domain**.
4. Enter the domain or subdomain you want to use.
5. Follow Cloudflare's DNS instructions.
6. After the domain works, return to the Turnstile widget and add the new hostname.
7. Change `SITE_URL` to the new complete HTTPS address.
8. Redeploy the project.

Do not manually create only a CNAME and skip the Pages **Set up a domain** screen. Associate the domain with the Pages project first.

---

# Part 15 — Change the Website Name

To rename the project everywhere:

1. Search the repository files for `WebLaunch Directory`.
2. Replace it with the new name in the public HTML pages and README.
3. Change the Cloudflare `SITE_NAME` variable.
4. Commit the changes to GitHub.
5. Cloudflare deploys the update automatically.

The repository name and the public website name do not have to be identical.

---

# Common Problems

## The form says Turnstile is not configured

Check that `TURNSTILE_SITE_KEY` exists in **Variables and Secrets**, then redeploy.

## Turnstile appears but every submission fails

Check `TURNSTILE_SECRET_KEY`. Make sure it came from the same widget as the sitekey. Confirm the exact `pages.dev` hostname is allowed by the widget.

## The API says the database is not connected

Check **Settings → Bindings**. The D1 binding name must be exactly `DB`. Redeploy after correcting it.

## The health page says the admin key is false

`ADMIN_KEY` must exist and contain at least 20 characters. Use the included secret generator.

## A submission says the website cannot be reached

The project requires an online HTTPS homepage. Some websites block automated requests. A moderator can change `inspectHomepage()` in `functions/_lib/validation.js` later if a less strict policy is preferred.

## The admin page says the key is incorrect

Use the exact `ADMIN_KEY` value stored in Cloudflare. Secret values cannot normally be viewed after saving, so replace it with a newly generated key when it has been lost.

## Changes on GitHub are not visible

Open the Pages project's **Deployments** tab. Confirm the newest GitHub commit created a successful production deployment.

---

# Final Launch Checklist

- [ ] GitHub repository is public and contains `public`, `functions` and `database`
- [ ] Cloudflare Pages output directory is `public`
- [ ] D1 schema executed without errors
- [ ] D1 binding is named exactly `DB`
- [ ] Turnstile allows the live hostname
- [ ] All seven variables and secrets are saved
- [ ] Project was redeployed after configuration
- [ ] `/api/health` returns `ready: true`
- [ ] A test submission reaches the Pending dashboard
- [ ] Approval makes the listing public
- [ ] Privacy and terms pages contain the operator's real contact details before a serious public launch

Your directory is now live.
