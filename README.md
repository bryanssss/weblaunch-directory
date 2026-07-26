# WebLaunch Directory

A free, human-reviewed directory where people can submit independent websites without affiliate links, referral tracking or paid placement.

## Live architecture

```text
Cloudflare Worker
├── Static website files from public/
├── API router from src/index.js
├── Existing backend modules from functions/
├── D1 database binding named DB
└── Turnstile bot protection
```

## Main features

- Two submissions per email per day
- Two submissions per IP-derived hash per day
- No raw email or IP storage
- Affiliate, referral and tracking-link blocking
- Homepage-only URL rules
- Duplicate-domain detection
- Turnstile verification
- Manual moderation dashboard
- Website search and categories
- Reports, RSS feed and XML sitemap
- Responsive public interface

## Important files

```text
src/index.js           Cloudflare Worker router
wrangler.jsonc         Worker, assets and D1 configuration
functions/             Backend request handlers
public/                HTML, CSS, JavaScript and admin interface
database/schema.sql    D1 database tables and safeguards
tools/                 Offline secret generator
tests/                 Automated validation and routing tests
SETUP-GUIDE.md         Beginner installation instructions
```

## Testing

```bash
npm ci
npm run check
npm test
```

The included suite tests URL rules, privacy hashing, administrator authentication, XML escaping, form validation and Worker routing.

## Deployment

Use the existing Cloudflare Workers Git integration with:

```text
Build command: npm run check
Deploy command: npx wrangler deploy
```

See [SETUP-GUIDE.md](SETUP-GUIDE.md) for the complete beginner guide.

## Security

Never commit these values to GitHub:

```text
TURNSTILE_SECRET_KEY
ADMIN_KEY
IP_HASH_SALT
```

Store them as encrypted Cloudflare Worker secrets.

## Licence

MIT
