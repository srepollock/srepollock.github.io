import { describe, expect, it } from "vitest";
import { advanceKonami, KONAMI } from "@/lib/konami";
import { clampPitch, constrain, FLY_LIMITS, heightField, keyFor, moveVector, noKeys } from "./flyControls";
import { generateCity } from "./generate";

describe("keyFor", () => {
  it.each([
    ["w", "forward"],
    ["ArrowUp", "forward"],
    ["A", "left"],
    ["ArrowRight", "right"],
    [" ", "up"],
    ["q", "down"],
    ["Shift", "boost"],
    ["x", null],
  ])("%j → %s", (key, expected) => {
    expect(keyFor(key)).toBe(expected);
  });
});

describe("moveVector", () => {
  it("stands still with no keys", () => {
    expect(moveVector(noKeys, 0, 1).map((v) => Math.abs(v))).toEqual([0, 0, 0]);
  });

  it("moves forward along -z at yaw 0 and +x when strafing right", () => {
    const [x, , z] = moveVector({ ...noKeys, forward: true }, 0, 1);
    expect(z).toBeLessThan(0);
    expect(Math.abs(x)).toBeLessThan(1e-9);
    expect(moveVector({ ...noKeys, right: true }, 0, 1)[0]).toBeGreaterThan(0);
  });

  it("does not move faster diagonally", () => {
    const straight = Math.hypot(...moveVector({ ...noKeys, forward: true }, 0.4, 1));
    const diagonal = Math.hypot(...moveVector({ ...noKeys, forward: true, left: true }, 0.4, 1));
    expect(diagonal).toBeCloseTo(straight);
  });

  it("boost is faster", () => {
    const normal = Math.hypot(...moveVector({ ...noKeys, forward: true }, 0, 1));
    const boosted = Math.hypot(...moveVector({ ...noKeys, forward: true, boost: true }, 0, 1));
    expect(boosted).toBeGreaterThan(normal);
  });
});

describe("constrain", () => {
  const { buildings } = generateCity(604, 1);
  const heightAt = heightField(buildings);

  it("keeps the camera above every rooftop", () => {
    const tallest = buildings.reduce((a, b) => (b.height > a.height ? b : a));
    const [, y] = constrain([tallest.x, 1, tallest.z], heightAt);
    expect(y).toBeGreaterThanOrEqual(tallest.height + FLY_LIMITS.clearance);
  });

  it("clamps to the world bounds and ceiling", () => {
    const [x, y, z] = constrain([10_000, 10_000, -10_000], heightAt);
    expect(x).toBe(FLY_LIMITS.maxX);
    expect(y).toBe(FLY_LIMITS.maxY);
    expect(z).toBe(FLY_LIMITS.minZ);
  });

  it("allows low flight over streets and water", () => {
    const [, y] = constrain([0, 1, -150], heightAt);
    expect(y).toBe(FLY_LIMITS.clearance);
  });
});

describe("clampPitch", () => {
  it("prevents flipping over", () => {
    expect(clampPitch(5)).toBeLessThan(Math.PI / 2);
    expect(clampPitch(-5)).toBeGreaterThan(-Math.PI / 2);
  });
});

describe("advanceKonami", () => {
  it("completes on the full sequence", () => {
    let progress = 0;
    let complete = false;
    for (const key of KONAMI) ({ progress, complete } = advanceKonami(progress, key));
    expect(complete).toBe(true);
    expect(progress).toBe(0);
  });

  it("resets on a wrong key but restarts on ArrowUp", () => {
    expect(advanceKonami(3, "x")).toEqual({ progress: 0, complete: false });
    expect(advanceKonami(2, "ArrowUp")).toEqual({ progress: 1, complete: false });
  });

  it("accepts uppercase B and A", () => {
    expect(advanceKonami(8, "B")).toEqual({ progress: 9, complete: false });
  });
});
