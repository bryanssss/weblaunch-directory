<p align="center">
  <img src="public/assets/weblaunch-logo.png" alt="WebLaunch Directory logo" width="120">
</p>

<h1 align="center">WebLaunch Directory</h1>

<p align="center">
  A free, open-source website directory where eligible independent websites are checked and published automatically.
</p>

<p align="center">
  <a href="https://weblaunch-directory.bryanssss-tools.workers.dev/">
    <img src="https://img.shields.io/badge/Open%20Directory-Live-5ee1c8?style=for-the-badge&logo=cloudflare&logoColor=black" alt="Open WebLaunch Directory">
  </a>
  <a href="https://weblaunch-directory.bryanssss-tools.workers.dev/submit">
    <img src="https://img.shields.io/badge/Submit%20a%20Website-Free-63d7e4?style=for-the-badge&logo=googlechrome&logoColor=black" alt="Submit a website">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License">
  </a>
</p>

<p align="center">
  <a href="https://www.paypal.com/donate/?hosted_button_id=YE9H5NCNLWU38">
    <img src="https://img.shields.io/badge/Donate%20with-PayPal-0070ba?style=for-the-badge&logo=paypal&logoColor=white" alt="Donate with PayPal">
  </a>
</p>

---

## Live WebLaunch Directory

### [Browse the Website Directory](https://weblaunch-directory.bryanssss-tools.workers.dev/)

### [Submit a Website for Free](https://weblaunch-directory.bryanssss-tools.workers.dev/submit)

### [Browse Website Categories](https://weblaunch-directory.bryanssss-tools.workers.dev/categories.html)

### [Contact WebLaunch Directory](https://weblaunch-directory.bryanssss-tools.workers.dev/contact)

No registration, payment or subscription is required.

Eligible websites are published automatically after passing the directory’s anti-spam, availability, URL, duplicate-domain and prohibited-content checks.

---

## About WebLaunch Directory

WebLaunch Directory is a free discovery platform for independent websites, online tools, blogs, educational resources, creative projects and useful web applications.

The project is designed to provide a fair alternative to directories that sell placement or prioritise paid listings.

WebLaunch Directory does not offer:

- Paid ranking advantages
- Sponsored category positions
- Paid approval
- Affiliate listings
- Referral links
- Tracking links
- Pay-to-win placement

Optional donations help support development but never affect website approval, ranking, visibility or moderation decisions.

---

## Main Features

### Automatic Website Publication

A submitted website can appear immediately when it passes the automated checks.

The validation system checks:

- Cloudflare Turnstile verification
- HTTPS availability
- Homepage-only URLs
- Website response status
- Same-domain redirects
- Duplicate domains
- Affiliate parameters
- Referral parameters
- Tracking parameters
- URL shorteners
- Suspicious deep links
- Prohibited-content signals
- Daily submission limits

Websites that fail the checks are not published.

### Two Free Submissions Per Day

The directory allows:

- Maximum two submissions per email-derived hash per calendar day
- Maximum two submissions per IP-derived hash per calendar day

Raw submitter email addresses and raw IP addresses are not stored for submission-limit enforcement.

### Independent Website Categories

Websites can be published in categories including:

- Artificial Intelligence
- Business
- Developer Tools
- Design
- Education
- Finance
- Food and Recipes
- Health and Fitness
- Marketing
- News and Media
- Productivity
- Shopping
- Technology
- Travel
- Writing and Blogging
- Other

Each category has its own clean page.

Examples:

```text
/category/artificial-intelligence
/category/developer-tools
/category/education
/category/technology
/category/travel
/category/writing-and-blogging
```

### Individual Website Listing Pages

Every published website receives its own listing page containing:

- Website name
- Website domain
- Short description
- Category
- Website favicon
- Direct website button
- Publication information
- Report-a-problem button

Listing pages use domain-based lookup URLs:

```text
/site.html?domain=example.com
```

### Automatic Website Favicons

WebLaunch Directory attempts to retrieve the real favicon of each listed website automatically.

The favicon system can check:

