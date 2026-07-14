import {
  MENU_ID_OPEN_SETTINGS,
  MENU_ID_PLATFORM_PREFIX,
  MENU_ID_ROOT,
  MENU_ID_SEARCH_EVERYWHERE,
  MENU_ID_SEPARATOR,
} from "../shared/constants";
import { getEnabledPlatforms } from "../shared/settings";
import type { Settings } from "../shared/types";

/**
 * chrome.contextMenus.create still reports errors through
 * chrome.runtime.lastError inside its callback, so promisify manually.
 */
function createMenu(properties: chrome.contextMenus.CreateProperties): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.contextMenus.create(properties, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

function removeAllMenus(): Promise<void> {
  return new Promise((resolve) => {
    chrome.contextMenus.removeAll(() => {
      // Ignore lastError: nothing to remove is not a failure.
      void chrome.runtime.lastError;
      resolve();
    });
  });
}

/**
 * Idempotently rebuilds the full context menu tree from the current settings.
 * removeAll-then-create avoids duplicate-id errors when onInstalled fires
 * again after an extension update or when settings change.
 */
export async function rebuildContextMenus(settings: Settings): Promise<void> {
  await removeAllMenus();

  const enabled = getEnabledPlatforms(settings);

  await createMenu({
    id: MENU_ID_ROOT,
    title: "One Click Research",
    contexts: ["selection"],
  });

  if (enabled.length === 0) {
    await createMenu({
      id: MENU_ID_OPEN_SETTINGS,
      parentId: MENU_ID_ROOT,
      title: "No platforms enabled — open settings",
      contexts: ["selection"],
    });
    return;
  }

  if (enabled.length > 1) {
    await createMenu({
      id: MENU_ID_SEARCH_EVERYWHERE,
      parentId: MENU_ID_ROOT,
      title: "Search everywhere",
      contexts: ["selection"],
    });
    await createMenu({
      id: MENU_ID_SEPARATOR,
      parentId: MENU_ID_ROOT,
      type: "separator",
      contexts: ["selection"],
    });
  }

  for (const platform of enabled) {
    await createMenu({
      id: MENU_ID_PLATFORM_PREFIX + platform.id,
      parentId: MENU_ID_ROOT,
      title: platform.name,
      contexts: ["selection"],
    });
  }
}
