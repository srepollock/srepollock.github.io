import { describe, expect, it } from "vitest";
import { adaptQuality, initialAdaptive, levelEffects, MAX_LEVEL } from "./adaptive";

function run(fps: number[], target = 60, start = initialAdaptive()) {
  return fps.reduce((state, value, i) => adaptQuality(state, value, target, i), start);
}

describe("adaptQuality", () => {
  it("holds steady at target", () => {
    expect(run([60, 59, 60, 60]).level).toBe(MAX_LEVEL);
  });

  it("needs two slow windows in a row to step down", () => {
    expect(run([40]).level).toBe(MAX_LEVEL);
    expect(run([40, 60, 40]).level).toBe(MAX_LEVEL);
    expect(run([40, 40]).level).toBe(MAX_LEVEL - 1);
  });

  it("waits out a lock before stepping down again", () => {
    const after = run([40, 40, 40, 40]);
    expect(after.level).toBe(MAX_LEVEL - 1);
    expect(run([40, 40, 40, 40, 40, 40]).level).toBe(MAX_LEVEL - 2);
  });

  it("bottoms out at level 0", () => {
    expect(run(Array.from({ length: 40 }, () => 10)).level).toBe(0);
  });

  it("climbs back slowly after sustained headroom", () => {
    const low = initialAdaptive(1);
    expect(run([60, 60, 60, 60, 60], 60, low).level).toBe(1);
    expect(run([60, 60, 60, 60, 60, 60], 60, low).level).toBe(2);
  });

  it("respects a lower target for capped devices", () => {
    expect(run([29, 30, 28, 30], 30).level).toBe(MAX_LEVEL);
  });
});

describe("levelEffects", () => {
  it("sheds bloom first, then resolution, then pedestrians and cars", () => {
    expect(levelEffects(3)).toEqual({ bloom: true, dprScale: 1, pedestrians: true, carFraction: 1 });
    expect(levelEffects(2).bloom).toBe(false);
    expect(levelEffects(1).dprScale).toBeLessThan(1);
    expect(levelEffects(0)).toMatchObject({ pedestrians: false, carFraction: 0.5 });
  });
});
