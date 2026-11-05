import { describe, expect, it } from "vitest";
import { detectTier, qualityProfile } from "./quality";

const desktop = { cores: 12, memoryGb: 16, coarsePointer: false, viewportWidth: 1440, saveData: false };

describe("detectTier", () => {
  it("gives capable desktops the high tier", () => {
    expect(detectTier(desktop)).toBe("high");
  });

  it.each([
    ["touch devices", { coarsePointer: true }],
    ["narrow viewports", { viewportWidth: 600 }],
    ["few cores", { cores: 4 }],
    ["low memory", { memoryGb: 4 }],
    ["save-data", { saveData: true }],
  ])("drops to low for %s", (_label, override) => {
    expect(detectTier({ ...desktop, ...override })).toBe("low");
  });

  it("treats unknown hardware signals as capable", () => {
    expect(detectTier({ coarsePointer: false, viewportWidth: 1280, saveData: false })).toBe("high");
  });
});

describe("qualityProfile", () => {
  it("caps fps and density on the low tier only", () => {
    expect(qualityProfile("high").fpsCap).toBeNull();
    expect(qualityProfile("low").fpsCap).toBe(30);
    expect(qualityProfile("low").density).toBeLessThan(qualityProfile("high").density);
  });
});
