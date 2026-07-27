# Changelog

## v1.4.0 — Reliable listing pages, uploaded logo and stronger favicons

- Replaced fragile listing links with exact domain-based `site.html?domain=` links.
- Listing details now use the same `/api/sites` endpoint already proven by the Discover page.
- Added exact `id` and `domain` filters to the public listings API.
- Kept legacy `/site/...` links compatible.
- Added SVG, AVIF, CDN-hosted and Google fallback favicon support.
- Installed the user-provided green browser-growth logo across the site.
- Added cache-busting asset versions.
- Added professional spacing between stacked submission notices.
- Added exact tests for domain and ID listing lookups.

## v1.3.0 — Contact email, favicons and reliable listing pages

- Added an exact `/api/site?id=` lookup so clean listing pages load by permanent database ID.
- Kept older slug-based listing links compatible.
- Added a private Contact page for general enquiries and listing reports.
- Added Cloudflare Email Service delivery without exposing the destination inbox in public code.
- Added Turnstile and hashed email/IP daily limits to the contact form.
- Replaced the listing report modal with a link to the Contact page.
- Added proxied website favicons with a safe letter fallback.
- Added a PayPal donation reminder after every successful website publication.
- Added a new vector WebLaunch logo and updated all public pages.
- Added contact/privacy/terms wording and a Contact sitemap URL.
- Added 29 automated tests.

## v1.2.1 — Reliable listing links

- Listing cards now use a stable database-ID URL such as `/site/12-example-com`.
- Existing slug-only listing links continue to work.
- The listing API falls back to the normalised domain when an older stored slug differs.
- Listing titles are clickable as well as the “View listing” link.
- Sitemap, RSS and post-submission links use the stable listing route.


## 1.2.0

- Changed eligible new submissions from manual review to automatic publication.
- Added automatic homepage inspection with a 300 KB response limit.
- Added high-confidence pornography, explicit-adult, gambling and illegal-content checks.
- Added explicit no-pornography wording to the form, rules, terms and privacy notice.
- Added clean category routes such as `/category/travel`.
- Added category URLs to the XML sitemap.
- Replaced native mobile category menus with a dark, scrollable custom control.
- Corrected mobile form margins and dropdown-arrow placement.
- Reduced the bright green appearance of the main call-to-action buttons.
- Added PayPal donation buttons without paid placement or ranking benefits.
- Changed the private dashboard to start with live listings and retain legacy-pending support.
- Removed public listing API caching so a newly published listing appears immediately.
- Added automatic-approval and category-routing tests.
