import { describe, expect, it } from "vitest";
import {
  defaultSettings,
  getEnabledPlatforms,
  getOrderedPlatforms,
  sanitizeSettings,
} from "../src/shared/settings";

describe("defaultSettings", () => {
  it("enables all six platforms, grouping, and new-tab behavior", () => {
    const settings = defaultSettings();
    expect(settings.platformOrder).toEqual([
      "google",
      "reddit",
      "x",
      "github",
      "youtube",
      "wikipedia",
    ]);
    expect(Object.values(settings.enabledPlatforms).every(Boolean)).toBe(true);
    expect(settings.groupTabs).toBe(true);
    expect(settings.openInNewTab).toBe(true);
  });

  it("returns independent copies", () => {
    const a = defaultSettings();
    a.enabledPlatforms.google = false;
    expect(defaultSettings().enabledPlatforms.google).toBe(true);
  });
});

describe("sanitizeSettings", () => {
  it("returns defaults for garbage input", () => {
    for (const garbage of [undefined, null, 42, "corrupt", [], true]) {
      expect(sanitizeSettings(garbage)).toEqual(defaultSettings());
    }
  });

  it("preserves a valid stored order and enabled map", () => {
    const stored = {
      platformOrder: ["github", "google", "reddit", "x", "youtube", "wikipedia"],
      enabledPlatforms: {
        google: true,
        reddit: false,
        x: true,
        github: true,
        youtube: false,
        wikipedia: true,
      },
      groupTabs: false,
      openInNewTab: false,
    };
    expect(sanitizeSettings(stored)).toEqual(stored);
  });

  it("drops unknown platform ids and appends missing ones", () => {
    const result = sanitizeSettings({
      platformOrder: ["bing", "wikipedia", "wikipedia", "google"],
    });
    expect(result.platformOrder).toEqual([
      "wikipedia",
      "google",
      "reddit",
      "x",
      "github",
      "youtube",
    ]);
  });

  it("ignores malformed enabled values and booleans", () => {
    const result = sanitizeSettings({
      enabledPlatforms: { google: "yes", reddit: false, bing: true },
      groupTabs: "nope",
      openInNewTab: 1,
    });
    expect(result.enabledPlatforms.google).toBe(true);
    expect(result.enabledPlatforms.reddit).toBe(false);
    expect(result.groupTabs).toBe(true);
    expect(result.openInNewTab).toBe(true);
    expect("bing" in result.enabledPlatforms).toBe(false);
  });
});

describe("platform selection", () => {
  it("returns zero platforms when everything is disabled", () => {
    const settings = defaultSettings();
    for (const id of settings.platformOrder) settings.enabledPlatforms[id] = false;
    expect(getEnabledPlatforms(settings)).toHaveLength(0);
  });

  it("returns a single enabled platform", () => {
    const settings = defaultSettings();
    for (const id of settings.platformOrder) settings.enabledPlatforms[id] = false;
    settings.enabledPlatforms.reddit = true;
    const enabled = getEnabledPlatforms(settings);
    expect(enabled.map((p) => p.id)).toEqual(["reddit"]);
  });

  it("respects the user's custom order for enabled platforms", () => {
    const settings = defaultSettings();
    settings.platformOrder = ["wikipedia", "github", "google", "reddit", "x", "youtube"];
    settings.enabledPlatforms.reddit = false;
    expect(getEnabledPlatforms(settings).map((p) => p.id)).toEqual([
      "wikipedia",
      "github",
      "google",
      "x",
      "youtube",
    ]);
    expect(getOrderedPlatforms(settings)).toHaveLength(6);
  });
});
