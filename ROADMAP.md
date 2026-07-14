# Roadmap

One Click Research stays focused: highlight → search everywhere. Future work sharpens that, it doesn't expand past it.

## Shipped in 1.0

- Context menu search: Search everywhere + six individual platforms.
- Named, colored tab groups with graceful fallback.
- Platform enable/disable and reordering (keyboard-accessible).
- Tab behavior controls (grouping, new-tab vs current-tab).
- Local-only preferences via `chrome.storage.sync`.

## Planned / under consideration

- **Keyboard shortcut** — e.g. `Alt+Shift+R` to search the current selection everywhere. Deferred from 1.0: Chrome's `commands` API cannot read the page selection by itself; it would require injecting a script (`scripting` + host or `activeTab` permission) to retrieve the selected text. That trades the extension's no-page-access guarantee for convenience, so it needs careful design before it ships.
- **Custom search engines** — user-defined platforms with a URL template. The platform config already isolates URL construction per platform.
- **Research presets** — one-click platform sets (General / Developer / Crypto / Academic / Shopping). The settings schema (ordered ids + enabled map) was designed so a preset is just a stored `platformOrder` + `enabledPlatforms` pair.
- **Custom tab group names** and open-in-new-window option.
- **Import / export settings** — plain JSON, local only.
- **Local, optional search history** — off by default, never synced, never transmitted.
- **Firefox and Edge support** — Edge should largely work already (Chromium); Firefox needs `browser.*` API mapping and lacks tab groups.
- **Drag-and-drop reordering** — the options page ships with accessible up/down controls; pointer drag can be layered on top without replacing them.

## Out of scope

These will not be added: AI summarization or LLM APIs, user accounts, cloud sync beyond Chrome's own settings sync, analytics or tracking of any kind, advertisements, paid tiers, remote servers, social features, or default-on search history.
