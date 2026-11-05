import { describe, expect, it } from "vitest";
import { SIDEWALK_OFFSET, buildStreetGrid } from "./grid";
import { AXIS_EW, AXIS_NS, LIGHT_RED } from "./signals";
import { createTrafficSim } from "./traffic";
import { WALK_SPEED, createPedestrianSim } from "./pedestrians";

const grid = buildStreetGrid();

function nearest(lines: readonly number[], value: number): number {
  let best = 0;
  for (let i = 1; i < lines.length; i++) {
    if (Math.abs((lines[i] ?? 0) - value) < Math.abs((lines[best] ?? 0) - value)) best = i;
  }
  return best;
}

describe("createPedestrianSim", () => {
  it("keeps pedestrians on sidewalks and crosses only while the crossed street is red", () => {
    const traffic = createTrafficSim({ seed: 1, cars: 100, grid });
    const peds = createPedestrianSim({ seed: 2, count: 400, grid, signals: traffic.signals });
    let crossingSamples = 0;
    let waitingSamples = 0;
    for (let step = 0; step < 6000; step++) {
      traffic.step(0.1);
      peds.step(0.1);
      for (let i = 0; i < peds.count; i++) {
        const px = peds.x[i] ?? 0;
        const pz = peds.z[i] ?? 0;
        const ix = nearest(grid.xs, px);
        const iz = nearest(grid.zs, pz);
        const dx = Math.abs(px - (grid.xs[ix] ?? 0));
        const dz = Math.abs(pz - (grid.zs[iz] ?? 0));
        const onX = Math.abs(dx - SIDEWALK_OFFSET) < 1e-3;
        const onZ = Math.abs(dz - SIDEWALK_OFFSET) < 1e-3;
        if (!onX && !onZ) throw new Error(`pedestrian ${i} off sidewalk at ${px},${pz}`);
        const node = ix + iz * grid.cols;
        if (onZ && dx < 2 - 1e-3) {
          crossingSamples++;
          if (traffic.signals.lightAt(node, AXIS_NS) !== LIGHT_RED) throw new Error(`crossing N-S street without red at ${px},${pz}`);
        }
        if (onX && dz < 2 - 1e-3) {
          crossingSamples++;
          if (traffic.signals.lightAt(node, AXIS_EW) !== LIGHT_RED) throw new Error(`crossing E-W street without red at ${px},${pz}`);
        }
        if (peds.waiting[i] === 1) waitingSamples++;
      }
    }
    expect(crossingSamples).toBeGreaterThan(1000);
    expect(waitingSamples).toBeGreaterThan(1000);
  });

  it("walks at about a quarter of a unit per second and keeps making progress", () => {
    const peds = createPedestrianSim({ seed: 4, count: 200, grid });
    const travelled = new Float64Array(peds.count);
    const lastX = Float64Array.from(peds.x);
    const lastZ = Float64Array.from(peds.z);
    let movingSpeed = 0;
    let movingSamples = 0;
    for (let step = 0; step < 6000; step++) {
      peds.step(0.1);
      for (let i = 0; i < peds.count; i++) {
        const d = Math.hypot((peds.x[i] ?? 0) - (lastX[i] ?? 0), (peds.z[i] ?? 0) - (lastZ[i] ?? 0));
        lastX[i] = peds.x[i] ?? 0;
        lastZ[i] = peds.z[i] ?? 0;
        travelled[i] = (travelled[i] ?? 0) + d;
        if (d > 0 && d < 0.2) {
          movingSpeed += d / 0.1;
          movingSamples++;
        }
      }
    }
    const mean = movingSpeed / movingSamples;
    expect(mean).toBeGreaterThan(WALK_SPEED * 0.85);
    expect(mean).toBeLessThan(WALK_SPEED * 1.4);
    expect(Math.min(...travelled)).toBeGreaterThan(15);
  });

  it("is deterministic for a seed", () => {
    const a = createPedestrianSim({ seed: 9, count: 150, grid });
    const b = createPedestrianSim({ seed: 9, count: 150, grid });
    const c = createPedestrianSim({ seed: 10, count: 150, grid });
    for (let i = 0; i < 1500; i++) {
      a.step(0.1);
      b.step(0.1);
      c.step(0.1);
    }
    expect(Array.from(a.x)).toEqual(Array.from(b.x));
    expect(Array.from(a.z)).toEqual(Array.from(b.z));
    expect(Array.from(a.x)).not.toEqual(Array.from(c.x));
  });

  it("steps 1000 pedestrians quickly", () => {
    const peds = createPedestrianSim({ seed: 3, count: 1000, grid });
    const start = performance.now();
    for (let i = 0; i < 60; i++) peds.step(1 / 60);
    expect(performance.now() - start).toBeLessThan(200);
  });
});
