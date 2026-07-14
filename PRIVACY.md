# Privacy

One Click Research is built to collect nothing.

## What the extension does NOT do

- It does not collect user data.
- It does not store search queries or selected text.
- It does not track browsing history.
- It does not use analytics or advertising trackers.
- It does not sell or share data — there is no data to sell or share.
- It does not create user profiles or require accounts.
- It does not communicate with HYAIPE servers. There are no HYAIPE servers.

## What the extension stores

Only your preferences, via Chrome's `storage.sync` API:

- Which platforms are enabled.
- Your platform order.
- Tab behavior settings (grouping, new-tab).

Chrome may sync these preferences across your own signed-in Chrome profiles. That is Chrome's built-in settings sync, handled entirely by Chrome — the extension never sees or touches the transport.

## What happens when you search

Selected text is used for exactly one purpose: building the search URL(s) for the action you explicitly chose. When a search tab opens, your query is sent to that third-party platform (Google, Reddit, X, GitHub, YouTube, or Wikipedia) the same way it would be if you typed it into their search box yourself. From that point, the platform's own privacy policy applies. The extension transmits nothing anywhere else.

If you do not trigger a search, the extension does nothing with your selection. Chrome only hands the selected text to the extension at the moment you click a One Click Research menu item.

## Permissions

| Permission     | Why                                                        |
| -------------- | ---------------------------------------------------------- |
| `contextMenus` | Show the One Click Research menu when text is selected.    |
| `storage`      | Persist your platform and tab preferences.                 |
| `tabGroups`    | Name and color the tab group created by Search everywhere. |

The extension requests no host permissions and injects no content scripts. It cannot read the pages you visit.

## Questions

Open an issue at https://github.com/HYAIPE/one-click-research/issues.