- Icons declared in the website HTML
- `/favicon.ico`
- `/favicon.png`
- `/favicon.svg`
- Apple touch icons
- Supported CDN-hosted icons
- Public favicon fallback services

When no valid favicon is available, the interface displays a letter-based fallback.

### Clean Category Pages

Selecting a category takes the visitor directly to that category’s page rather than returning them to the full category overview.

For example:

```text
/category/travel
```

shows Travel websites.

```text
/category/productivity
```

shows Productivity websites.

### Website Search and Discovery

Visitors can:

- Browse recently added websites
- Search directory listings
- Browse individual categories
- Open dedicated website pages
- Visit the original website
- Report broken or prohibited listings

### Private Contact Page

Visitors can use the Contact page to:

- Report a broken website
- Report prohibited content
- Report an incorrect description
- Report a suspicious redirect
- Ask about a listing
- Ask a general directory question

Contact messages are saved privately in Cloudflare D1.

The directory owner’s personal email address is not displayed publicly.

### Private Contact Inbox

Contact messages can be read through the protected administration dashboard.

The inbox includes:

- Visitor name
- Private reply email
- Subject
- Full message
- Related website information
- Date received
- Message status

Available actions include:

- Reply by email
- Mark resolved
- Reopen
- Delete permanently

### Private Administration Dashboard

The administration dashboard allows the directory owner to:

- View live websites
- View older pending submissions
- Suspend websites
- Restore websites
- Remove websites
- Feature selected listings
- Review visitor reports
- Read contact messages
- Resolve contact messages
- Delete contact records
- View directory statistics

The dashboard is protected by a private `ADMIN_KEY`.

### Optional PayPal Support

A PayPal donation button is included in the website footer and support sections.

An optional donation reminder can also appear after a website has been published successfully.

Donations never influence:

- Automatic approval
- Directory ranking
- Category position
- Featured placement
- Suspension decisions
- Removal decisions

---

## Submission Rules

WebLaunch Directory accepts genuine independent websites, blogs, tools, resources and online projects.

A submitted website must:

- Use HTTPS
- Point to the main homepage
- Be publicly available
- Have a clear purpose
- Use an honest title
- Use an accurate description
- Follow the directory rules
- Pass Cloudflare Turnstile
- Pass the automated safety checks

Submissions may be rejected, suspended or removed when they contain:

- Affiliate links
- Referral links
- Tracking links
- URL shorteners
- Suspicious redirects
- Duplicate domains
- Pornographic content
- Explicit adult services
- Gambling content
- Malware
- Phishing
- Deceptive downloads
- Illegal services
- Misleading descriptions
- Dangerous content
- Automatically generated spam
- Websites that are unavailable
- Deep links submitted instead of the homepage

Publication is not an endorsement, recommendation or security guarantee.

---

## Privacy

WebLaunch Directory is designed to minimise unnecessary personal-data collection.

### Submission Privacy

For website-submission limits:

- Raw submitter IP addresses are not stored
- Raw submission email addresses are not stored
- Email addresses are converted into one-way hashes
- IP-derived identifiers are converted into one-way hashes
- A private salt protects stored hashes
- Daily counters are separated by calendar date

### Contact-Form Privacy

Contact messages need to contain enough information for the directory owner to read and respond to them.

Private contact records may include:

- Visitor name
- Visitor reply email
- Subject
- Message
- Related listing information
- Hashed email identifier
- Hashed IP-derived identifier
- Date received

Contact messages are not displayed publicly.

### Secrets

The following values must never be committed to GitHub:

```text
TURNSTILE_SECRET_KEY
ADMIN_KEY
IP_HASH_SALT
```

Never publish private values in:

- GitHub commits
- GitHub issues
- Pull requests
- Screenshots
- Public documentation
- Browser JavaScript
- HTML files

---

## Security Features

The project includes:

- Cloudflare Turnstile
- Server-side URL validation
- HTTPS enforcement
- Redirect inspection
- Duplicate-domain prevention
- D1 database constraints
- Transactional daily limits
- Hashed submission identifiers
- Hashed contact-form identifiers
- Private administration key
- Contact-form rate limits
- Honeypot anti-bot fields
- Input-length restrictions
- HTML escaping
- XML escaping
- Content Security Policy
- Security headers
- Safe favicon proxying
- Prohibited-content signals

