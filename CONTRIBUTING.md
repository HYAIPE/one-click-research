# Contributing

Thanks for your interest in One Click Research. The project is intentionally small — the best contributions keep it that way.

## Ground rules

- **Stay in scope.** One Click Research does one thing: highlight → search across platforms. Features on the [out-of-scope list](ROADMAP.md#out-of-scope) (AI, accounts, analytics, cloud sync, ads) will not be accepted.
- **Minimal permissions.** Changes that add permissions, host access, or content scripts need a very strong justification.
- **No runtime dependencies.** The extension ships zero npm packages. Keep it that way.

## Setup

```
git clone https://github.com/HYAIPE/one-click-research.git
cd one-click-research
npm install
npm run dev
```

Load `dist/` via `chrome://extensions` → Developer mode → Load unpacked. After changing HTML/CSS/manifest, re-run the build (watch mode only rebundles TypeScript).

## Before opening a pull request

All four must pass:

```
npm run typecheck
npm run lint
npm run test
npm run build
```

- Add or update tests for behavior changes (query handling, URL generation, settings).
- Keep functions small; put shared logic in `src/shared/`.
- Platform definitions live in one place: `src/shared/platforms.ts`.
- Use design tokens from `src/styles/tokens.css` — no raw hex values in component CSS.
- Format with `npm run format`.

## Reporting bugs

Use the issue templates. Include Chrome version, steps to reproduce, and what you selected/searched when relevant.

## Security issues

Do not open public issues for vulnerabilities — see [SECURITY.md](SECURITY.md).
