import { describe, expect, it } from "vitest";
import { generateCity, WATERLINE_Z } from "./generate";

describe("generateCity", () => {
  it("is deterministic for a seed", () => {
    expect(generateCity(1234, 1)).toEqual(generateCity(1234, 1));
  });

  it("keeps every building on land", () => {
    for (const b of generateCity(1234, 1).buildings) {
      expect(b.z - b.depth / 2).toBeGreaterThan(WATERLINE_Z);
      expect(b.height).toBeGreaterThan(0);
    }
  });

  it("thins the city on lower density", () => {
    const full = generateCity(1234, 1).buildings.length;
    const sparse = generateCity(1234, 0.55).buildings.length;
    expect(sparse).toBeLessThan(full);
    expect(sparse).toBeGreaterThan(full * 0.35);
  });

  it("has one landmark per district and the downtown tower is the tallest structure", () => {
    const { buildings, landmarks } = generateCity(1234, 1);
    expect(new Set(landmarks.map((l) => l.district)).size).toBe(5);
    const tallest = Math.max(...buildings.map((b) => b.height));
    const skyline = landmarks.find((l) => l.district === "skyline");
    expect(skyline?.height).toBeGreaterThan(tallest);
  });
});
