import { describe, expect, it } from "vitest";
import { BLOCK, CITY_BOUNDS, generateCity } from "../generate";
import { LANE_OFFSET, buildStreetGrid, edgeId } from "./grid";

const grid = buildStreetGrid();

describe("buildStreetGrid", () => {
  it("places streets on the block lattice inside the city bounds", () => {
    expect(grid.xs[0]).toBe(CITY_BOUNDS.minX);
    expect(grid.zs[0]).toBe(CITY_BOUNDS.minZ);
    for (let i = 1; i < grid.xs.length; i++) expect((grid.xs[i] ?? 0) - (grid.xs[i - 1] ?? 0)).toBe(BLOCK);
    expect(grid.xs[grid.xs.length - 1] ?? 0).toBeLessThanOrEqual(CITY_BOUNDS.maxX);
    expect((grid.xs[grid.xs.length - 1] ?? 0) + BLOCK).toBeGreaterThan(CITY_BOUNDS.maxX);
    expect(grid.zs[grid.zs.length - 1] ?? 0).toBeLessThanOrEqual(CITY_BOUNDS.maxZ);
    expect(grid.nodeCount).toBe(grid.cols * grid.rows);
  });

  it("is deterministic", () => {
    const again = buildStreetGrid();
    expect(Array.from(again.edgeIds)).toEqual(Array.from(grid.edgeIds));
    expect(Array.from(again.edgeStartX)).toEqual(Array.from(grid.edgeStartX));
  });

  it("has a directed edge in both directions between every adjacent pair", () => {
    const expected = 2 * ((grid.cols - 1) * grid.rows + grid.cols * (grid.rows - 1));
    expect(grid.edgeIds.length).toBe(expected);
    for (const e of grid.edgeIds) {
      const from = grid.edgeFrom[e] ?? -1;
      const to = grid.edgeTo[e] ?? -1;
      const reverse = edgeId(to, ((grid.edgeDir[e] ?? 0) + 2) & 3);
      expect(grid.edgeFrom[reverse]).toBe(to);
      expect(grid.edgeTo[reverse]).toBe(from);
      expect(grid.edgeLength[e]).toBe(BLOCK);
    }
  });

  it("is fully connected", () => {
    const seen = new Uint8Array(grid.nodeCount);
    const stack = [0];
    seen[0] = 1;
    while (stack.length > 0) {
      const n = stack.pop() ?? 0;
      for (let d = 0; d < 4; d++) {
        const to = grid.edgeTo[edgeId(n, d)] ?? -1;
        if (to >= 0 && !seen[to]) {
          seen[to] = 1;
          stack.push(to);
        }
      }
    }
    expect(seen.every((v) => v === 1)).toBe(true);
  });

  it("offsets each lane to the driver's right-hand side", () => {
    for (const e of grid.edgeIds) {
      const from = grid.edgeFrom[e] ?? 0;
      const to = grid.edgeTo[e] ?? 0;
      const dx = grid.edgeDx[e] ?? 0;
      const dz = grid.edgeDz[e] ?? 0;
      const offX = (grid.edgeStartX[e] ?? 0) - (grid.nodeX[from] ?? 0);
      const offZ = (grid.edgeStartZ[e] ?? 0) - (grid.nodeZ[from] ?? 0);
      expect(offX).toBeCloseTo(-dz * LANE_OFFSET, 9);
      expect(offZ).toBeCloseTo(dx * LANE_OFFSET, 9);
      expect(offX * dx + offZ * dz).toBeCloseTo(0, 9);
      expect((grid.edgeEndX[e] ?? 0) - (grid.nodeX[to] ?? 0)).toBeCloseTo(offX, 9);
      expect((grid.edgeEndZ[e] ?? 0) - (grid.nodeZ[to] ?? 0)).toBeCloseTo(offZ, 9);
      expect(Math.hypot(offX, offZ)).toBeCloseTo(1, 9);
    }
  });

  it("puts eastbound traffic south of the centre line and northbound traffic east of it", () => {
    const n = 5 + 3 * grid.cols;
    const east = edgeId(n, 0);
    const north = edgeId(n, 3);
    expect((grid.edgeStartZ[east] ?? 0) - (grid.nodeZ[n] ?? 0)).toBe(1);
    expect((grid.edgeStartX[north] ?? 0) - (grid.nodeX[n] ?? 0)).toBe(1);
  });

  it("keeps opposing lanes two units apart", () => {
    for (const e of grid.edgeIds) {
      const to = grid.edgeTo[e] ?? 0;
      const from = grid.edgeFrom[e] ?? 0;
      const back = edgeId(to, ((grid.edgeDir[e] ?? 0) + 2) & 3);
      const gapX = (grid.edgeStartX[e] ?? 0) - (grid.edgeEndX[back] ?? 0);
      const gapZ = (grid.edgeStartZ[e] ?? 0) - (grid.edgeEndZ[back] ?? 0);
      expect(Math.hypot(gapX, gapZ)).toBeCloseTo(2 * LANE_OFFSET, 9);
      expect(from).not.toBe(to);
    }
  });

  it("classifies outgoing edges as straight, left and right relative to travel", () => {
    for (const e of grid.edgeIds) {
      const dx = grid.edgeDx[e] ?? 0;
      const dz = grid.edgeDz[e] ?? 0;
      const rx = -dz;
      const rz = dx;
      const s = grid.straightOf[e] ?? -1;
      const l = grid.leftOf[e] ?? -1;
      const r = grid.rightOf[e] ?? -1;
      if (s >= 0) expect((grid.edgeDx[s] ?? 0) * dx + (grid.edgeDz[s] ?? 0) * dz).toBe(1);
      if (r >= 0) expect((grid.edgeDx[r] ?? 0) * rx + (grid.edgeDz[r] ?? 0) * rz).toBe(1);
      if (l >= 0) expect((grid.edgeDx[l] ?? 0) * rx + (grid.edgeDz[l] ?? 0) * rz).toBe(-1);
      for (const o of [s, l, r]) {
        if (o >= 0) expect(grid.edgeFrom[o]).toBe(grid.edgeTo[e]);
      }
    }
  });

  it("offers every edge at least one non-U-turn exit", () => {
    for (const e of grid.edgeIds) {
      expect(Math.max(grid.straightOf[e] ?? -1, grid.leftOf[e] ?? -1, grid.rightOf[e] ?? -1)).toBeGreaterThanOrEqual(0);
      expect(grid.uturnOf[e]).toBe(-1);
    }
  });

  it("keeps lanes clear of buildings", () => {
    const { buildings } = generateCity(7, 1);
    for (const e of grid.edgeIds) {
      for (let s = 0; s <= BLOCK; s += 0.5) {
        const px = (grid.edgeStartX[e] ?? 0) + (grid.edgeDx[e] ?? 0) * s;
        const pz = (grid.edgeStartZ[e] ?? 0) + (grid.edgeDz[e] ?? 0) * s;
        const hit = buildings.some(
          (b) => Math.abs(px - b.x) < b.width / 2 && Math.abs(pz - b.z) < b.depth / 2,
        );
        expect(hit).toBe(false);
      }
    }
  });
});
