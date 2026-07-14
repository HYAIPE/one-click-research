import type { PlatformId, ResearchPlatform } from "./types";

/** Builds a search URL with the query set through URLSearchParams (never string concatenation). */
function searchUrl(base: string, param: string, query: string): string {
  const url = new URL(base);
  url.searchParams.set(param, query);
  return url.toString();
}

/** The one source of truth for supported research platforms, in default order. */
export const PLATFORMS: readonly ResearchPlatform[] = [
  {
    id: "google",
    name: "Google",
    enabledByDefault: true,
    buildSearchUrl: (query) => searchUrl("https://www.google.com/search", "q", query),
  },
  {
    id: "reddit",
    name: "Reddit",
    enabledByDefault: true,
    buildSearchUrl: (query) => searchUrl("https://www.reddit.com/search/", "q", query),
  },
  {
    id: "x",
    name: "X",
    enabledByDefault: true,
    buildSearchUrl: (query) => searchUrl("https://x.com/search", "q", query),
  },
  {
    id: "github",
    name: "GitHub",
    enabledByDefault: true,
    buildSearchUrl: (query) => searchUrl("https://github.com/search", "q", query),
  },
  {
    id: "youtube",
    name: "YouTube",
    enabledByDefault: true,
    buildSearchUrl: (query) => searchUrl("https://www.youtube.com/results", "search_query", query),
  },
  {
    id: "wikipedia",
    name: "Wikipedia",
    enabledByDefault: true,
    buildSearchUrl: (query) => searchUrl("https://en.wikipedia.org/w/index.php", "search", query),
  },
];

const PLATFORM_MAP = new Map<PlatformId, ResearchPlatform>(PLATFORMS.map((p) => [p.id, p]));

export const PLATFORM_IDS: readonly PlatformId[] = PLATFORMS.map((p) => p.id);

export function isPlatformId(value: string): value is PlatformId {
  return PLATFORM_MAP.has(value as PlatformId);
}

export function getPlatform(id: PlatformId): ResearchPlatform {
  const platform = PLATFORM_MAP.get(id);
  if (!platform) throw new Error(`Unknown platform: ${id}`);
  return platform;
}
