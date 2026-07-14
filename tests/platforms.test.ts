import { describe, expect, it } from "vitest";
import { PLATFORMS, PLATFORM_IDS, getPlatform, isPlatformId } from "../src/shared/platforms";

const SAMPLE_QUERIES = [
  "Bitcoin Ordinals",
  "C++",
  '"artificial intelligence"',
  "日本語",
  "🚀 crypto",
  "https://example.com",
  "hello & goodbye",
];

describe("platform configuration", () => {
  it("defines exactly the six MVP platforms in default order", () => {
    expect(PLATFORM_IDS).toEqual(["google", "reddit", "x", "github", "youtube", "wikipedia"]);
  });

  it("enables every platform by default", () => {
    expect(PLATFORMS.every((p) => p.enabledByDefault)).toBe(true);
  });

  it("has unique ids and non-empty names", () => {
    expect(new Set(PLATFORM_IDS).size).toBe(PLATFORMS.length);
    expect(PLATFORMS.every((p) => p.name.length > 0)).toBe(true);
  });

  it("recognizes valid and invalid platform ids", () => {
    expect(isPlatformId("google")).toBe(true);
    expect(isPlatformId("wikipedia")).toBe(true);
    expect(isPlatformId("bing")).toBe(false);
    expect(isPlatformId("")).toBe(false);
  });

  it("throws for unknown platform lookups", () => {
    expect(() => getPlatform("bing" as never)).toThrow();
  });
});

describe("search URL generation", () => {
  it("builds valid, correctly encoded URLs for every platform and query", () => {
    for (const platform of PLATFORMS) {
      for (const query of SAMPLE_QUERIES) {
        const url = new URL(platform.buildSearchUrl(query));
        expect(url.protocol).toBe("https:");
        // Round-trip: the platform must receive exactly the original query.
        const params = url.searchParams;
        const value = params.get("q") ?? params.get("search_query") ?? params.get("search");
        expect(value).toBe(query);
      }
    }
  });

  it("targets the expected hosts", () => {
    const hosts = PLATFORMS.map((p) => new URL(p.buildSearchUrl("test")).hostname);
    expect(hosts).toEqual([
      "www.google.com",
      "www.reddit.com",
      "x.com",
      "github.com",
      "www.youtube.com",
      "en.wikipedia.org",
    ]);
  });

  it("never leaks raw special characters into the query string", () => {
    const google = PLATFORMS[0];
    const url = google?.buildSearchUrl("hello & goodbye") ?? "";
    const [, queryString] = url.split("?");
    expect(queryString).toBe("q=hello+%26+goodbye");
  });
});
