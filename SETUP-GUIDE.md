# WebLaunch Directory — Simple Cloudflare Workers Setup

This guide matches Cloudflare's current **Workers & Pages** dashboard.

## Part 1 — Put the fixed files on GitHub

1. Extract the ZIP.
2. Open the extracted `weblaunch-directory` folder.
3. Upload all files and folders to your existing GitHub repository named `weblaunch-directory`.
4. Allow GitHub to replace files with the same names.
5. Commit with the message `Upgrade to Worker backend v1.1`.

The most important new files are:

```text
src/index.js
wrangler.jsonc
package.json
package-lock.json
```

Keep these existing folders too:

```text
functions
public
database
tests
tools
```

## Part 2 — Use the Worker you already created

Do not create another application. Open:

```text
Workers & Pages → weblaunch-directory
```

Your existing address can remain:

```text
https://weblaunch-directory.bryanssss-tools.workers.dev
```

## Part 3 — Correct the build command

1. Open the `weblaunch-directory` Worker.
2. Open **Settings**.
3. Open **Builds**.
4. Find the build configuration.
5. Set the build command to:

```text
npm run check
```

6. Set the deploy command to:

```text
npx wrangler deploy
```

7. Save.

The old deploy command `npx wrangler versions upload` only uploads a version. The new command deploys it to production.

## Part 4 — Wait for GitHub deployment

After committing the files, Cloudflare should start a new build automatically.

A successful log should include a real deployment and should not finish by telling you to run `wrangler versions deploy` yourself.

## Part 5 — Find the D1 database

The `wrangler.jsonc` file asks Cloudflare to provide a D1 binding called `DB`.

1. Open the Worker.
2. Open **Bindings**.
3. Find `DB`.
4. Open the connected D1 database.
5. Open its **Console**.
6. Open `database/schema.sql` from the repository.
7. Copy all of it.
8. Paste it into the D1 Console.
9. Press **Execute**.

## Part 6 — Add normal variables

Open:

```text
Worker → Settings → Variables and Secrets
```

Add these as normal text variables:

```text
SITE_NAME = WebLaunch Directory
SITE_URL = https://weblaunch-directory.bryanssss-tools.workers.dev
RATE_LIMIT_TIMEZONE = Europe/London
TURNSTILE_SITE_KEY = your Turnstile site key
```

## Part 7 — Add private secrets

Add these as secrets:

```text
TURNSTILE_SECRET_KEY = your Turnstile secret key
ADMIN_KEY = your generated administrator key
IP_HASH_SALT = your generated privacy salt
```

To generate `ADMIN_KEY` and `IP_HASH_SALT`, open this file on your computer:

```text
tools/generate-secrets.html
```

## Part 8 — Configure Turnstile

In the Turnstile widget's allowed hostnames, add:

```text
weblaunch-directory.bryanssss-tools.workers.dev
```

Do not include `https://` and do not include `/submit`.

## Part 9 — Test the health page

Open:

```text
https://weblaunch-directory.bryanssss-tools.workers.dev/api/health
```

The correct result is:

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

## Part 10 — Test the form

Open:

```text
https://weblaunch-directory.bryanssss-tools.workers.dev/submit
```

Then submit a real HTTPS homepage.

## Part 11 — Approve the submission

Open:

```text
https://weblaunch-directory.bryanssss-tools.workers.dev/admin/
```

Paste your `ADMIN_KEY`, open Pending submissions, and approve the listing.
