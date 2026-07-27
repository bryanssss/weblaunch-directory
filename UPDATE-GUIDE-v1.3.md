# WebLaunch Directory v1.3 — Exact Update Guide

This update is for the existing Worker and GitHub repository. Do not create a new Worker, database or repository.

## What this update fixes and adds

- Fixes listing pages with a new exact database-ID API.
- Restores a permanent “Report a problem with this listing” link.
- Adds a private Contact page.
- Sends contact messages through Cloudflare Email Service.
- Keeps the destination inbox out of the public repository and browser code.
- Pulls listed websites’ favicons through the Worker, with a letter fallback.
- Shows an optional PayPal donation window after a website is published.
- Adds the new WebLaunch vector logo.

## Part 1 — Close the old conflicting GitHub pull request

The pull request named `Add Cloudflare Workers configuration #1` is an old Cloudflare-generated branch. Its conflicted files contain the original version and must not replace the newer files on `main`.

1. Open the repository on GitHub.
2. Open **Pull requests**.
3. Open `Add Cloudflare Workers configuration #1`.
4. Scroll to the bottom.
5. Press **Close pull request**.
6. Do not press **Accept current change**, **Accept incoming change**, **Mark as resolved**, or **Merge**.
7. Return to **Code** and confirm the branch selector says `main`.

The website deployment should continue to use `main`.

## Part 2 — Prepare Cloudflare Email Service

The Contact page sends only to a private, verified destination address. The address is stored as a Worker secret and is not included in GitHub.

### A. Verify the private destination inbox

1. Open the Cloudflare dashboard.
2. Use **Quick search** and enter `Email Service`.
3. Open **Email Service**.
4. Open **Email Routing**.
5. Open **Destination Addresses**.
6. Add the private inbox that should receive contact messages.
7. Open the verification email sent by Cloudflare.
8. Press the verification link.
9. Return to Cloudflare and confirm the destination says **Verified**.

### B. Onboard a sender domain

The sender address must use a domain in the Cloudflare account. It does not need to be the private destination inbox.

1. In **Email Service**, open **Email Sending**.
2. Press **Onboard Domain**.
3. Choose a domain in the Cloudflare account.
4. Allow Cloudflare to add the required email DNS records.
5. Wait until the domain is shown as ready.
6. Choose a sender address on that domain, for example:

```text
weblaunch@your-domain.example
```

The sender address is only used by Cloudflare to deliver the private contact message.

## Part 3 — Upload v1.3 to GitHub

1. Download and extract `weblaunch-directory-v1.3.0-update-only.zip`.
2. Open the extracted `weblaunch-directory` folder.
3. Open the existing GitHub repository.
4. Make sure the branch selector says `main`.
5. Press **Add file**.
6. Press **Upload files**.
7. Select everything inside the extracted `weblaunch-directory` folder.
8. Drag the files and folders into GitHub.
9. Allow files with the same names to be replaced.
10. Use this commit message:

```text
Upgrade WebLaunch Directory to v1.3
```

11. Press **Commit changes**.

Do not upload the ZIP file itself.

## Part 4 — Wait for Cloudflare deployment

1. Open **Workers & Pages**.
2. Open `weblaunch-directory`.
3. Open **Deployments**.
4. Wait for the new `main` build.
5. Confirm it becomes the active deployment with 100% traffic.

The existing commands remain:

```text
Build command: npm run check
Deploy command: npx wrangler deploy
```

The build should pass 29 tests. The Wrangler configuration adds the email binding named:

```text
CONTACT_EMAIL
```

## Part 5 — Add the private contact settings

Open:

```text
Workers & Pages
→ weblaunch-directory
→ Settings
→ Variables and secrets
```

Add these values.

### CONTACT_TO_EMAIL

```text
Type: Secret
Name: CONTACT_TO_EMAIL
Value: your verified private destination inbox
```

### CONTACT_FROM_EMAIL

```text
Type: Plaintext
Name: CONTACT_FROM_EMAIL
Value: the sender address on the onboarded domain
```

Example:

```text
weblaunch@your-domain.example
```

### CONTACT_FROM_NAME

```text
Type: Plaintext
Name: CONTACT_FROM_NAME
Value: WebLaunch Directory
```

Press **Deploy** after adding the values.

Keep these existing private values as **Secret**, not Plaintext:

```text
ADMIN_KEY
IP_HASH_SALT
TURNSTILE_SECRET_KEY
CONTACT_TO_EMAIL
```

## Part 6 — Check the health page

Open:

```text
https://weblaunch-directory.bryanssss-tools.workers.dev/api/health
```

The original checks should remain true. A new contact section should also appear:

```json
{
  "contact": {
    "ready": true,
    "checks": {
      "emailBinding": true,
      "recipient": true,
      "sender": true
    }
  }
}
```

When one contact value is false, return to Variables and Secrets and correct the corresponding setting.

## Part 7 — Test the fixed listing page

1. Open the Discover page.
2. Press `Ctrl + F5`.
3. Click the website name or **View listing**.
4. The listing should load through the exact endpoint:

```text
/api/site?id=THE_DATABASE_ID
```

The browser may still show the clean public address:

```text
/site/ID-domain-slug
```

The report button should be visible underneath the listing. It opens the Contact page with the listing reference already attached.

## Part 8 — Test the Contact page

Open:

```text
https://weblaunch-directory.bryanssss-tools.workers.dev/contact
```

1. Enter a name and reply email.
2. Enter a subject and a message of at least 20 characters.
3. Complete Turnstile.
4. Press **Send message**.
5. Check the private destination inbox.
6. Check the spam folder when the first test message is not in the inbox.

The destination inbox address is never printed on the Contact page.

## Part 9 — Test favicons

Return to the Discover page and press `Ctrl + F5`.

- A website favicon should replace the single letter when the website provides a valid icon.
- The original letter remains as a safe fallback when no usable favicon is available.
- Favicons are fetched through the Worker rather than loaded directly from the visitor’s browser.

## Part 10 — Test the donation window

Submit a new eligible website.

After automatic publication, a window should appear with:

- **Donate with PayPal**
- **View live listing**
- **Not now**

The donation is optional and does not affect publication or ranking.

## Logo file

The current logo is stored here:

```text
public/assets/weblaunch-logo.svg
```

Replacing that one file changes the logo in the header and footer across the whole public website.
