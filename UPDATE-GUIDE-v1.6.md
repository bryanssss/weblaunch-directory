# WebLaunch Directory v1.6 Update

## Improvements

- Replaces category letters with relevant line icons, including a plane for Travel.
- An exact category search such as `travel` opens the Travel category instead of showing `Search: “travel” (0)`.
- Text searches now search the entire directory, even when the visitor previously opened a category.
- Multi-word searches can match words across the website name, description, domain, category and URL.
- Searches such as `somniascope`, `dream interpreter`, and `dream interpreter somniascope` can find the SomniaScope listing.
- Improved result headings and empty-state messages.

## Installation

1. Extract the update ZIP.
2. Open the inner `weblaunch-directory` folder.
3. Upload everything inside it to the root of your GitHub repository.
4. Commit directly to `main` with the message `Improve category icons and directory search`.
5. Wait for the Cloudflare deployment to show Success and 100% traffic.
6. Open the Categories page and press `Ctrl + F5`.

No database migration, new binding or new Cloudflare variable is required.
