# Security Policy

Security is the purpose of this project, so vulnerability reports are treated seriously.

## Supported versions

Until the first stable release, security fixes are applied only to the latest code on the `main` branch and the latest published package version.

| Version | Supported |
| --- | --- |
| Latest release | Yes |
| `main` | Yes |
| Older releases | No |

## Reporting a vulnerability

Do **not** report vulnerabilities in public issues, pull requests, discussions, Discord channels, or social media.

Use GitHub's private vulnerability reporting flow:

1. Open the repository's **Security** tab.
2. Select **Report a vulnerability**.
3. Include affected versions, impact, reproduction steps, proof-of-concept details, and any suggested mitigation.

Direct report link: <https://github.com/GhostPunishR/Anti-Raid/security/advisories/new>

Please avoid accessing data that is not yours, disrupting Discord servers, or testing against systems without authorization.

## What to expect

Maintainers will make a best effort to:

- acknowledge the report within 7 days;
- assess severity and reproducibility;
- keep the reporter informed when meaningful progress is made;
- coordinate a fix and disclosure timeline when appropriate;
- credit the reporter unless anonymity is requested.

These are targets rather than guaranteed service-level commitments.

## Scope

Reports are especially useful when they concern:

- bypasses of raid detection or ignore-list controls;
- unsafe or unbounded moderation actions;
- Discord permission or role-hierarchy mistakes;
- secret, token, or sensitive-data exposure;
- denial-of-service conditions caused by crafted events;
- dependency vulnerabilities with a practical impact on this package.

General feature requests and ordinary bugs belong in the public issue tracker.
