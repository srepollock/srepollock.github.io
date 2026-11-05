import { describe, expect, it } from "vitest";
import { CITY_BOUNDS, WATERLINE_Z, generateCity } from "./generate";
import { streetLightPositions } from "./streetLights";

describe("streetLightPositions", () => {
  const positions = streetLightPositions();
  const count = positions.length / 3;

  it("places a few thousand lamps inside the city, on land", () => {
    expect(count).toBeGreaterThan(1000);
    expect(count).toBeLessThan(5000);
    for (let i = 0; i < count; i++) {
      const x = positions[i * 3] ?? NaN;
      const z = positions[i * 3 + 2] ?? NaN;
      expect(x).toBeGreaterThanOrEqual(CITY_BOUNDS.minX - 3);
      expect(x).toBeLessThanOrEqual(CITY_BOUNDS.maxX + 3);
      expect(z).toBeGreaterThan(WATERLINE_Z);
    }
  });

  it("never puts a lamp inside a building", () => {
    const { buildings } = generateCity(604, 1);
    for (let i = 0; i < count; i++) {
      const x = positions[i * 3] ?? NaN;
      const z = positions[i * 3 + 2] ?? NaN;
      const inside = buildings.some((b) => Math.abs(x - b.x) < b.width / 2 && Math.abs(z - b.z) < b.depth / 2);
      expect(inside).toBe(false);
    }
  });
});
