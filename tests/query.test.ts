import { describe, expect, it } from "vitest";
import { MAX_QUERY_LENGTH, TAB_GROUP_TITLE_PREFIX } from "../src/shared/constants";
import { buildGroupTitle, normalizeQuery } from "../src/shared/query";

describe("normalizeQuery", () => {
  it("passes normal text through", () => {
    expect(normalizeQuery("Bitcoin Ordinals")).toBe("Bitcoin Ordinals");
  });

  it("trims leading and trailing whitespace", () => {
    expect(normalizeQuery("  Bitcoin Ordinals  ")).toBe("Bitcoin Ordinals");
  });

  it("collapses line breaks and repeated whitespace into single spaces", () => {
    expect(normalizeQuery("one\ntwo\r\n  three")).toBe("one two three");
  });

  it("preserves special characters and symbols", () => {
    expect(normalizeQuery("C++")).toBe("C++");
    expect(normalizeQuery('"artificial intelligence"')).toBe('"artificial intelligence"');
    expect(normalizeQuery("hello & goodbye")).toBe("hello & goodbye");
  });

  it("preserves unicode and emoji", () => {
    expect(normalizeQuery("日本語")).toBe("日本語");
    expect(normalizeQuery("🚀 crypto")).toBe("🚀 crypto");
  });

  it("preserves URLs", () => {
    expect(normalizeQuery("https://example.com")).toBe("https://example.com");
  });

  it("returns null for empty and whitespace-only input", () => {
    expect(normalizeQuery(undefined)).toBeNull();
    expect(normalizeQuery(null)).toBeNull();
    expect(normalizeQuery("")).toBeNull();
    expect(normalizeQuery("   \n\t  ")).toBeNull();
  });

  it("caps extremely long selections without splitting surrogate pairs", () => {
    const long = "🚀".repeat(MAX_QUERY_LENGTH + 50);
    const result = normalizeQuery(long);
    expect(result).not.toBeNull();
    expect([...(result as string)]).toHaveLength(MAX_QUERY_LENGTH);
    expect(result).toBe("🚀".repeat(MAX_QUERY_LENGTH));
  });
});

describe("buildGroupTitle", () => {
  it("uses the full query when short", () => {
    expect(buildGroupTitle("Bitcoin Ordinals")).toBe("RESEARCH: Bitcoin Ordinals");
  });

  it("truncates long queries at a word boundary with an ellipsis", () => {
    const title = buildGroupTitle("Bitcoin Ordinals and the future of digital artifacts");
    expect(title).toBe("RESEARCH: Bitcoin Ordinals and...");
  });

  it("truncates unbroken long strings without a word boundary", () => {
    const title = buildGroupTitle("a".repeat(100));
    expect(title.startsWith(TAB_GROUP_TITLE_PREFIX)).toBe(true);
    expect(title.endsWith("...")).toBe(true);
    expect(title.length).toBeLessThan(TAB_GROUP_TITLE_PREFIX.length + 30);
  });

  it("never splits emoji when truncating", () => {
    const title = buildGroupTitle("🚀".repeat(60));
    expect(title).not.toContain("�");
    expect(title.endsWith("...")).toBe(true);
  });
});
