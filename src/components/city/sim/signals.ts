import { mulberry32 } from "@/lib/random";
import type { StreetGrid } from "./grid";

export const AXIS_NS = 0;
export const AXIS_EW = 1;

export const LIGHT_RED = 0;
export const LIGHT_AMBER = 1;
export const LIGHT_GREEN = 2;

export const PHASE_NS_GREEN = 0;
export const PHASE_NS_AMBER = 1;
export const PHASE_ALL_RED_A = 2;
export const PHASE_EW_GREEN = 3;
export const PHASE_EW_AMBER = 4;
export const PHASE_ALL_RED_B = 5;

export const GREEN_TIME = 16;
export const AMBER_TIME = 2.5;
export const ALL_RED_TIME = 1;
export const DEFAULT_SIGNAL_SEED = 0x51617;

const HALF = GREEN_TIME + AMBER_TIME + ALL_RED_TIME;
const CYCLE = HALF * 2;

export type Signals = {
  count: number;
  x: Float32Array;
  z: Float32Array;
  lights: Uint8Array;
  phase: Uint8Array;
  offsets: Float32Array;
  time: number;
  cycle: number;
  step: (dt: number) => void;
  lightAt: (node: number, axis: number) => number;
  timeUntilGreen: (node: number, axis: number) => number;
};

export function createSignals({ seed = DEFAULT_SIGNAL_SEED, grid }: { seed?: number; grid: StreetGrid }): Signals {
  const rng = mulberry32(seed);
  const count = grid.nodeCount;
  const x = new Float32Array(count);
  const z = new Float32Array(count);
  const offsets = new Float32Array(count);
  const lights = new Uint8Array(count * 2);
  const phase = new Uint8Array(count);
  for (let i = 0; i < count; i++) {
    x[i] = grid.nodeX[i] ?? 0;
    z[i] = grid.nodeZ[i] ?? 0;
    offsets[i] = rng() * CYCLE;
  }

  const signals: Signals = {
    count,
    x,
    z,
    lights,
    phase,
    offsets,
    time: 0,
    cycle: CYCLE,
    step: (dt) => {
      signals.time += dt;
      refresh();
    },
    lightAt: (node, axis) => lights[node * 2 + axis] ?? LIGHT_RED,
    timeUntilGreen: (node, axis) => {
      if ((lights[node * 2 + axis] ?? 0) === LIGHT_GREEN) return 0;
      const local = (signals.time + (offsets[node] ?? 0)) % CYCLE;
      let delta = (axis === AXIS_NS ? 0 : HALF) - local;
      if (delta <= 0) delta += CYCLE;
      return delta;
    },
  };

  function refresh(): void {
    for (let i = 0; i < count; i++) {
      const local = (signals.time + (offsets[i] ?? 0)) % CYCLE;
      let p: number;
      let ns = LIGHT_RED;
      let ew = LIGHT_RED;
      if (local < GREEN_TIME) {
        p = PHASE_NS_GREEN;
        ns = LIGHT_GREEN;
      } else if (local < GREEN_TIME + AMBER_TIME) {
        p = PHASE_NS_AMBER;
        ns = LIGHT_AMBER;
      } else if (local < HALF) {
        p = PHASE_ALL_RED_A;
      } else if (local < HALF + GREEN_TIME) {
        p = PHASE_EW_GREEN;
        ew = LIGHT_GREEN;
      } else if (local < HALF + GREEN_TIME + AMBER_TIME) {
        p = PHASE_EW_AMBER;
        ew = LIGHT_AMBER;
      } else {
        p = PHASE_ALL_RED_B;
      }
      phase[i] = p;
      lights[i * 2] = ns;
      lights[i * 2 + 1] = ew;
    }
  }

  refresh();
  return signals;
}