---

## Architecture

```text
Cloudflare Worker
├── Static website files from public/
├── Main API router from src/index.js
├── Backend modules from functions/
├── Cloudflare D1 database
├── Private D1 contact inbox
├── Cloudflare Turnstile
├── Static Assets binding named ASSETS
└── D1 binding named DB
```

### Technology Stack

- HTML
- CSS
- Vanilla JavaScript
- Cloudflare Workers
- Cloudflare Static Assets
- Cloudflare D1
- Cloudflare Turnstile
- Node.js
- GitHub
- Git-based Cloudflare deployment

No frontend framework is required.

---

## Project Structure

```text
weblaunch-directory/
├── public/
│   ├── index.html
│   ├── submit.html
│   ├── categories.html
│   ├── site.html
│   ├── contact.html
│   ├── rules.html
│   ├── about.html
│   ├── privacy.html
│   ├── terms.html
│   ├── 404.html
│   ├── _redirects
│   ├── admin/
│   │   └── index.html
│   └── assets/
│       ├── css/
│       │   └── styles.css
│       ├── js/
│       │   ├── common.js
│       │   ├── home.js
│       │   ├── categories.js
│       │   ├── site.js
│       │   ├── submit.js
│       │   ├── contact.js
│       │   └── admin.js
│       ├── favicon.png
│       └── weblaunch-logo.png
├── src/
│   └── index.js
├── functions/
│   ├── api/
│   │   ├── health.js
│   │   ├── config.js
│   │   ├── submit.js
│   │   ├── categories.js
│   │   ├── site.js
│   │   ├── favicon.js
│   │   ├── contact.js
│   │   ├── report.js
│   │   ├── sites/
│   │   └── admin/
│   ├── _lib/
│   │   ├── validation.js
│   │   ├── turnstile.js
│   │   ├── contact-inbox.js
│   │   └── shared helpers
│   ├── sitemap.xml.js
│   ├── feed.xml.js
│   └── robots.txt.js
├── database/
│   ├── schema.sql
│   └── migrations/
├── tools/
│   └── generate-secrets.html
├── tests/
├── wrangler.jsonc
├── package.json
├── package-lock.json
├── SETUP-GUIDE.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── LICENSE
└── README.md
```

---

## Important Files

| File | Purpose |
|---|---|
| `src/index.js` | Main Cloudflare Worker router |
| `wrangler.jsonc` | Worker, Static Assets and D1 configuration |
| `functions/api/submit.js` | Website checks and automatic publication |
| `functions/api/sites/index.js` | Public website search and listing results |
| `functions/api/site.js` | Individual website lookup |
| `functions/api/categories.js` | Category names and listing totals |
| `functions/api/favicon.js` | Favicon discovery and safe proxy |
| `functions/api/contact.js` | Private contact-form endpoint |
| `functions/api/report.js` | Website-report endpoint |
| `functions/_lib/validation.js` | URL, form and prohibited-content validation |
| `functions/_lib/contact-inbox.js` | Private D1 contact-inbox helpers |
| `public/contact.html` | Public contact and listing-report page |
| `public/admin/index.html` | Private management dashboard |
| `public/assets/weblaunch-logo.png` | Main WebLaunch Directory logo |
| `database/schema.sql` | Main D1 database schema |
| `database/migrations/` | Database updates |
| `tools/generate-secrets.html` | Offline security-key generator |
| `tests/` | Automated test suite |
| `SETUP-GUIDE.md` | Beginner installation instructions |

---

## Database

Cloudflare D1 stores:

- Website listings
- Submission counters
- Visitor reports
- Report limits
- Private contact messages
- Contact-form limits

Important tables include:

```text
sites
submission_limits
reports
report_limits
contact_messages
contact_limits
```

Database constraints help prevent:

- Duplicate domains
- Invalid listing statuses
- Invalid daily counters
- Duplicate reports
- Inconsistent contact records

---

## Required Cloudflare Bindings

The Worker requires:

```text
ASSETS
DB
```

