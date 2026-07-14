# Security Policy

## Supported versions

Only the latest release of One Click Research is supported with security fixes.

## Reporting a vulnerability

Please report vulnerabilities privately via GitHub Security Advisories:

https://github.com/HYAIPE/one-click-research/security/advisories/new

Do not open a public issue for security problems. You can expect an acknowledgment within a few days.

## Scope notes

The extension's security posture is deliberately narrow:

- No host permissions, no content scripts, no page access.
- Selected text is treated as untrusted input and only ever URL-encoded into search URLs via `URLSearchParams`.
- No `eval`, no remote code, no runtime dependencies, no external requests of any kind.
- UI is built with `textContent`/`createElement` — no HTML injection surface.

Reports about the search platforms themselves (Google, Reddit, X, GitHub, YouTube, Wikipedia) are out of scope — report those to the respective platform.
