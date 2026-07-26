# Security Policy

## Reporting a Vulnerability

Do not publish exploitable security details in a public issue. Contact the repository owner privately through the security contact configured on the GitHub profile or repository.

Include:

- A clear description of the problem
- The affected route or file
- Safe reproduction steps
- The likely impact
- A suggested fix when possible

## Secrets

Never commit `ADMIN_KEY`, `IP_HASH_SALT` or `TURNSTILE_SECRET_KEY`. Rotate a secret immediately if it is accidentally exposed.

## Supported Version

Security fixes target the current `main` branch.
