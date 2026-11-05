import { describe, expect, it } from "vitest";
import { buildStreetGrid } from "./grid";
import {
  TRAIN_ACCEL,
  TRAIN_CAR_GAP,
  TRAIN_CAR_LENGTH,
  TRAIN_DECEL,
  TRAIN_DWELL,
  TRAIN_HEIGHT,
  TRAIN_MAX_SPEED,
  createTrainSim,
  trainLoop,
} from "./train";

const grid = buildStreetGrid();

function distanceToLoop(px: number, pz: number): number {
  let best = Infinity;
  for (let i = 0; i < trainLoop.length; i++) {
    const a = trainLoop[i];
    const b = trainLoop[(i + 1) % trainLoop.length];
    if (!a || !b) continue;
    const len2 = (b.x - a.x) ** 2 + (b.z - a.z) ** 2;
    const t = Math.min(1, Math.max(0, ((px - a.x) * (b.x - a.x) + (pz - a.z) * (b.z - a.z)) / len2));
    best = Math.min(best, Math.hypot(a.x + (b.x - a.x) * t - px, a.z + (b.z - a.z) * t - pz));
  }
  return best;
}

describe("trainLoop", () => {
  it("runs along street centre lines only, inside the city", () => {
    for (let i = 0; i < trainLoop.length; i++) {
      const a = trainLoop[i];
      const b = trainLoop[(i + 1) % trainLoop.length];
      if (!a || !b) throw new Error("missing point");
      expect(grid.xs).toContain(a.x);
      expect(grid.zs).toContain(a.z);
      expect(a.x === b.x || a.z === b.z).toBe(true);
    }
  });

  it("does not cross itself", () => {
    const sim = createTrainSim();
    const horizontal = trainLoop.map((a, i) => ({ a, b: trainLoop[(i + 1) % trainLoop.length] })).filter((s) => s.b && s.a.z === s.b.z);
    const vertical = trainLoop.map((a, i) => ({ a, b: trainLoop[(i + 1) % trainLoop.length] })).filter((s) => s.b && s.a.x === s.b.x);
    let crossings = 0;
    for (const h of horizontal) {
      for (const v of vertical) {
        if (!h.b || !v.b) continue;
        const x = v.a.x;
        const z = h.a.z;
        const inH = x > Math.min(h.a.x, h.b.x) && x < Math.max(h.a.x, h.b.x);
        const inV = z > Math.min(v.a.z, v.b.z) && z < Math.max(v.a.z, v.b.z);
        if (inH && inV) crossings++;
      }
    }
    expect(crossings).toBe(0);
    expect(sim.loopLength).toBe(480);
  });
});

describe("createTrainSim", () => {
  it("serves four or five stations near the districts", () => {
    const sim = createTrainSim();
    expect(sim.stations.length).toBeGreaterThanOrEqual(4);
    expect(sim.stations.length).toBeLessThanOrEqual(5);
    const districts = [
      { x: 0, z: -10 },
      { x: -75, z: -35 },
      { x: 70, z: 15 },
      { x: -60, z: 55 },
    ];
    for (const d of districts) {
      expect(Math.min(...sim.stations.map((s) => Math.hypot(s.x - d.x, s.z - d.z)))).toBeLessThan(6);
    }
    expect(sim.height).toBe(TRAIN_HEIGHT);
    expect(TRAIN_HEIGHT).toBe(9);
  });

  it("keeps every car on the loop and preserves car spacing", () => {
    const sim = createTrainSim();
    expect(sim.cars).toBe(4);
    for (let step = 0; step < 8000; step++) {
      sim.step(0.1);
      for (let c = 0; c < sim.cars; c++) {
        expect(distanceToLoop(sim.x[c] ?? 0, sim.z[c] ?? 0)).toBeLessThan(1e-3);
        if (c > 0) {
          const d = Math.hypot((sim.x[c] ?? 0) - (sim.x[c - 1] ?? 0), (sim.z[c] ?? 0) - (sim.z[c - 1] ?? 0));
          expect(d).toBeLessThanOrEqual(TRAIN_CAR_LENGTH + TRAIN_CAR_GAP + 1e-3);
          expect(d).toBeGreaterThan(TRAIN_CAR_LENGTH * 0.7);
        }
      }
    }
  });

  it("stops at every station for the dwell time and respects speed and acceleration limits", () => {
    const sim = createTrainSim();
    const trainLength = sim.cars * TRAIN_CAR_LENGTH + (sim.cars - 1) * TRAIN_CAR_GAP;
    const stops = new Map<number, number>();
    let dwellTime = 0;
    let dwellingBefore = sim.dwelling;
    let lastSpeed = sim.speed;
    let maxSpeed = 0;
    let maxAccel = 0;
    let maxDecel = 0;
    let station = 0;
    for (let step = 0; step < 12000; step++) {
      const arrivedAt = sim.nextStation;
      sim.step(0.1);
      maxSpeed = Math.max(maxSpeed, sim.speed);
      const dv = (sim.speed - lastSpeed) / 0.1;
      if (!sim.dwelling) {
        maxAccel = Math.max(maxAccel, dv);
        maxDecel = Math.max(maxDecel, -dv);
      }
      lastSpeed = sim.speed;
      if (sim.dwelling && !dwellingBefore) {
        station = (arrivedAt) % sim.stations.length;
        const target = sim.stations[station];
        expect(sim.speed).toBe(0);
        const expected = ((target?.s ?? 0) + trainLength / 2) % sim.loopLength;
        expect(Math.abs(sim.head - expected)).toBeLessThan(1e-6);
        dwellTime = 0;
      }
      if (sim.dwelling) {
        dwellTime += 0.1;
        expect(sim.speed).toBe(0);
        stops.set(station, Math.max(stops.get(station) ?? 0, dwellTime));
      }
      dwellingBefore = sim.dwelling;
    }
    expect(stops.size).toBe(sim.stations.length);
    for (const t of stops.values()) expect(t).toBeGreaterThanOrEqual(TRAIN_DWELL - 0.15);
    expect(maxSpeed).toBeLessThanOrEqual(TRAIN_MAX_SPEED + 1e-9);
    expect(maxSpeed).toBeGreaterThan(TRAIN_MAX_SPEED * 0.9);
    expect(maxAccel).toBeLessThanOrEqual(TRAIN_ACCEL + 1e-6);
    expect(maxDecel).toBeLessThanOrEqual(TRAIN_DECEL * 1.5 + 0.3);
  });

  it("is deterministic", () => {
    const a = createTrainSim();
    const b = createTrainSim();
    for (let i = 0; i < 2000; i++) {
      a.step(0.05);
      b.step(0.05);
    }
    expect(Array.from(a.x)).toEqual(Array.from(b.x));
    expect(Array.from(a.heading)).toEqual(Array.from(b.heading));
  });
});
