export const MENU_ID_ROOT = "ocr-root";
export const MENU_ID_SEARCH_EVERYWHERE = "ocr-search-everywhere";
export const MENU_ID_SEPARATOR = "ocr-separator";
export const MENU_ID_OPEN_SETTINGS = "ocr-open-settings";
export const MENU_ID_PLATFORM_PREFIX = "ocr-platform-";

export const SETTINGS_STORAGE_KEY = "settings";

/**
 * Queries longer than this are truncated before searching. Every supported
 * platform caps queries well below this, so no meaningful query is destroyed.
 */
export const MAX_QUERY_LENGTH = 1000;

export const TAB_GROUP_TITLE_PREFIX = "RESEARCH: ";
/** Max query characters shown in a tab group title before truncation. */
export const TAB_GROUP_TITLE_QUERY_LENGTH = 24;
/** chrome.tabGroups only supports a fixed set of named colors. */
export const TAB_GROUP_COLOR: chrome.tabGroups.ColorEnum = "blue";

export const GITHUB_URL = "https://github.com/HYAIPE/one-click-research";
