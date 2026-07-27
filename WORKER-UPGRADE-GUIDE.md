# Cloudflare Worker Upgrade Notes — v1.2

Version 1.2 keeps the same Cloudflare Worker, D1 database and runtime secrets introduced in v1.1.

## Main changes

- New submissions that pass automated checks are inserted as `approved`.
- Homepage HTML is temporarily inspected for high-confidence prohibited-content signals.
- Pornography and explicit-adult services are explicitly prohibited.
- Category cards use clean URLs such as `/category/travel`.
- Custom dark dropdowns replace the unstyled mobile native category list.
- Mobile form spacing and select arrows have been corrected.
- PayPal donation buttons were added without creating paid placement.
- Privacy, terms, rules and about copy now explain automatic publication.

## Deployment settings

```text
Build command: npm run check
Deploy command: npx wrangler deploy
Root directory: /
```

No new Worker secret or D1 binding is required.
