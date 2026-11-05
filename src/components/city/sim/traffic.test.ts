import { describe, expect, it } from "vitest";
import { STOP_LINE_SETBACK, buildStreetGrid } from "./grid";
import { AXIS_EW, AXIS_NS, LIGHT_AMBER, LIGHT_GREEN, LIGHT_RED, createSignals } from "./signals";
import { CAR_LENGTH, HARD_GAP, TOP_SPEED, createTrafficSim } from "./traffic";

const grid = buildStreetGrid();

describe("signals", () => {
  it("never shows green to both axes and always passes through amber", () => {
    const signals = createSignals({ seed: 3, grid });
    const sawAmber = new Uint8Array(grid.nodeCount * 2);
    const sawGreen = new Uint8Array(grid.nodeCount * 2);
    for (let t = 0; t < 1200; t++) {
      signals.step(0.1);
      for (let n = 0; n < grid.nodeCount; n++) {
        const ns = signals.lightAt(n, AXIS_NS);
        const ew = signals.lightAt(n, AXIS_EW);
        expect(ns === LIGHT_GREEN && ew !== LIGHT_RED).toBe(false);
        expect(ew === LIGHT_GREEN && ns !== LIGHT_RED).toBe(false);
        if (ns === LIGHT_AMBER) sawAmber[n * 2] = 1;
        if (ew === LIGHT_AMBER) sawAmber[n * 2 + 1] = 1;
        if (ns === LIGHT_GREEN) sawGreen[n * 2] = 1;
        if (ew === LIGHT_GREEN) sawGreen[n * 2 + 1] = 1;
      }
    }
    expect(sawAmber.every((v) => v === 1)).toBe(true);
    expect(sawGreen.every((v) => v === 1)).toBe(true);
  });

  it("staggers intersections so they do not flash in sync", () => {
    const signals = createSignals({ seed: 3, grid });
    const phases = new Set<number>();
    for (let n = 0; n < grid.nodeCount; n++) phases.add(signals.phase[n] ?? 0);
    expect(phases.size).toBeGreaterThanOrEqual(4);
    expect(new Set(Array.from(signals.offsets)).size).toBeGreaterThan(grid.nodeCount / 2);
  });

  it("reports the time until green consistently", () => {
    for (let n = 0; n < 30; n++) {
      const signals = createSignals({ seed: 5, grid });
      const wait = signals.timeUntilGreen(n, AXIS_NS);
      expect(wait).toBeGreaterThanOrEqual(0);
      if (wait === 0) {
        expect(signals.lightAt(n, AXIS_NS)).toBe(LIGHT_GREEN);
        continue;
      }
      signals.step(wait - 0.01);
      expect(signals.lightAt(n, AXIS_NS)).not.toBe(LIGHT_GREEN);
      signals.step(0.02);
      expect(signals.lightAt(n, AXIS_NS)).toBe(LIGHT_GREEN);
    }
  });
});

