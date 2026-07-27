# WebLaunch Directory v1.5.1

## What this fixes
- Fixes the `/contact` page loop by redirecting it once to `/contact.html`
- Replaces the site logo with your newly uploaded logo
- Replaces the favicon with the same new logo
- Adds cache-busting version `1.5.1` so the new logo loads properly

## What to upload
Upload the files from this update into your GitHub repo and commit them to the `main` branch.

## After uploading
1. Wait for Cloudflare to finish the new deployment.
2. Open your site.
3. Press `Ctrl + F5` on Windows.
4. Test both of these URLs:
   - `https://weblaunch-directory.bryanssss-tools.workers.dev/contact`
   - `https://weblaunch-directory.bryanssss-tools.workers.dev/contact.html`

## Important
This contact page uses the private Cloudflare D1 inbox.
It does **not** send email directly.
Messages are stored privately and can be read in your admin dashboard.
