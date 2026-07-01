# Security Policy

## Supported Versions

DriveMind is currently an educational and hackathon MVP.

Security updates are focused on the latest version of the main branch.

---

## Reporting a Vulnerability

If you find a security issue, please do not expose sensitive details publicly.

You can report issues by opening a GitHub issue with limited public details.

Please include:

- A short description of the issue
- Steps to reproduce
- Affected component
- Possible impact
- Suggested fix, if available

---

## Sensitive Data

DriveMind should not expose or commit sensitive credentials.

Do not commit:

- `.env` files
- API keys
- Database passwords
- Private tokens
- Secret keys

Use `backend/.env.example` as a safe template.

---

## Current Security Notes

The current MVP does not yet include:

- Authentication
- Authorization
- Rate limiting
- Production secret management
- HTTPS deployment configuration

These are planned future improvements before production use.