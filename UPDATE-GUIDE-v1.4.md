# WebLaunch Directory v1.4 — Exact Update Guide

This update fixes listing pages, improves automatic favicons, uses the uploaded green browser-growth logo, and adds professional spacing between the automatic-approval notice and the success notice.

## What v1.4 changes

- Listing cards now open `site.html` with the exact submitted domain, for example:
  `https://weblaunch-directory.bryanssss-tools.workers.dev/site.html?domain=somniascope.com`
- The listing page uses the same `/api/sites` endpoint that already loads the Discover cards, avoiding the failing separate lookup route.
- Old `/site/...` links remain supported and are converted to the reliable address after loading.
- Favicons are discovered from the submitted website, including PNG, ICO, SVG, WebP and AVIF icons.
- Icons hosted on a website's CDN are supported.
- A public favicon service is used only as the final fallback.
- The uploaded logo is used in the header, footer and browser icon.
- The two notices on the submission page now have a clear gap.
- Asset URLs include v1.4 cache markers so the browser downloads the corrected files.

## Part 1 — Upload the v1.4 update to GitHub

1. Download `weblaunch-directory-v1.4.0-update-only.zip`.
2. Open your Downloads folder.
3. Right-click the ZIP and choose **Extract All**.
4. Open the extracted folder.
5. Open the inner folder named `weblaunch-directory`.
6. Open GitHub and go to `bryanssss/weblaunch-directory`.
7. Confirm the branch selector says **main**.
8. Select **Add file → Upload files**.
9. Select everything inside the extracted `weblaunch-directory` folder.
10. Drag the selected files into GitHub.
11. Wait for GitHub to finish preparing the upload.
12. Use this commit message:

   `Upgrade WebLaunch Directory to v1.4`

13. Select **Commit directly to the main branch**.
14. Press **Commit changes**.

Do not upload the ZIP itself.

## Part 2 — Wait for Cloudflare

1. Open Cloudflare.
2. Go to **Workers & Pages**.
3. Open `weblaunch-directory`.
4. Open **Deployments**.
5. Wait for the newest deployment named **Upgrade WebLaunch Directory to v1.4**.
6. Confirm it says **Success** and receives **100%** traffic.
7. The build should report 31 passing tests.

Do not create another Worker, database or Turnstile widget.

## Part 3 — Test the listing fix

1. Open:
   `https://weblaunch-directory.bryanssss-tools.workers.dev/`
2. Press `Ctrl + F5`.
3. Find **Free Online Dream Interpreter**.
4. Click **View listing**.
5. The browser address should become similar to:
   `https://weblaunch-directory.bryanssss-tools.workers.dev/site.html?domain=somniascope.com`
6. The listing title, description, category and **Visit website** button should now appear.
7. The **Report a problem with this listing** button should remain visible below the listing.

No database changes and no resubmission are required.

## Part 4 — Set up the private contact email with your real details

The public form will not display your Yahoo address. Messages will be sent privately to:

`boyanminchev@yahoo.co.uk`

The sender address will be:

`weblaunch@chipjourney.com`

### A. Onboard chipjourney.com as the sender domain

1. In Cloudflare, use the left menu and open **Compute → Email Service**.
2. Open **Email Sending**.
3. Press **Onboard Domain**.
4. In the domain list, select exactly:

   `chipjourney.com`

5. Do not select the `workers.dev` address. A `workers.dev` address cannot be the email sender domain.
6. Press **Continue**, **Onboard**, or **Done**—the final button name may differ slightly.
7. Allow Cloudflare to add the DNS records automatically.
8. Cloudflare will create records under `cf-bounce.chipjourney.com` for SPF, DKIM, DMARC and bounce handling.
9. Wait 5–15 minutes.
10. Refresh the Email Sending page until `chipjourney.com` says **Ready**, **Active**, or shows all records as configured.

If `chipjourney.com` is not shown in the domain list, stop there. Do not choose another domain and do not change nameservers without first checking the existing website DNS records.

### B. Verify the Yahoo destination address

1. In **Email Service**, open **Email Routing**.
2. Open **Destination Addresses**.
3. Press **Add destination address**.
4. Enter exactly:

   `boyanminchev@yahoo.co.uk`

5. Press **Add** or **Send verification email**.
6. Open Yahoo Mail.
7. Find the Cloudflare verification message.
8. Press **Verify email address** inside the message.
9. Return to Cloudflare and refresh.
10. Confirm the address says **Verified**.

### C. Add the three Worker settings

1. Return to **Workers & Pages**.
2. Open `weblaunch-directory`.
3. Open **Settings**.
4. Open the runtime **Variables and secrets** section—the correct section says the values are used by the Worker at runtime.
5. Add these exact values:

#### CONTACT_TO_EMAIL

- Type: **Secret**
- Name: `CONTACT_TO_EMAIL`
- Value: `boyanminchev@yahoo.co.uk`

#### CONTACT_FROM_EMAIL

- Type: **Plaintext**
- Name: `CONTACT_FROM_EMAIL`
- Value: `weblaunch@chipjourney.com`

#### CONTACT_FROM_NAME

- Type: **Plaintext**
- Name: `CONTACT_FROM_NAME`
- Value: `WebLaunch Directory`

6. Press **Deploy**.
7. Wait about 30 seconds.

### D. Check the email configuration

Open:

`https://weblaunch-directory.bryanssss-tools.workers.dev/api/health`

The contact section should say:

```json
"contact": {
  "ready": true,
  "checks": {
    "emailBinding": true,
    "recipient": true,
    "sender": true
  }
}
```

### E. Send a real test

1. Open:
   `https://weblaunch-directory.bryanssss-tools.workers.dev/contact`
2. Complete the form.
3. Complete Turnstile.
4. Press **Send message**.
5. Open `boyanminchev@yahoo.co.uk` and check Inbox and Spam.

## Part 5 — Check the uploaded logo and website favicons

1. Open the directory homepage.
2. Press `Ctrl + F5`.
3. The green browser-window and rising-arrow logo should appear in the header and footer.
4. The browser tab should use the same uploaded logo.
5. Directory cards will request each submitted website's favicon automatically.
6. The original letter is kept only when the website has no usable public favicon or blocks all icon requests.

## Part 6 — Check the success-message spacing

1. Submit a new eligible website.
2. After publication, the yellow automatic-approval notice and green success notice should have a clear gap between them.
3. The donation window should open after the successful publication message.
