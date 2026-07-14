import { TAB_GROUP_COLOR } from "../shared/constants";
import { buildGroupTitle } from "../shared/query";
import { getEnabledPlatforms } from "../shared/settings";
import type { ResearchPlatform, Settings } from "../shared/types";

/** Opens a single platform search, in a new tab or the current one per settings. */
export async function openSingleSearch(
  platform: ResearchPlatform,
  query: string,
  settings: Settings,
): Promise<void> {
  const url = platform.buildSearchUrl(query);
  if (settings.openInNewTab) {
    await chrome.tabs.create({ url, active: true });
  } else {
    await chrome.tabs.update({ url });
  }
}

/**
 * Opens one search tab per enabled platform (in the user's order), groups them
 * when there is more than one, and focuses the first tab. Grouping failures
 * never break the searches themselves — tabs simply stay ungrouped.
 */
export async function searchEverywhere(settings: Settings, query: string): Promise<void> {
  const platforms = getEnabledPlatforms(settings);
  if (platforms.length === 0) return;

  if (platforms.length === 1) {
    const only = platforms[0];
    if (only) await chrome.tabs.create({ url: only.buildSearchUrl(query), active: true });
    return;
  }

  const tabIds: number[] = [];
  for (const platform of platforms) {
    try {
      // Sequential creation keeps tab order aligned with platform order.
      const tab = await chrome.tabs.create({ url: platform.buildSearchUrl(query), active: false });
      if (tab.id !== undefined) tabIds.push(tab.id);
    } catch (error) {
      console.warn(`One Click Research: failed to open ${platform.name} search.`, error);
    }
  }

  const firstTabId = tabIds[0];
  if (firstTabId === undefined) return;

  if (settings.groupTabs && tabIds.length > 1) {
    await groupTabs(tabIds, query);
  }

  try {
    await chrome.tabs.update(firstTabId, { active: true });
  } catch {
    // The tab may have been closed already; nothing to recover.
  }
}

async function groupTabs(tabIds: number[], query: string): Promise<void> {
  try {
    if (!chrome.tabs.group || !chrome.tabGroups) return;
    const groupId = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(groupId, {
      title: buildGroupTitle(query),
      color: TAB_GROUP_COLOR,
    });
  } catch (error) {
    // Grouping is an enhancement, never a requirement.
    console.warn("One Click Research: tab grouping unavailable, opened plain tabs.", error);
  }
}
