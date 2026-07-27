# WebLaunch Directory

A free website directory where eligible independent websites are published automatically after anti-spam, link, availability, duplicate-domain and prohibited-content checks.

## Live architecture

```text
Cloudflare Worker
├── Static website files from public/
├── API router from src/index.js
├── Backend modules from functions/
├── D1 database binding named DB
├── Cloudflare Email Service binding named CONTACT_EMAIL
├── Turnstile bot protection
└── Static Assets binding named ASSETS
```

## Version 1.4 highlights

- Reliable domain-based listing URLs using `site.html?domain=`
- Listing pages reuse the proven `/api/sites` database endpoint
- Automatic favicon discovery with SVG, CDN and public-service fallback support
- User-provided green browser-growth logo throughout the site
- Improved spacing between submission notices
- Versioned asset URLs to prevent stale browser caches
- 31 automated tests

## Version 1.3 highlights

- Automatic publication for submissions that pass the rules
- Maximum two submissions per email hash and IP-derived hash each day
- No raw submitter email or IP addresses stored in D1
- HTTPS and homepage-only URL validation
- Affiliate, referral, tracking and URL-shortener blocking
- Same-domain redirect validation and duplicate-domain prevention
- High-confidence pornography, explicit-adult, gambling and illegal-content screening
- Exact ID-based listing API so listing pages no longer depend on a nested slug endpoint
- Clean category URLs such as `/category/travel`
- Actual website favicons loaded through a privacy-conscious Worker proxy with letter fallback
- Private Contact page for listing reports and general messages
- Contact destination address stored only as a Cloudflare secret
- Cloudflare Email Service delivery to a verified private destination
- Daily contact-form limits using hashed email and IP identifiers
- PayPal donation reminder after every successful publication
- Optional PayPal buttons without paid placement or ranking benefits
- New vector WebLaunch logo, responsive layout and custom mobile dropdowns
- Private suspension/removal dashboard, RSS feed and XML sitemap

## Important limitation

Automatic screening reduces obvious abuse but cannot understand every website or detect every future change. Publication is not an endorsement. The private contact form and directory-management tools remain important for suspending or removing listings that later break the rules.

## Important files

```text
src/index.js                         Cloudflare Worker router
wrangler.jsonc                       Worker, Assets, D1 and Email binding configuration
functions/api/submit.js              Automatic validation and publication
functions/api/site.js                Exact listing lookup by permanent database ID
functions/api/favicon.js             Safe favicon discovery and proxy
functions/api/contact.js             Private contact-email endpoint
functions/_lib/validation.js         Submission, contact and prohibited-content checks
public/contact.html                  Private contact and listing-report page
public/assets/weblaunch-logo.png     User-provided website logo
public/                              HTML, CSS and browser JavaScript
database/schema.sql                  D1 database tables
database/migrations/                 Optional one-time database updates
tools/generate-secrets.html          Offline secret generator
tests/                               Automated tests
SETUP-GUIDE.md                       Beginner installation instructions
UPDATE-GUIDE-v1.4.md                 Existing-installation update guide
```

## Testing

```bash
npm ci
npm run check
npm test
```

Version 1.4 includes 31 automated tests covering automatic approval, exact listing lookup, private contact email, URL rules, privacy hashing, adult-content signals, XML escaping and Worker routing.

## Deployment

Use the existing Cloudflare Workers Git integration with:

```text
Build command: npm run check
Deploy command: npx wrangler deploy
```

Core runtime values:

```text
SITE_NAME
SITE_URL
RATE_LIMIT_TIMEZONE
TURNSTILE_SITE_KEY
TURNSTILE_SECRET_KEY
ADMIN_KEY
IP_HASH_SALT
```

Private contact-email values:

```text
CONTACT_TO_EMAIL       Secret: verified private destination inbox
CONTACT_FROM_EMAIL     Plaintext: sender address on an onboarded Cloudflare Email Service domain
CONTACT_FROM_NAME      Plaintext: optional sender name
```

Never commit secret values to GitHub. The private destination email address is not present in the public repository or browser code.

## Support the project

WebLaunch Directory remains free and has no paid placement. Optional donations do not influence eligibility or ranking.

[Donate with PayPal](https://www.paypal.com/donate/?hosted_button_id=YE9H5NCNLWU38)

## Licence

MIT
