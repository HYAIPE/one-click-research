import {
  MENU_ID_OPEN_SETTINGS,
  MENU_ID_PLATFORM_PREFIX,
  MENU_ID_SEARCH_EVERYWHERE,
} from "../shared/constants";
import { getPlatform, isPlatformId } from "../shared/platforms";
import { normalizeQuery } from "../shared/query";
import { loadSettings, onSettingsChanged } from "../shared/settings";
import { rebuildContextMenus } from "./context-menus";
import { openSingleSearch, searchEverywhere } from "./search";

async function initContextMenus(): Promise<void> {
  const settings = await loadSettings();
  await rebuildContextMenus(settings);
}

// Menus persist across service worker restarts, so they only need to be
// (re)built on install/update, browser startup, and settings changes.
chrome.runtime.onInstalled.addListener(() => {
  initContextMenus().catch((error) => {
    console.error("One Click Research: failed to create context menus.", error);
  });
});

chrome.runtime.onStartup.addListener(() => {
  initContextMenus().catch((error) => {
    console.error("One Click Research: failed to rebuild context menus.", error);
  });
});

onSettingsChanged((settings) => {
  rebuildContextMenus(settings).catch((error) => {
    console.error("One Click Research: failed to update context menus.", error);
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  handleMenuClick(info).catch((error) => {
    console.error("One Click Research: search failed.", error);
  });
});

async function handleMenuClick(info: chrome.contextMenus.OnClickData): Promise<void> {
  const { menuItemId } = info;

  if (menuItemId === MENU_ID_OPEN_SETTINGS) {
    await chrome.runtime.openOptionsPage();
    return;
  }

  const query = normalizeQuery(info.selectionText);
  if (!query) return;

  const settings = await loadSettings();

  if (menuItemId === MENU_ID_SEARCH_EVERYWHERE) {
    await searchEverywhere(settings, query);
    return;
  }

  if (typeof menuItemId === "string" && menuItemId.startsWith(MENU_ID_PLATFORM_PREFIX)) {
    const id = menuItemId.slice(MENU_ID_PLATFORM_PREFIX.length);
    if (isPlatformId(id)) {
      await openSingleSearch(getPlatform(id), query, settings);
    }
  }
}
