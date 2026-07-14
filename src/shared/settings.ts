import { SETTINGS_STORAGE_KEY } from "./constants";
import { PLATFORMS, isPlatformId } from "./platforms";
import type { PlatformId, ResearchPlatform, Settings } from "./types";

export function defaultSettings(): Settings {
  return {
    platformOrder: PLATFORMS.map((p) => p.id),
    enabledPlatforms: Object.fromEntries(
      PLATFORMS.map((p) => [p.id, p.enabledByDefault]),
    ) as Record<PlatformId, boolean>,
    groupTabs: true,
    openInNewTab: true,
  };
}

/**
 * Validates unknown stored data into a safe Settings object. Unknown platform
 * ids are dropped, missing ids are appended in default order, and malformed
 * values fall back to defaults. Corrupted storage can never break the extension.
 */
export function sanitizeSettings(value: unknown): Settings {
  const defaults = defaultSettings();
  if (typeof value !== "object" || value === null) return defaults;
  const record = value as Record<string, unknown>;

  const order: PlatformId[] = [];
  if (Array.isArray(record.platformOrder)) {
    for (const id of record.platformOrder) {
      if (typeof id === "string" && isPlatformId(id) && !order.includes(id)) {
        order.push(id);
      }
    }
  }
  for (const id of defaults.platformOrder) {
    if (!order.includes(id)) order.push(id);
  }

  const enabled = defaults.enabledPlatforms;
  const storedEnabled = record.enabledPlatforms;
  if (typeof storedEnabled === "object" && storedEnabled !== null) {
    for (const id of defaults.platformOrder) {
      const stored = (storedEnabled as Record<string, unknown>)[id];
      if (typeof stored === "boolean") enabled[id] = stored;
    }
  }

  return {
    platformOrder: order,
    enabledPlatforms: enabled,
    groupTabs: typeof record.groupTabs === "boolean" ? record.groupTabs : defaults.groupTabs,
    openInNewTab:
      typeof record.openInNewTab === "boolean" ? record.openInNewTab : defaults.openInNewTab,
  };
}

export async function loadSettings(): Promise<Settings> {
  try {
    const stored = await chrome.storage.sync.get(SETTINGS_STORAGE_KEY);
    return sanitizeSettings(stored[SETTINGS_STORAGE_KEY]);
  } catch (error) {
    console.warn("One Click Research: failed to read settings, using defaults.", error);
    return defaultSettings();
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.sync.set({ [SETTINGS_STORAGE_KEY]: settings });
}

export function onSettingsChanged(callback: (settings: Settings) => void): void {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    const change = changes[SETTINGS_STORAGE_KEY];
    if (change) callback(sanitizeSettings(change.newValue));
  });
}

/** All platforms in the user's preferred order. */
export function getOrderedPlatforms(settings: Settings): ResearchPlatform[] {
  return settings.platformOrder
    .map((id) => PLATFORMS.find((p) => p.id === id))
    .filter((p): p is ResearchPlatform => p !== undefined);
}

/** Enabled platforms in the user's preferred order. */
export function getEnabledPlatforms(settings: Settings): ResearchPlatform[] {
  return getOrderedPlatforms(settings).filter((p) => settings.enabledPlatforms[p.id]);
}
