import { describe, expect, it } from "vitest";
import { generateCity } from "./generate";
import { massBuilding, massCity } from "./massing";
import { mulberry32 } from "@/lib/random";

const { buildings } = generateCity(604, 1);

describe("massBuilding", () => {
  it("stacks parts from the ground to exactly the building height", () => {
    const rng = mulberry32(1);
    for (const building of buildings) {
      const { parts } = massBuilding(building, rng);
      expect(parts.length).toBeGreaterThan(0);
      expect(parts[0]?.y0).toBe(0);
      for (let i = 1; i < parts.length; i++) {
        const below = parts[i - 1];
        const part = parts[i];
        if (!below || !part) throw new Error("missing part");
        expect(part.y0).toBeCloseTo(below.y0 + below.height);
      }
      const top = parts[parts.length - 1];
      expect((top?.y0 ?? 0) + (top?.height ?? 0)).toBeCloseTo(building.height);
    }
  });

  it("never grows outside the lot and only steps inward", () => {
    const rng = mulberry32(2);
    for (const building of buildings) {
      const { parts } = massBuilding(building, rng);
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part) continue;
        expect(Math.abs(part.x - building.x) + part.width / 2).toBeLessThanOrEqual(building.width / 2 + 1e-9);
        expect(Math.abs(part.z - building.z) + part.depth / 2).toBeLessThanOrEqual(building.depth / 2 + 1e-9);
        const below = parts[i - 1];
        if (below) {
          expect(part.width).toBeLessThanOrEqual(below.width + 1e-9);
          expect(part.depth).toBeLessThanOrEqual(below.depth + 1e-9);
        }
        expect(part.height).toBeGreaterThan(0);
      }
    }
  });

  it("gives tall towers setbacks and aviation lights, and keeps rooftop units on the roof", () => {
    const rng = mulberry32(3);
    const tall = buildings.filter((b) => b.height > 40);
    expect(tall.length).toBeGreaterThan(0);
    for (const building of tall) {
      const { parts, aviationLights, roofUnits } = massBuilding(building, rng);
      expect(parts.length).toBeGreaterThanOrEqual(3);
      expect(aviationLights.length).toBe(2);
      for (const unit of roofUnits) expect(unit.y).toBeCloseTo(building.height);
    }
  });
});

describe("massCity", () => {
  it("is deterministic and has a mix of facade styles", () => {
    const a = massCity(buildings, 9);
    expect(a).toEqual(massCity(buildings, 9));
    expect(new Set(a.parts.map((p) => p.style)).size).toBe(4);
  });
});

describe("neon trims", () => {
  it("sit just below the top of a neon building's highest part", () => {
    const rng = mulberry32(4);
    for (const building of buildings.filter((b) => b.neon)) {
      const { neonTrims, parts } = massBuilding(building, rng);
      const top = parts[parts.length - 1];
      expect(neonTrims).toHaveLength(1);
      expect(neonTrims[0]?.y).toBeCloseTo(building.height - 0.9);
      expect(neonTrims[0]?.width).toBeCloseTo((top?.width ?? 0) + 0.12);
    }
  });
});
