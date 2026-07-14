<div align="center">

<img src="icon.png" alt="One Click Research icon — a retro computer with a magnifier on screen" width="160" />

**HYAIPE**

# ONE CLICK RESEARCH

**HIGHLIGHT ONCE.<br />SEARCH EVERYWHERE.**

CHROME EXTENSION / OPEN SOURCE / 2026

</div>

---

## Overview

One Click Research is a minimal, fast, privacy-conscious Chrome extension. Highlight text on any webpage, right-click, and launch organized searches across your preferred research services in one action.

No accounts. No analytics. No servers. Nothing leaves your browser except the searches you explicitly launch.

## How it works

1. Highlight text on any webpage.
2. Right-click and choose **One Click Research**.
3. Pick **Search everywhere** — or a single enabled service.

**Search everywhere** opens one tab per enabled service inside a named Chrome tab group:

```
RESEARCH: Bitcoin Ordinals
├── Research service
├── Research service
└── Research service
```

## Features

- **One action, organized searches.** The context menu is the entire interface.
- **Organized results.** Search-everywhere tabs open in a named, colored tab group. If grouping is unavailable, plain tabs open instead — search never fails because grouping does.
- **Your platforms, your order.** Enable, disable, and reorder platforms; the context menu updates to match. Search everywhere only hits enabled platforms.
- **Safe with anything you select.** Unicode, emoji, URLs, symbols, multi-line selections — everything is normalized and URL-encoded correctly.
- **Minimal permissions.** `contextMenus`, `storage`, `tabGroups`. No host permissions, no content scripts, no page access.

## Installation

Until the extension is published to the Chrome Web Store, load it unpacked:

```
git clone https://github.com/HYAIPE/one-click-research.git
cd one-click-research
npm install
npm run build
```

Then in Chrome:

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `dist/` directory.

## Development

```
npm install        # install dev dependencies
npm run dev        # rebuild on change
npm run build      # production build → dist/
npm run test       # unit tests (Vitest)
npm run typecheck  # TypeScript strict mode
npm run lint       # ESLint + Prettier
npm run icons      # regenerate icon PNGs
```

The stack is deliberately small: TypeScript, native DOM APIs, CSS custom properties, and esbuild. No frontend framework, no runtime dependencies.

```
src/
├── background/    service worker, context menus, search + tab grouping
├── popup/         toolbar popup (platform toggles)
├── options/       settings page (platforms, order, tab behavior)
├── shared/        platform config, settings, query normalization, types
├── styles/        HYAIPE design tokens
└── assets/icons/  generated extension icons
```

## Privacy

One Click Research collects nothing. No analytics, no trackers, no accounts, no servers. Selected text is only used to build the search URLs you explicitly request. See [PRIVACY.md](PRIVACY.md).

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, conventions, and how to propose changes. Security reports: [SECURITY.md](SECURITY.md).

## Roadmap

Planned directions — custom search engines, research presets, keyboard shortcuts, Firefox/Edge support — live in [ROADMAP.md](ROADMAP.md).

## License

[MIT](LICENSE)

---

<div align="center">

**BUILT BY HYAIPE**

</div>
