# WebLaunch Directory v1.2 — Simple Cloudflare Workers Setup

## Existing installation

The fastest update instructions are in [UPDATE-GUIDE-v1.2.md](UPDATE-GUIDE-v1.2.md).

## New installation

### 1. Upload the repository to GitHub

Create a public repository named `weblaunch-directory`, then upload everything inside the extracted project folder.

### 2. Create or connect the Cloudflare Worker

Connect the GitHub repository to a Cloudflare Worker and use:

```text
Build command: npm run check
Deploy command: npx wrangler deploy
Root directory: /
```

### 3. Connect D1

Create a D1 database named `weblaunch-directory-db` and connect it to the Worker with the exact binding name:

```text
DB
```

Open the D1 Console, copy all of `database/schema.sql`, paste it and press **Execute**.

### 4. Confirm the static-assets binding

The deployment should create:

```text
ASSETS
```

Do not delete it.

### 5. Add runtime variables

Add these as Plaintext runtime variables:

```text
SITE_NAME = WebLaunch Directory
SITE_URL = https://weblaunch-directory.bryanssss-tools.workers.dev
RATE_LIMIT_TIMEZONE = Europe/London
TURNSTILE_SITE_KEY = your public Turnstile site key
```

Add these as encrypted Secret runtime values:

```text
TURNSTILE_SECRET_KEY = your private Turnstile secret
ADMIN_KEY = your generated administrator key
IP_HASH_SALT = your generated privacy salt
```

Generate the last two values by opening `tools/generate-secrets.html` locally.

### 6. Configure Turnstile

Allow this hostname in the Turnstile widget:

```text
weblaunch-directory.bryanssss-tools.workers.dev
```

Do not include `https://` or `/submit`.

### 7. Test health

Open:

```text
https://weblaunch-directory.bryanssss-tools.workers.dev/api/health
```

All checks must be `true`.

### 8. Test automatic publication

Open `/submit`, complete the form and Turnstile, then press **Check and publish website**. A website that passes the automated checks is inserted with `approved` status and appears publicly without manual approval.

### 9. Manage reports and listings

Open `/admin/` and enter `ADMIN_KEY`. The dashboard starts on **Live** listings. Use it to feature, suspend, restore or delete websites and inspect reports.

## Part 12 — Configure the private Contact page

Version 1.3 uses Cloudflare Email Service. Add and verify the private destination inbox under **Compute → Email Service → Email Routing → Destination Addresses**. Onboard a sender domain under **Email Sending**.

The Worker configuration creates a send binding named `CONTACT_EMAIL`. Add these runtime settings:

```text
CONTACT_TO_EMAIL = private verified inbox (Secret)
CONTACT_FROM_EMAIL = sender address on the onboarded domain (Plaintext)
CONTACT_FROM_NAME = WebLaunch Directory (Plaintext)
```

The destination address is never included in the public repository or browser code. Open `/api/health` and confirm `contact.ready` is true, then test `/contact`.
