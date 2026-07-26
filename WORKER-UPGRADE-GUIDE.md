# WebLaunch Directory — Cloudflare Worker Upgrade

This v1.1 release is made for Cloudflare's current **Workers & Pages** dashboard, where new Git applications may be created as Workers rather than showing a separate Pages option.

## What changed

- Added `src/index.js`, which routes all API calls to the existing backend modules.
- Added `wrangler.jsonc` for Worker Static Assets, D1 and clean listing routes.
- Changed deployment to `npx wrangler deploy`.
- Kept the existing public design, database schema, validation rules and moderation dashboard.

## Files that must reach GitHub

Upload or replace the complete repository, especially:

```text
src/index.js
wrangler.jsonc
package.json
```

The original `functions`, `public`, `database`, `tests` and `tools` folders must remain.

## Cloudflare build settings

Open the existing `weblaunch-directory` Worker and use:

```text
Build command: npm run check
Deploy command: npx wrangler deploy
Root directory: /
```

Cloudflare may automatically provision a D1 database for the `DB` binding on the first deployment. Open the Worker **Bindings** tab after deployment to see which database is connected.

## Required variables and secrets

Add these under the Worker's Settings / Variables and Secrets area:

```text
SITE_NAME = WebLaunch Directory
SITE_URL = https://weblaunch-directory.bryanssss-tools.workers.dev
RATE_LIMIT_TIMEZONE = Europe/London
TURNSTILE_SITE_KEY = your public Turnstile site key
```

Add these as secrets:

```text
TURNSTILE_SECRET_KEY = your private Turnstile secret
ADMIN_KEY = your generated administrator key
IP_HASH_SALT = your generated privacy salt
```

The config uses `keep_vars: true`, so dashboard variables remain during deployments.

## Initialise the database

1. Open the D1 database connected as `DB`.
2. Open **Console**.
3. Copy everything from `database/schema.sql`.
4. Paste it into the console and press **Execute**.

## Test

Open:

```text
https://weblaunch-directory.bryanssss-tools.workers.dev/api/health
```

All checks should be `true`.