describe("createTrafficSim", () => {
  it("exposes typed arrays sized to the car count and valid starting poses", () => {
    const sim = createTrafficSim({ seed: 1, cars: 200, grid });
    expect(sim.count).toBe(200);
    expect(sim.x).toBeInstanceOf(Float32Array);
    expect(sim.z).toBeInstanceOf(Float32Array);
    expect(sim.heading).toBeInstanceOf(Float32Array);
    expect(sim.speed.length).toBe(200);
    expect(sim.braking.length).toBe(200);
    for (let i = 0; i < sim.count; i++) {
      expect(Number.isFinite(sim.x[i])).toBe(true);
      expect(Number.isFinite(sim.z[i])).toBe(true);
    }
  });

  it("never lets two cars on the same lane get closer than the hard minimum gap", () => {
    const sim = createTrafficSim({ seed: 11, cars: 600, grid });
    const byEdge = new Map<number, number[]>();
    let worst = Infinity;
    for (let step = 0; step < 3000; step++) {
      sim.step(0.1);
      byEdge.clear();
      for (let i = 0; i < sim.count; i++) {
        const e = sim.edge[i] ?? 0;
        const list = byEdge.get(e);
        if (list) list.push(i);
        else byEdge.set(e, [i]);
      }
      for (const list of byEdge.values()) {
        list.sort((a, b) => (sim.along[a] ?? 0) - (sim.along[b] ?? 0));
        for (let k = 1; k < list.length; k++) {
          const gap = (sim.along[list[k] ?? 0] ?? 0) - (sim.along[list[k - 1] ?? 0] ?? 0) - CAR_LENGTH;
          if (gap < worst) worst = gap;
        }
      }
    }
    expect(worst).toBeGreaterThanOrEqual(HARD_GAP - 1e-6);
  });

  it("keeps cars apart across intersections for cars travelling the same way", () => {
    const sim = createTrafficSim({ seed: 12, cars: 700, grid });
    let worst = Infinity;
    for (let step = 0; step < 1500; step++) {
      sim.step(0.1);
      if (step % 5 !== 0) continue;
      for (let i = 0; i < sim.count; i++) {
        for (let j = i + 1; j < sim.count; j++) {
          const hi = sim.heading[i] ?? 0;
          const hj = sim.heading[j] ?? 0;
          if (Math.abs(hi - hj) > 1e-3) continue;
          const dx = (sim.x[j] ?? 0) - (sim.x[i] ?? 0);
          const dz = (sim.z[j] ?? 0) - (sim.z[i] ?? 0);
          const fx = Math.sin(hi);
          const fz = Math.cos(hi);
          const lateral = Math.abs(dx * fz - dz * fx);
          if (lateral > 0.3) continue;
          const longitudinal = Math.abs(dx * fx + dz * fz);
          if (longitudinal < worst) worst = longitudinal;
        }
      }
    }
    expect(worst).toBeGreaterThanOrEqual(CAR_LENGTH + HARD_GAP - 0.05);
  });

  it("never crosses a stop line against a red signal", () => {
    const sim = createTrafficSim({ seed: 21, cars: 600, grid });
    const prevEdge = new Int32Array(sim.count);
    const prevFront = new Float64Array(sim.count);
    let crossings = 0;
    let amberCrossings = 0;
    let violations = 0;
    for (let step = 0; step < 3000; step++) {
      for (let i = 0; i < sim.count; i++) {
        prevEdge[i] = sim.edge[i] ?? 0;
        prevFront[i] = (sim.along[i] ?? 0) + CAR_LENGTH / 2;
      }
      sim.step(0.1);
      for (let i = 0; i < sim.count; i++) {
        const e = sim.edge[i] ?? 0;
        if (e !== prevEdge[i]) continue;
        const line = (grid.edgeLength[e] ?? 0) - STOP_LINE_SETBACK;
        const front = (sim.along[i] ?? 0) + CAR_LENGTH / 2;
        if ((prevFront[i] ?? 0) <= line && front > line) {
          crossings++;
          const axis = (grid.edgeDir[e] ?? 0) % 2 === 1 ? AXIS_NS : AXIS_EW;
          const light = sim.signals.lightAt(grid.edgeTo[e] ?? 0, axis);
          if (light === LIGHT_RED) violations++;
          if (light === LIGHT_AMBER) {
            amberCrossings++;
            expect(sim.speed[i] ?? 0).toBeGreaterThan(0.5);
          }
        }
      }
    }
    expect(crossings).toBeGreaterThan(2000);
    expect(violations).toBe(0);
    expect(amberCrossings).toBeLessThan(crossings * 0.2);
  });

  it("keeps traffic flowing without permanent gridlock", () => {
    const sim = createTrafficSim({ seed: 31, cars: 600, grid });
    const travelled = new Float64Array(sim.count);
    let speedSum = 0;
    let samples = 0;
    let topSpeed = 0;
    for (let step = 0; step < 3000; step++) {
      sim.step(0.1);
      if (step >= 1500) {
        for (let i = 0; i < sim.count; i++) {
          const v = sim.speed[i] ?? 0;
          travelled[i] = (travelled[i] ?? 0) + v * 0.1;
          speedSum += v;
          samples++;
          if (v > topSpeed) topSpeed = v;
        }
      }
    }
    expect(speedSum / samples).toBeGreaterThan(0.7);
    expect(topSpeed).toBeLessThanOrEqual(TOP_SPEED + 1e-9);
    expect(Math.min(...travelled)).toBeGreaterThan(8);
  });

  it("keeps heavy traffic moving", () => {
    const sim = createTrafficSim({ seed: 32, cars: 2400, grid });
    let moved = 0;
    for (let step = 0; step < 1500; step++) sim.step(0.1);
    for (let step = 0; step < 300; step++) {
      sim.step(0.1);
      for (let i = 0; i < sim.count; i++) moved += (sim.speed[i] ?? 0) * 0.1;
    }
    expect(moved / sim.count / 30).toBeGreaterThan(0.25);
  });

  it("is deterministic for a seed and varies between seeds", () => {
    const a = createTrafficSim({ seed: 5, cars: 300, grid });
    const b = createTrafficSim({ seed: 5, cars: 300, grid });
    const c = createTrafficSim({ seed: 6, cars: 300, grid });
    for (let i = 0; i < 800; i++) {
      a.step(0.07);
      b.step(0.07);
      c.step(0.07);
    }
    expect(Array.from(a.x)).toEqual(Array.from(b.x));
    expect(Array.from(a.z)).toEqual(Array.from(b.z));
    expect(Array.from(a.heading)).toEqual(Array.from(b.heading));
    expect(Array.from(a.x)).not.toEqual(Array.from(c.x));
  });

  it("clamps oversized time steps", () => {
    const a = createTrafficSim({ seed: 8, cars: 100, grid });
    const b = createTrafficSim({ seed: 8, cars: 100, grid });
    a.step(5);
    b.step(0.1);
    expect(Array.from(a.x)).toEqual(Array.from(b.x));
  });

  it("keeps cars in their lanes and braking flags sensible", () => {
    const sim = createTrafficSim({ seed: 9, cars: 400, grid });
    let braked = 0;
    for (let step = 0; step < 600; step++) {
      sim.step(0.1);
      for (let i = 0; i < sim.count; i++) {
        const e = sim.edge[i] ?? 0;
        const s = sim.along[i] ?? 0;
        const settled = Math.abs(Math.sin(sim.heading[i] ?? 0) - (grid.edgeDx[e] ?? 0)) < 1e-3;
        if (!settled) continue;
        const along = (grid.edgeDx[e] ?? 0) !== 0;
        const lane = along ? (sim.z[i] ?? 0) - (grid.edgeStartZ[e] ?? 0) : (sim.x[i] ?? 0) - (grid.edgeStartX[e] ?? 0);
        if (Math.abs(lane) < 1e-3 && s > 0 && s < (grid.edgeLength[e] ?? 0)) braked += sim.braking[i] ?? 0;
      }
    }
    expect(braked).toBeGreaterThan(0);
  });

  it("steps 800 cars quickly", () => {
    const sim = createTrafficSim({ seed: 2, cars: 800, grid });
    for (let i = 0; i < 20; i++) sim.step(1 / 60);
    const start = performance.now();
    for (let i = 0; i < 60; i++) sim.step(1 / 60);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(500);
  });
});