### ASSETS

The `ASSETS` binding serves files from:

```text
public/
```

This includes:

- HTML pages
- CSS
- Browser JavaScript
- Logo
- Browser favicon
- Admin dashboard

### DB

The `DB` binding connects the Worker to the existing Cloudflare D1 database.

The `wrangler.jsonc` configuration should include the real database name and ID:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "weblaunch-directory-db",
    "database_id": "YOUR-CLOUDFLARE-DATABASE-ID"
  }
]
```

Do not create a second database with the same name.

---

## Required Runtime Variables

Add runtime variables under:

```text
Cloudflare
→ Workers & Pages
→ weblaunch-directory
→ Settings
→ Variables and secrets
```

### Plaintext Variables

```text
SITE_NAME
SITE_URL
RATE_LIMIT_TIMEZONE
TURNSTILE_SITE_KEY
```

Recommended values:

```text
SITE_NAME=WebLaunch Directory
SITE_URL=https://weblaunch-directory.bryanssss-tools.workers.dev
RATE_LIMIT_TIMEZONE=Europe/London
```

### Secret Variables

```text
TURNSTILE_SECRET_KEY
ADMIN_KEY
IP_HASH_SALT
```

Generate secure values locally with:

```text
tools/generate-secrets.html
```

After changing a runtime secret, press **Deploy** in Cloudflare.

---

## Installation

### 1. Download or Clone the Repository

```bash
git clone https://github.com/bryanssss/weblaunch-directory.git
cd weblaunch-directory
```

### 2. Install Dependencies

```bash
npm ci
```

### 3. Check the Project

```bash
npm run check
```

### 4. Run Tests

```bash
npm test
```

### 5. Configure Cloudflare

Connect:

- Existing D1 database
- Static Assets
- Turnstile
- Runtime variables
- Private secrets

### 6. Deploy

```bash
npx wrangler deploy
```

---

## Testing

Run syntax checks:

```bash
npm run check
```

Run the complete automated test suite:

```bash
npm test
```

The test suite covers areas including:

- Automatic publication
- Daily submission limits
- URL normalisation
- HTTPS enforcement
- Homepage validation
- Affiliate-link blocking
- Tracking-parameter blocking
- URL-shortener blocking
- Duplicate domains
- Redirect handling
- Adult-content signals
- Private identifier hashing
- Listing lookup
- Category routing
- Favicons
- Contact inbox
- Administration endpoints
- Worker routing
- XML escaping
- Sitemap generation

---

## Cloudflare Deployment

Recommended Cloudflare Git build settings:

```text
Production branch: main
Build command: npm run check
Deploy command: npx wrangler deploy
Root directory: /
```

Every commit to `main` can trigger a new deployment automatically.

After deployment, open:

```text
https://weblaunch-directory.bryanssss-tools.workers.dev/api/health
```

A healthy installation should report:

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

---

## Administration Dashboard

Open:

```text
https://weblaunch-directory.bryanssss-tools.workers.dev/admin/
```

Enter the current `ADMIN_KEY` stored in Cloudflare.

The administration key must never be added to:

- GitHub
- Public HTML
- Browser JavaScript
- Documentation screenshots
- Issues
- Pull requests

When the key is lost or no longer works:

1. Generate a new key with `tools/generate-secrets.html`.
2. Replace `ADMIN_KEY` under Cloudflare runtime secrets.
3. Press **Deploy**.
4. Use the new key on the dashboard.

---

## Contact Inbox

The public Contact page is available at:

```text
https://weblaunch-directory.bryanssss-tools.workers.dev/contact
```

Contact messages are stored privately in D1.

To read them:

1. Open the administration dashboard.
2. Enter the current `ADMIN_KEY`.
3. Open **Contact inbox**.
4. Select the **Open** section.
5. Read the message.
6. Reply using the visitor’s private reply address.
7. Mark the message resolved or delete it.

The owner’s personal email address is not displayed publicly.

---

## RSS Feed and Sitemap

WebLaunch Directory includes:

### RSS Feed

```text
https://weblaunch-directory.bryanssss-tools.workers.dev/feed.xml
```

### XML Sitemap

```text
https://weblaunch-directory.bryanssss-tools.workers.dev/sitemap.xml
```

### Robots File

```text
https://weblaunch-directory.bryanssss-tools.workers.dev/robots.txt
```

These resources help search engines and feed readers discover directory content.

---

## Important Limitations

Automated screening reduces obvious abuse but cannot understand every website perfectly.

A listed website may:

- Change after publication
- Introduce prohibited content later
- Hide suspicious behaviour during the first check
- Become unavailable after publication
- Redirect to a different service later
- Contain content that automated rules do not recognise

Publication is not:

- An endorsement
- A security guarantee
- A recommendation
- A legal approval
- A quality certification

The contact form, report system and administration dashboard remain important for removing rule-breaking websites.

---

## Contributing

Contributions are welcome.

Before opening a pull request:

1. Create a separate branch.
2. Make focused changes.
3. Run `npm run check`.
4. Run `npm test`.
5. Confirm that no secrets are included.
6. Explain the purpose of the change.
7. Submit the pull request against `main`.

Please read:

- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)

Never include real Cloudflare keys, database secrets or private visitor information.

---

## Potential Future Improvements

Possible future additions include:

- Scheduled website-availability checks
- Automatic broken-link detection
- Broken-site notifications
- Improved favicon caching
- Website ownership verification
- Listing update requests
- Domain-change requests
- Stronger duplicate-site detection
- Additional prohibited-content checks
- Automated stale-listing suspension
- Better search relevance
- Search suggestions
- Category recommendations
- Pagination for large directories
- Listing bookmarks
- Contact-inbox search
- Contact-inbox filters
- Improved moderation statistics
- Public API documentation
- Additional RSS feeds
- Multilingual interface support
- Improved keyboard accessibility
- Additional screen-reader guidance
- Custom-domain deployment support
- Import and export tools
- Public directory statistics
- Listing screenshots
- Website status history

---

## Support the Project

WebLaunch Directory remains free and does not sell directory placement.

Optional donations help support:

- Development
- Cloudflare hosting
- Testing
- Security improvements
- Accessibility improvements
- New directory features
- Ongoing maintenance

### Donate with PayPal

[![Donate with PayPal](https://img.shields.io/badge/Donate%20with-PayPal-0070ba?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/donate/?hosted_button_id=YE9H5NCNLWU38)

### Direct Donation Link

[https://www.paypal.com/donate/?hosted_button_id=YE9H5NCNLWU38](https://www.paypal.com/donate/?hosted_button_id=YE9H5NCNLWU38)

Donations do not influence:

- Approval
- Ranking
- Visibility
- Category position
- Featured status
- Moderation decisions

---

## Licence

WebLaunch Directory is released under the [MIT Licence](LICENSE).

You may use, copy, modify and distribute the project according to the licence terms.

---

## Project Links

- **Live directory:**  
  [https://weblaunch-directory.bryanssss-tools.workers.dev/](https://weblaunch-directory.bryanssss-tools.workers.dev/)

- **Submit a website:**  
  [https://weblaunch-directory.bryanssss-tools.workers.dev/submit](https://weblaunch-directory.bryanssss-tools.workers.dev/submit)

- **Website categories:**  
  [https://weblaunch-directory.bryanssss-tools.workers.dev/categories.html](https://weblaunch-directory.bryanssss-tools.workers.dev/categories.html)

- **Contact page:**  
  [https://weblaunch-directory.bryanssss-tools.workers.dev/contact](https://weblaunch-directory.bryanssss-tools.workers.dev/contact)

- **RSS feed:**  
  [https://weblaunch-directory.bryanssss-tools.workers.dev/feed.xml](https://weblaunch-directory.bryanssss-tools.workers.dev/feed.xml)

- **XML sitemap:**  
  [https://weblaunch-directory.bryanssss-tools.workers.dev/sitemap.xml](https://weblaunch-directory.bryanssss-tools.workers.dev/sitemap.xml)

- **GitHub repository:**  
  [https://github.com/bryanssss/weblaunch-directory](https://github.com/bryanssss/weblaunch-directory)
