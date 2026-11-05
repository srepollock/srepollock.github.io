import { mulberry32 } from "@/lib/random";
import { STOP_LINE_SETBACK, type StreetGrid } from "./grid";
import { AXIS_EW, AXIS_NS, LIGHT_AMBER, LIGHT_GREEN, createSignals, type Signals } from "./signals";

export const CAR_LENGTH = 0.75;
export const MAX_DT = 0.1;
export const MIN_GAP = 0.5;
export const HARD_GAP = 0.2;
export const COMFORT_DECEL = 1.8;
export const MAX_ACCEL = 1.2;
export const BRAKE_LIMIT = 6;
export const AMBER_STOP_DECEL = 3.5;
export const BASE_SPEED = 3;
export const TOP_SPEED = 4;
export const TURN_SPEED = 1.6;
export const STRAIGHT_CHANCE = 0.6;
export const LEFT_CHANCE = 0.2;
export const RIGHT_CHANCE = 0.2;

const HALF_LENGTH = CAR_LENGTH / 2;
const SPAWN_SLOTS = 5;
const SPAWN_PITCH = 2.2;
const SPAWN_START = 0.6;
const TURN_SLOW_ZONE = 7;
const BLEND_TIME = 0.35;
const BOX_ROOM = STOP_LINE_SETBACK + CAR_LENGTH + MIN_GAP;

export type TrafficSim = {
  count: number;
  grid: StreetGrid;
  signals: Signals;
  x: Float32Array;
  z: Float32Array;
  heading: Float32Array;
  speed: Float64Array;
  braking: Uint8Array;
  edge: Int32Array;
  along: Float64Array;
  step: (dt: number) => void;
};

export type TrafficOptions = {
  seed: number;
  cars: number;
  grid: StreetGrid;
  signals?: Signals;
};

function wrapPi(a: number): number {
  let r = a;
  while (r > Math.PI) r -= Math.PI * 2;
  while (r < -Math.PI) r += Math.PI * 2;
  return r;
}

