import { BLOCK, CITY_BOUNDS } from "../generate";

export const LANE_OFFSET = 1;
export const SIDEWALK_OFFSET = 2.4;
export const STOP_LINE_SETBACK = 2.2;

export const DIR_EAST = 0;
export const DIR_SOUTH = 1;
export const DIR_WEST = 2;
export const DIR_NORTH = 3;

const DIR_DX = [1, 0, -1, 0] as const;
const DIR_DZ = [0, 1, 0, -1] as const;

export type StreetGrid = {
  cols: number;
  rows: number;
  nodeCount: number;
  xs: readonly number[];
  zs: readonly number[];
  nodeX: Float64Array;
  nodeZ: Float64Array;
  edgeSlots: number;
  edgeIds: Int32Array;
  edgeFrom: Int32Array;
  edgeTo: Int32Array;
  edgeDir: Int8Array;
  edgeDx: Float64Array;
  edgeDz: Float64Array;
  edgeStartX: Float64Array;
  edgeStartZ: Float64Array;
  edgeEndX: Float64Array;
  edgeEndZ: Float64Array;
  edgeLength: Float64Array;
  edgeHeading: Float64Array;
  straightOf: Int32Array;
  leftOf: Int32Array;
  rightOf: Int32Array;
  uturnOf: Int32Array;
};

export function directionHeading(dir: number): number {
  return Math.atan2(DIR_DX[dir & 3] ?? 0, DIR_DZ[dir & 3] ?? 0);
}

export function nodeIndex(grid: StreetGrid, ix: number, iz: number): number {
  return ix + iz * grid.cols;
}

export function edgeId(node: number, dir: number): number {
  return node * 4 + dir;
}

function lines(origin: number, max: number): number[] {
  const out: number[] = [];
  for (let v = origin; v <= max + 1e-9; v += BLOCK) out.push(v);
  return out;
}

export function buildStreetGrid(): StreetGrid {
  const xs = lines(CITY_BOUNDS.minX, CITY_BOUNDS.maxX);
  const zs = lines(CITY_BOUNDS.minZ, CITY_BOUNDS.maxZ);
  const cols = xs.length;
  const rows = zs.length;
  const nodeCount = cols * rows;
  const slots = nodeCount * 4;

  const nodeX = new Float64Array(nodeCount);
  const nodeZ = new Float64Array(nodeCount);
  for (let iz = 0; iz < rows; iz++) {
    for (let ix = 0; ix < cols; ix++) {
      nodeX[ix + iz * cols] = xs[ix] ?? 0;
      nodeZ[ix + iz * cols] = zs[iz] ?? 0;
    }
  }

  const edgeFrom = new Int32Array(slots).fill(-1);
  const edgeTo = new Int32Array(slots).fill(-1);
  const edgeDir = new Int8Array(slots).fill(-1);
  const edgeDx = new Float64Array(slots);
  const edgeDz = new Float64Array(slots);
  const edgeStartX = new Float64Array(slots);
  const edgeStartZ = new Float64Array(slots);
  const edgeEndX = new Float64Array(slots);
  const edgeEndZ = new Float64Array(slots);
  const edgeLength = new Float64Array(slots);
  const edgeHeading = new Float64Array(slots);
  const straightOf = new Int32Array(slots).fill(-1);
  const leftOf = new Int32Array(slots).fill(-1);
  const rightOf = new Int32Array(slots).fill(-1);
  const uturnOf = new Int32Array(slots).fill(-1);
  const ids: number[] = [];

  const neighbour = (ix: number, iz: number, dir: number): number => {
    const nx = ix + (DIR_DX[dir] ?? 0);
    const nz = iz + (DIR_DZ[dir] ?? 0);
    if (nx < 0 || nz < 0 || nx >= cols || nz >= rows) return -1;
    return nx + nz * cols;
  };

  for (let iz = 0; iz < rows; iz++) {
    for (let ix = 0; ix < cols; ix++) {
      const from = ix + iz * cols;
      for (let dir = 0; dir < 4; dir++) {
        const to = neighbour(ix, iz, dir);
        if (to < 0) continue;
        const e = edgeId(from, dir);
        const dx = DIR_DX[dir] ?? 0;
        const dz = DIR_DZ[dir] ?? 0;
        const rx = -dz * LANE_OFFSET;
        const rz = dx * LANE_OFFSET;
        edgeFrom[e] = from;
        edgeTo[e] = to;
        edgeDir[e] = dir;
        edgeDx[e] = dx;
        edgeDz[e] = dz;
        edgeStartX[e] = (nodeX[from] ?? 0) + rx;
        edgeStartZ[e] = (nodeZ[from] ?? 0) + rz;
        edgeEndX[e] = (nodeX[to] ?? 0) + rx;
        edgeEndZ[e] = (nodeZ[to] ?? 0) + rz;
        edgeLength[e] = Math.hypot((nodeX[to] ?? 0) - (nodeX[from] ?? 0), (nodeZ[to] ?? 0) - (nodeZ[from] ?? 0));
        edgeHeading[e] = directionHeading(dir);
        ids.push(e);
      }
    }
  }

  for (const e of ids) {
    const to = edgeTo[e] ?? -1;
    const dir = edgeDir[e] ?? 0;
    const ix = to % cols;
    const iz = Math.floor(to / cols);
    const out = (d: number): number => (neighbour(ix, iz, d) < 0 ? -1 : edgeId(to, d));
    straightOf[e] = out(dir);
    rightOf[e] = out((dir + 1) & 3);
    leftOf[e] = out((dir + 3) & 3);
    if (straightOf[e] === -1 && rightOf[e] === -1 && leftOf[e] === -1) uturnOf[e] = out((dir + 2) & 3);
  }

  return {
    cols,
    rows,
    nodeCount,
    xs,
    zs,
    nodeX,
    nodeZ,
    edgeSlots: slots,
    edgeIds: Int32Array.from(ids),
    edgeFrom,
    edgeTo,
    edgeDir,
    edgeDx,
    edgeDz,
    edgeStartX,
    edgeStartZ,
    edgeEndX,
    edgeEndZ,
    edgeLength,
    edgeHeading,
    straightOf,
    leftOf,
    rightOf,
    uturnOf,
  };
}
