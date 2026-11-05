import { mulberry32 } from "@/lib/random";
import { SIDEWALK_OFFSET, type StreetGrid } from "./grid";
import { AXIS_EW, AXIS_NS, DEFAULT_SIGNAL_SEED, LIGHT_GREEN, createSignals, type Signals } from "./signals";

export const WALK_SPEED = 0.25;
export const CROSSING_HURRY = 1.5;
export const CROSSING_MARGIN = 1;
export const MAX_PED_DT = 0.1;

const SIDEWALK_WEIGHT = 1;
const CROSSING_WEIGHT = 0.7;

export type PedestrianSim = {
  count: number;
  grid: StreetGrid;
  signals: Signals;
  x: Float32Array;
  z: Float32Array;
  crossing: Uint8Array;
  waiting: Uint8Array;
  step: (dt: number) => void;
};

export type PedestrianOptions = {
  seed: number;
  count: number;
  grid: StreetGrid;
  signals?: Signals;
};

const MOVE_SIDEWALK_X = 0;
const MOVE_SIDEWALK_Z = 1;
const MOVE_CROSS_X = 2;
const MOVE_CROSS_Z = 3;

export function createPedestrianSim({ seed, count: requested, grid, signals: shared }: PedestrianOptions): PedestrianSim {
  const rng = mulberry32(seed);
  const signals = shared ?? createSignals({ grid, seed: DEFAULT_SIGNAL_SEED });
  const ownsSignals = shared === undefined;
  const count = Math.max(0, Math.floor(requested));
  const cols = grid.cols;
  const rows = grid.rows;
  const cornerCount = grid.nodeCount * 4;

  const cornerX = new Float64Array(cornerCount);
  const cornerZ = new Float64Array(cornerCount);
  for (let n = 0; n < grid.nodeCount; n++) {
    for (let q = 0; q < 4; q++) {
      cornerX[n * 4 + q] = (grid.nodeX[n] ?? 0) + (1 - 2 * (q & 1)) * SIDEWALK_OFFSET;
      cornerZ[n * 4 + q] = (grid.nodeZ[n] ?? 0) + (1 - 2 * (q >> 1)) * SIDEWALK_OFFSET;
    }
  }

  const x = new Float32Array(count);
  const z = new Float32Array(count);
  const crossing = new Uint8Array(count);
  const waiting = new Uint8Array(count);
  const from = new Int32Array(count);
  const to = new Int32Array(count);
  const progress = new Float64Array(count);
  const segLength = new Float64Array(count);
  const pace = new Float64Array(count);
  const conflictAxis = new Uint8Array(count);
  const segNode = new Int32Array(count);

  const target = (corner: number, move: number): number => {
    const n = corner >> 2;
    const q = corner & 3;
    const ix = n % cols;
    const iz = Math.floor(n / cols);
    const sx = 1 - 2 * (q & 1);
    const sz = 1 - 2 * (q >> 1);
    switch (move) {
      case MOVE_SIDEWALK_X: {
        const nx = ix + sx;
        if (nx < 0 || nx >= cols) return -1;
        return (nx + iz * cols) * 4 + (q ^ 1);
      }
      case MOVE_SIDEWALK_Z: {
        const nz = iz + sz;
        if (nz < 0 || nz >= rows) return -1;
        return (ix + nz * cols) * 4 + (q ^ 2);
      }
      case MOVE_CROSS_X:
        return n * 4 + (q ^ 1);
      default:
        return n * 4 + (q ^ 2);
    }
  };

  const allowed = (i: number): boolean => {
    const axis = conflictAxis[i] ?? 0;
    const parallel = axis === AXIS_NS ? AXIS_EW : AXIS_NS;
    const node = segNode[i] ?? 0;
    if (signals.lightAt(node, parallel) !== LIGHT_GREEN) return false;
    const duration = (segLength[i] ?? 0) / ((pace[i] ?? WALK_SPEED) * CROSSING_HURRY);
    return signals.timeUntilGreen(node, axis) >= duration + CROSSING_MARGIN;
  };

  const choose = (i: number): void => {
    const corner = to[i] ?? 0;
    const previous = from[i] ?? -1;
    let total = 0;
    let weights0 = 0;
    let weights1 = 0;
    let weights2 = 0;
    let weights3 = 0;
    for (let move = 0; move < 4; move++) {
      const t = target(corner, move);
      if (t < 0 || t === previous) continue;
      const w = move < 2 ? SIDEWALK_WEIGHT : CROSSING_WEIGHT;
      total += w;
      if (move === 0) weights0 = w;
      else if (move === 1) weights1 = w;
      else if (move === 2) weights2 = w;
      else weights3 = w;
    }
    let move: number;
    if (total === 0) {
      move = MOVE_SIDEWALK_X;
      for (let m = 0; m < 4; m++) {
        if (target(corner, m) >= 0) {
          move = m;
          break;
        }
      }
    } else {
      const roll = rng() * total;
      if (roll < weights0) move = MOVE_SIDEWALK_X;
      else if (roll < weights0 + weights1) move = MOVE_SIDEWALK_Z;
      else if (roll < weights0 + weights1 + weights2) move = MOVE_CROSS_X;
      else move = weights3 > 0 ? MOVE_CROSS_Z : MOVE_CROSS_X;
    }
    const dest = target(corner, move);
    from[i] = corner;
    to[i] = dest;
    progress[i] = 0;
    const dx = (cornerX[dest] ?? 0) - (cornerX[corner] ?? 0);
    const dz = (cornerZ[dest] ?? 0) - (cornerZ[corner] ?? 0);
    segLength[i] = Math.hypot(dx, dz);
    if (move >= MOVE_CROSS_X) {
      crossing[i] = 1;
      segNode[i] = corner >> 2;
      conflictAxis[i] = move === MOVE_CROSS_X ? AXIS_NS : AXIS_EW;
      waiting[i] = allowed(i) ? 0 : 1;
    } else {
      crossing[i] = 0;
      waiting[i] = 0;
    }
  };

  for (let i = 0; i < count; i++) {
    const n = Math.floor(rng() * grid.nodeCount);
    const q = Math.floor(rng() * 4);
    const corner = n * 4 + q;
    pace[i] = WALK_SPEED * (0.85 + rng() * 0.3);
    from[i] = -1;
    to[i] = corner;
    choose(i);
    const length = segLength[i] ?? 0;
    if (!(crossing[i] === 1) && length > 0) progress[i] = rng() * length;
    const t = length > 0 ? (progress[i] ?? 0) / length : 0;
    x[i] = (cornerX[corner] ?? 0) + ((cornerX[to[i] ?? 0] ?? 0) - (cornerX[corner] ?? 0)) * t;
    z[i] = (cornerZ[corner] ?? 0) + ((cornerZ[to[i] ?? 0] ?? 0) - (cornerZ[corner] ?? 0)) * t;
  }

  const step = (rawDt: number): void => {
    const dt = Math.min(Math.max(rawDt, 0), MAX_PED_DT);
    if (dt <= 0) return;
    if (ownsSignals) signals.step(dt);
    for (let i = 0; i < count; i++) {
      if ((waiting[i] ?? 0) === 1) {
        if (!allowed(i)) continue;
        waiting[i] = 0;
      }
      const length = segLength[i] ?? 0;
      const hurry = (crossing[i] ?? 0) === 1 ? CROSSING_HURRY : 1;
      let p = (progress[i] ?? 0) + (pace[i] ?? WALK_SPEED) * hurry * dt;
      if (p >= length) {
        const arrived = to[i] ?? 0;
        choose(i);
        p = 0;
        progress[i] = 0;
        x[i] = cornerX[arrived] ?? 0;
        z[i] = cornerZ[arrived] ?? 0;
        continue;
      }
      progress[i] = p;
      const a = from[i] ?? 0;
      const b = to[i] ?? 0;
      const t = p / length;
      x[i] = (cornerX[a] ?? 0) + ((cornerX[b] ?? 0) - (cornerX[a] ?? 0)) * t;
      z[i] = (cornerZ[a] ?? 0) + ((cornerZ[b] ?? 0) - (cornerZ[a] ?? 0)) * t;
    }
  };

  return { count, grid, signals, x, z, crossing, waiting, step };
}
