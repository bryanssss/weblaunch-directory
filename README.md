# 🚀 WebLaunch Directory

A free, open-source and human-reviewed website directory. Visitors can discover independent websites and submit their own homepage for moderation without paying a listing fee.

## 🌐 What It Does

- Accepts free website submissions
- Limits each email address and IP-derived hash to **2 submissions per calendar day**
- Rejects non-HTTPS, deep, tracking, affiliate, referral and shortened links
- Checks redirects and rejects redirects to another domain
- Prevents duplicate domains
- Uses Cloudflare Turnstile for bot protection
- Stores only one-way hashes of submitter email and IP data
- Holds every submission for manual approval
- Includes search, categories, individual listing pages, RSS and a dynamic sitemap
- Includes a protected moderation dashboard
- Lets visitors report broken, misleading or unsafe listings
- Works on Cloudflare Pages with Pages Functions and D1

## 🧱 Technology

```text
GitHub repository
      ↓ automatic deployment
Cloudflare Pages ── public HTML, CSS and JavaScript
      ↓
Pages Functions ── validation, limits, moderation API
      ↓
Cloudflare D1 ── listings, reports and short-lived counters
      ↓
Cloudflare Turnstile ── bot protection
```

## 📁 Important Files

```text
public/                 Public website
functions/              Secure server-side Pages Functions
database/schema.sql     Database tables and indexes
tools/generate-secrets.html
                        Offline secret generator
SETUP-GUIDE.md          Beginner-friendly deployment guide
tests/                  Automated validation tests
```

## 🛡️ Submission Protection

A submission must:

1. Use `https://`.
2. Point to the main homepage.
3. Contain no query string, tracking parameter or fragment.
4. Not use a known URL shortener.
5. Stay on the same domain through redirects.
6. Be submitted by someone claiming to own or officially represent it.
7. Pass Turnstile.
8. Stay within the two-per-day email and IP limits.
9. Use a domain that has never already been submitted.
10. Wait for moderator approval.

Daily email and IP counters are updated inside one D1 database batch. If either limit fails, the entire submission is rolled back.

## 🚀 Deploy It

Follow **[SETUP-GUIDE.md](SETUP-GUIDE.md)**. It explains every click using GitHub and the Cloudflare dashboard. No command line is required.

## 🧪 Tests

Node.js 20 or newer is required only for running the optional tests:

```bash
npm test
npm run check
```

## 🔐 Never Commit Secrets

Do not place any of these values in GitHub:

- `ADMIN_KEY`
- `IP_HASH_SALT`
- `TURNSTILE_SECRET_KEY`

Store them as Cloudflare secrets. The included `tools/generate-secrets.html` file creates strong random values locally in your browser.

## ⚖️ Before a Public Launch

The included privacy and terms pages are starter text, not legal advice. Add the operator's name, contact method and any wording required in the country where the directory is operated.

## 🤝 Contributing

Bug reports and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md) first.

## 📄 Licence

MIT — see [LICENSE](LICENSE).