export function createTrafficSim({ seed, cars, grid, signals: shared }: TrafficOptions): TrafficSim {
  const rng = mulberry32(seed);
  const signals = shared ?? createSignals({ grid });
  const ownsSignals = shared === undefined;
  const slots = grid.edgeSlots;
  const edgeIds = grid.edgeIds;
  const capacity = edgeIds.length * SPAWN_SLOTS;
  const count = Math.min(Math.max(0, Math.floor(cars)), capacity);

  const x = new Float32Array(count);
  const z = new Float32Array(count);
  const heading = new Float32Array(count);
  const speed = new Float64Array(count);
  const braking = new Uint8Array(count);
  const edge = new Int32Array(count);
  const along = new Float64Array(count);
  const prevAlong = new Float64Array(count);
  const accel = new Float64Array(count);
  const nextEdge = new Int32Array(count).fill(-1);
  const turn = new Uint8Array(count);
  const mustStop = new Uint8Array(count);
  const ahead = new Int32Array(count).fill(-1);
  const behind = new Int32Array(count).fill(-1);
  const desired = new Float64Array(count);
  const headway = new Float64Array(count);
  const corrX = new Float32Array(count);
  const corrZ = new Float32Array(count);
  const corrH = new Float32Array(count);
  const front = new Int32Array(slots).fill(-1);
  const rear = new Int32Array(slots).fill(-1);

  const pickNext = (car: number, e: number): void => {
    const s = grid.straightOf[e] ?? -1;
    const l = grid.leftOf[e] ?? -1;
    const r = grid.rightOf[e] ?? -1;
    const wS = s >= 0 ? STRAIGHT_CHANCE : 0;
    const wL = l >= 0 ? LEFT_CHANCE : 0;
    const wR = r >= 0 ? RIGHT_CHANCE : 0;
    const total = wS + wL + wR;
    if (total === 0) {
      nextEdge[car] = grid.uturnOf[e] ?? -1;
      turn[car] = 0;
      return;
    }
    const roll = rng() * total;
    if (roll < wS) {
      nextEdge[car] = s;
      turn[car] = 0;
    } else if (roll < wS + wL) {
      nextEdge[car] = l;
      turn[car] = 1;
    } else {
      nextEdge[car] = r;
      turn[car] = 2;
    }
  };

  const occupied = new Int32Array(slots * SPAWN_SLOTS).fill(-1);
  const occupiedCount = new Uint8Array(slots);
  for (let i = 0; i < count; i++) {
    let e = edgeIds[Math.floor(rng() * edgeIds.length)] ?? 0;
    while ((occupiedCount[e] ?? 0) >= SPAWN_SLOTS) e = edgeIds[Math.floor(rng() * edgeIds.length)] ?? 0;
    let slot = Math.floor(rng() * SPAWN_SLOTS);
    while ((occupied[e * SPAWN_SLOTS + slot] ?? -1) >= 0) slot = (slot + 1) % SPAWN_SLOTS;
    occupied[e * SPAWN_SLOTS + slot] = i;
    occupiedCount[e] = (occupiedCount[e] ?? 0) + 1;
    edge[i] = e;
    along[i] = SPAWN_START + slot * SPAWN_PITCH + rng() * 0.8;
    desired[i] = BASE_SPEED * (0.85 + rng() * 0.3);
    headway[i] = 1 + rng() * 0.4;
    speed[i] = desired[i] ?? BASE_SPEED;
    pickNext(i, e);
  }
  for (const e of edgeIds) {
    let last = -1;
    for (let slot = SPAWN_SLOTS - 1; slot >= 0; slot--) {
      const car = occupied[e * SPAWN_SLOTS + slot] ?? -1;
      if (car < 0) continue;
      if (last < 0) front[e] = car;
      else {
        ahead[car] = last;
        behind[last] = car;
      }
      last = car;
      rear[e] = car;
    }
  }

  const writePoses = (decay: number): void => {
    for (let i = 0; i < count; i++) {
      const e = edge[i] ?? 0;
      const s = along[i] ?? 0;
      const cx = corrX[i] ?? 0;
      const cz = corrZ[i] ?? 0;
      const ch = corrH[i] ?? 0;
      x[i] = (grid.edgeStartX[e] ?? 0) + (grid.edgeDx[e] ?? 0) * s + cx;
      z[i] = (grid.edgeStartZ[e] ?? 0) + (grid.edgeDz[e] ?? 0) * s + cz;
      heading[i] = (grid.edgeHeading[e] ?? 0) + ch;
      corrX[i] = cx * decay;
      corrZ[i] = cz * decay;
      corrH[i] = ch * decay;
    }
  };

  const step = (rawDt: number): void => {
    const dt = Math.min(Math.max(rawDt, 0), MAX_DT);
    if (dt <= 0) return;
    if (ownsSignals) signals.step(dt);
    const lights = signals.lights;

    for (let i = 0; i < count; i++) {
      const e = edge[i] ?? 0;
      const len = grid.edgeLength[e] ?? 0;
      const s = along[i] ?? 0;
      const v = speed[i] ?? 0;
      const dNode = len - s;
      let v0 = desired[i] ?? BASE_SPEED;
      if ((turn[i] ?? 0) !== 0 && dNode < TURN_SLOW_ZONE) v0 = Math.min(v0, TURN_SPEED);
      const ratio = v / v0;
      const r2 = ratio * ratio;
      const free = 1 - r2 * r2;
      const t = headway[i] ?? 1.2;
      const ne = nextEdge[i] ?? -1;
      const nextRear = ne >= 0 ? (rear[ne] ?? -1) : -1;
      let interaction = 0;
      let hold = 0;

      let gap = 1e9;
      let vl = 0;
      const lead = ahead[i] ?? -1;
      if (lead >= 0) {
        gap = (along[lead] ?? 0) - s - CAR_LENGTH;
        vl = speed[lead] ?? 0;
      } else if (nextRear >= 0) {
        gap = dNode + (along[nextRear] ?? 0) - CAR_LENGTH;
        vl = speed[nextRear] ?? 0;
      }
      if (gap < 1e8) {
        const g = gap < 0.05 ? 0.05 : gap;
        const star = MIN_GAP + v * t + (v * (v - vl)) / (2 * Math.sqrt(MAX_ACCEL * COMFORT_DECEL));
        const ratioGap = (star > 0 ? star : MIN_GAP) / g;
        interaction = ratioGap * ratioGap;
      }

      const lineDist = len - STOP_LINE_SETBACK - (s + HALF_LENGTH);
      if (lineDist > -0.05) {
        const axis = (grid.edgeDir[e] ?? 0) & 1 ? AXIS_NS : AXIS_EW;
        const light = lights[(grid.edgeTo[e] ?? 0) * 2 + axis] ?? 0;
        let stop = false;
        if (light === LIGHT_GREEN) {
          if (nextRear >= 0 && (along[nextRear] ?? 0) < BOX_ROOM) stop = true;
        } else if (light === LIGHT_AMBER) {
          if (lineDist > (v * v) / (2 * AMBER_STOP_DECEL)) {
            stop = true;
            hold = 1;
          }
        } else {
          stop = true;
          hold = 1;
        }
        if (stop) {
          const g = lineDist < 0.05 ? 0.05 : lineDist;
          const star = MIN_GAP + v * t + (v * v) / (2 * Math.sqrt(MAX_ACCEL * COMFORT_DECEL));
          const ratioGap = star / g;
          const lightInteraction = ratioGap * ratioGap;
          if (lightInteraction > interaction) interaction = lightInteraction;
        }
      }

      let a = MAX_ACCEL * (free - interaction);
      if (a < -BRAKE_LIMIT) a = -BRAKE_LIMIT;
      accel[i] = a;
      mustStop[i] = hold;
    }

    for (let i = 0; i < count; i++) {
      const e = edge[i] ?? 0;
      const a = accel[i] ?? 0;
      let v = (speed[i] ?? 0) + a * dt;
      if (v < 0) v = 0;
      if (v > TOP_SPEED) v = TOP_SPEED;
      const s0 = along[i] ?? 0;
      let s = s0 + v * dt;
      if ((mustStop[i] ?? 0) === 1) {
        const limit = (grid.edgeLength[e] ?? 0) - STOP_LINE_SETBACK - HALF_LENGTH;
        if (s > limit && s0 <= limit + 1e-6) {
          s = limit;
          v = 0;
        }
      }
      prevAlong[i] = s0;
      along[i] = s;
      speed[i] = v;
      braking[i] = a < -0.5 || v < 0.1 ? 1 : 0;
    }

    for (let k = 0; k < edgeIds.length; k++) {
      const e = edgeIds[k] ?? 0;
      const len = grid.edgeLength[e] ?? 0;
      let f = front[e] ?? -1;
      while (f >= 0 && (along[f] ?? 0) >= len) {
        const nf = behind[f] ?? -1;
        front[e] = nf;
        if (nf >= 0) ahead[nf] = -1;
        else rear[e] = -1;

        const ne = nextEdge[f] ?? -1;
        const oldS = along[f] ?? 0;
        let ns = oldS - len;
        const r = rear[ne] ?? -1;
        if (r >= 0) {
          const limit = (along[r] ?? 0) - CAR_LENGTH - HARD_GAP;
          if (ns > limit) {
            ns = limit;
            if ((speed[f] ?? 0) > (speed[r] ?? 0)) speed[f] = speed[r] ?? 0;
          }
        }
        ahead[f] = r;
        behind[f] = -1;
        if (r >= 0) behind[r] = f;
        else front[ne] = f;
        rear[ne] = f;
        edge[f] = ne;
        along[f] = ns;
        prevAlong[f] = Math.min(prevAlong[f] ?? 0, ns);

        corrX[f] =
          (corrX[f] ?? 0) +
          (grid.edgeStartX[e] ?? 0) +
          (grid.edgeDx[e] ?? 0) * oldS -
          ((grid.edgeStartX[ne] ?? 0) + (grid.edgeDx[ne] ?? 0) * ns);
        corrZ[f] =
          (corrZ[f] ?? 0) +
          (grid.edgeStartZ[e] ?? 0) +
          (grid.edgeDz[e] ?? 0) * oldS -
          ((grid.edgeStartZ[ne] ?? 0) + (grid.edgeDz[ne] ?? 0) * ns);
        corrH[f] = (corrH[f] ?? 0) + wrapPi((grid.edgeHeading[e] ?? 0) - (grid.edgeHeading[ne] ?? 0));
        pickNext(f, ne);
        f = front[e] ?? -1;
      }
    }

    for (let k = 0; k < edgeIds.length; k++) {
      const e = edgeIds[k] ?? 0;
      let j = front[e] ?? -1;
      if (j < 0) continue;
      const ne = nextEdge[j] ?? -1;
      const r = ne >= 0 ? (rear[ne] ?? -1) : -1;
      if (r >= 0) {
        const limit = (grid.edgeLength[e] ?? 0) + (along[r] ?? 0) - CAR_LENGTH - HARD_GAP;
        if ((along[j] ?? 0) > limit) {
          along[j] = limit;
          if ((speed[j] ?? 0) > (speed[r] ?? 0)) speed[j] = speed[r] ?? 0;
        }
      }
      let b = behind[j] ?? -1;
      while (b >= 0) {
        const limit = (along[j] ?? 0) - CAR_LENGTH - HARD_GAP;
        if ((along[b] ?? 0) > limit) {
          along[b] = limit;
          if ((speed[b] ?? 0) > (speed[j] ?? 0)) speed[b] = speed[j] ?? 0;
        }
        j = b;
        b = behind[j] ?? -1;
      }
    }

    writePoses(Math.exp(-dt / BLEND_TIME));
  };

  writePoses(1);

  return { count, grid, signals, x, z, heading, speed, braking, edge, along, step };
}
