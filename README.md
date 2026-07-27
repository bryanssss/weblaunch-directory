# WebLaunch Directory

A free website directory where eligible independent websites are published automatically after anti-spam, link, availability, duplicate-domain and prohibited-content checks.

## Live architecture

```text
Cloudflare Worker
├── Static website files from public/
├── API router from src/index.js
├── Backend modules from functions/
├── D1 database binding named DB
└── Turnstile bot protection
```

## Version 1.2.1 highlights

- Automatic publication for submissions that pass the rules
- Maximum two submissions per email hash and IP-derived hash each day
- No raw email or IP addresses stored by the application
- HTTPS and homepage-only URL validation
- Affiliate, referral, tracking and URL-shortener blocking
- Same-domain redirect validation
- Duplicate-domain prevention
- High-confidence pornography, explicit-adult, gambling and illegal-content screening
- Clean category URLs such as `/category/travel`
- Professional custom category dropdowns with internal scrolling
- Improved mobile spacing and select-arrow positioning
- Public reporting and private suspension/removal tools
- PayPal donation button using the project owner's hosted donation page
- Stable ID-based listing URLs with backward-compatible slug lookup
- RSS feed, XML sitemap and SEO-friendly listing URLs

## Important limitation

Automatic screening reduces obvious abuse but cannot understand every website or detect every future change. Publication is not an endorsement. The reporting and directory-management tools remain important for suspending or removing listings that later break the rules.

## Important files

```text
src/index.js                         Cloudflare Worker router
wrangler.jsonc                       Worker, assets and D1 configuration
functions/api/submit.js              Automatic validation and publication
functions/_lib/validation.js         URL and prohibited-content checks
public/                              HTML, CSS and browser JavaScript
database/schema.sql                  D1 database tables
database/migrations/                 Optional one-time database updates
tools/generate-secrets.html          Offline secret generator
tests/                               Automated tests
SETUP-GUIDE.md                       Beginner installation instructions
UPDATE-GUIDE-v1.2.1.md               Listing-link repair update guide
```

## Testing

```bash
npm ci
npm run check
npm test
```

Version 1.2.1 includes 23 automated tests covering URL rules, privacy hashing, admin authentication, automatic approval, adult-content signals, XML escaping and Worker routing.

## Deployment

Use the existing Cloudflare Workers Git integration with:

```text
Build command: npm run check
Deploy command: npx wrangler deploy
```

The required runtime values are:

```text
SITE_NAME
SITE_URL
RATE_LIMIT_TIMEZONE
TURNSTILE_SITE_KEY
TURNSTILE_SECRET_KEY
ADMIN_KEY
IP_HASH_SALT
```

Never commit the secret values to GitHub.

## Support the project

WebLaunch Directory remains free and has no paid placement. Optional donations do not influence eligibility or ranking.

[Donate with PayPal](https://www.paypal.com/donate/?hosted_button_id=YE9H5NCNLWU38)

## Licence

MIT
