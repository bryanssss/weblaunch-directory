# WebLaunch Directory v1.5 — Cloudflare-Only Contact Inbox

This update removes the need for a custom sender domain and Cloudflare Email Sending.

The Contact page now saves messages privately inside your existing Cloudflare D1 database. You read them from the protected `/admin/` dashboard after entering your `ADMIN_KEY`.

## What changes

- No sender domain is required.
- No `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, or `CONTACT_FROM_NAME` variables are required.
- No `CONTACT_EMAIL` binding is required.
- Visitors still enter a reply email, but it is visible only inside the protected administrator dashboard.
- Contact messages can be marked resolved, reopened, replied to through your normal email program, or permanently deleted.
- The contact form still uses Turnstile and a five-message daily limit.

---

# Part 1 — Fix `wrangler.jsonc` before uploading v1.5

Your last Cloudflare build failed because Wrangler tried to create another D1 database with the same name. Do not press Retry until this file is corrected.

## 1. Find your real database ID

1. Open Cloudflare.
2. Open **Storage & databases**.
3. Open **D1 SQL Database**.
4. Open **weblaunch-directory-db**.
5. On the Overview page, find **Database ID**.
6. Press the copy icon beside the long ID.

It looks similar to:

```text
12345678-abcd-1234-abcd-123456789abc
```

Use your real ID, not the example above.

## 2. Edit `wrangler.jsonc` in GitHub

1. Open your GitHub repository `bryanssss/weblaunch-directory`.
2. Make sure the branch is **main**.
3. Open `wrangler.jsonc`.
4. Press the pencil icon.
5. Find the bottom section beginning with `d1_databases`.

Replace the entire `d1_databases` and `send_email` sections with this:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "weblaunch-directory-db",
    "database_id": "PASTE-YOUR-REAL-DATABASE-ID-HERE"
  }
]
```

Important:

- Paste your real D1 Database ID inside the quotation marks.
- Keep `DB` exactly as uppercase letters.
- Delete the entire old `send_email` section.
- If `d1_databases` is the final section in the file, do not add a comma after its closing `]`.

The bottom of your file should look like this:

```jsonc
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "weblaunch-directory-db",
      "database_id": "YOUR-REAL-DATABASE-ID"
    }
  ]
}
```

6. Commit with this message:

```text
Use existing D1 database and remove email binding
```

7. Wait for Cloudflare to deploy successfully before continuing.

---

# Part 2 — Upload v1.5

## 1. Extract the ZIP

1. Download `weblaunch-directory-v1.5.0-update-only.zip`.
2. Right-click it in Downloads.
3. Select **Extract All**.
4. Open the extracted folder.
5. Open the inner folder named `weblaunch-directory`.

## 2. Upload to GitHub

1. Open `bryanssss/weblaunch-directory`.
2. Confirm the branch says **main**.
3. Press **Add file**.
4. Press **Upload files**.
5. Select everything inside the extracted `weblaunch-directory` folder.
6. Drag the files into GitHub.
7. Wait for the upload list to finish.
8. Use this commit message:

```text
Add private Cloudflare D1 contact inbox
```

9. Select **Commit directly to the main branch**.
10. Press **Commit changes**.

Do not upload the ZIP itself.

---

# Part 3 — Wait for Cloudflare

1. Open Cloudflare.
2. Open **Workers & Pages**.
3. Open **weblaunch-directory**.
4. Open **Deployments**.
5. Wait for the latest build.
6. Confirm it says **Success** and receives **100% traffic**.

The build should pass 33 automated tests.

You do not need to:

- create another Worker;
- create another D1 database;
- configure Email Sending;
- onboard a sender domain;
- add contact email variables;
- run a SQL migration manually.

The first Contact or Admin request automatically creates the new private inbox table.

---

# Part 4 — Test the Contact page

1. Open:

```text
https://weblaunch-directory.bryanssss-tools.workers.dev/contact
```

2. Press `Ctrl + F5`.
3. Enter a name.
4. Enter a reply email address.
5. Enter a subject.
6. Write a message of at least 20 characters.
7. Complete Turnstile.
8. Press **Save message privately**.

You should see:

```text
Your message has been saved in the private contact inbox.
```

The owner's Yahoo address is not shown anywhere on the public page.

---

# Part 5 — Read messages privately

1. Open:

```text
https://weblaunch-directory.bryanssss-tools.workers.dev/admin/
```

2. Enter your existing `ADMIN_KEY`.
3. Press **Open dashboard**.
4. Press **Contact inbox**.
5. Open the **Open** section.

Each message shows:

- the visitor's name;
- the visitor's private reply email;
- the subject;
- the message;
- the related listing, when it came from a report button;
- the received date.

Available actions:

- **Reply by email** — opens your normal email program with the visitor's address filled in;
- **Mark resolved**;
- **Reopen**;
- **Delete permanently**.

The visitor's reply email and message are visible only inside this protected dashboard.

---

# Part 6 — Check health

Open:

```text
https://weblaunch-directory.bryanssss-tools.workers.dev/api/health
```

The contact section should look like:

```json
"contact": {
  "ready": true,
  "checks": {
    "databaseInbox": true,
    "turnstile": true,
    "adminAccess": true
  }
}
```

There should no longer be checks for recipient or sender email addresses.

---

# About the Yahoo verification

You may leave `boyanminchev@yahoo.co.uk` verified in Cloudflare. It does no harm, but v1.5 does not send contact messages to Yahoo automatically.

Messages are saved in D1 and opened from the private administrator dashboard. To receive automatic email delivery later, Cloudflare requires a sender address from a domain configured for its email service.
