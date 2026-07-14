/** Identifiers for the six supported research platforms. */
export type PlatformId = "google" | "reddit" | "x" | "github" | "youtube" | "wikipedia";

/** A single research platform definition — the one source of truth per platform. */
export interface ResearchPlatform {
  id: PlatformId;
  name: string;
  enabledByDefault: boolean;
  buildSearchUrl: (query: string) => string;
}

/** User preferences persisted via chrome.storage.sync. */
export interface Settings {
  /** Every platform id, in the user's preferred search order. */
  platformOrder: PlatformId[];
  /** Enabled state per platform. */
  enabledPlatforms: Record<PlatformId, boolean>;
  /** Group "Search everywhere" tabs into a Chrome tab group. */
  groupTabs: boolean;
  /** Open individual platform searches in a new tab (vs. the current tab). */
  openInNewTab: boolean;
}
