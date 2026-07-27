# WebLaunch Directory v1.5.2 — Contact Redirect Loop Fix

## Why the loop happened
Cloudflare automatically treats `contact.html` as the clean URL `/contact`.
The Worker was also redirecting `/contact` back to `/contact.html`, creating an endless loop.

## What changed
- Removed the Worker redirect from `/contact` to `/contact.html`
- Removed the `/contact` rewrite from `public/_redirects`
- Kept the public Contact links pointing to `/contact`
- Included the newest uploaded logo and favicon again

## Install
1. Extract the ZIP.
2. Open the inner `weblaunch-directory` folder.
3. Upload everything inside it to the root of the GitHub repository.
4. Commit directly to `main` with: `Fix contact redirect loop correctly`.
5. Wait for Cloudflare deployment to show Success and 100% traffic.
6. Open an Incognito window and visit:
   `https://weblaunch-directory.bryanssss-tools.workers.dev/contact`

Do not test `/contact.html` first. The canonical public address is `/contact`.
