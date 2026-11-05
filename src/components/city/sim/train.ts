export const TRAIN_HEIGHT = 9;
export const TRAIN_CAR_LENGTH = 2.2;
export const TRAIN_CAR_GAP = 0.3;
export const TRAIN_MAX_SPEED = 4;
export const TRAIN_ACCEL = 0.8;
export const TRAIN_DECEL = 1;
export const TRAIN_DWELL = 6;

export type LoopPoint = { x: number; z: number };

export type Station = { name: string; x: number; z: number; s: number };

export const trainLoop: readonly LoopPoint[] = [
  { x: -80, z: -38 },
  { x: -5, z: -38 },
  { x: -5, z: -8 },
  { x: 70, z: -8 },
  { x: 70, z: 52 },
  { x: -80, z: 52 },
];

const stationSpecs: readonly { name: string; x: number; z: number }[] = [
  { name: "work", x: -75, z: -38 },
  { name: "skyline", x: 0, z: -8 },
  { name: "projects", x: 70, z: 15 },
  { name: "about", x: -60, z: 52 },
  { name: "west", x: -80, z: 7 },
];

export type TrainOptions = {
  cars?: number;
  carLength?: number;
  gap?: number;
  dwell?: number;
  maxSpeed?: number;
  accel?: number;
  decel?: number;
  startStation?: number;
  loop?: readonly LoopPoint[];
};

export type TrainSim = {
  cars: number;
  carLength: number;
  height: number;
  loop: readonly LoopPoint[];
  loopLength: number;
  stations: readonly Station[];
  x: Float32Array;
  z: Float32Array;
  heading: Float32Array;
  head: number;
  speed: number;
  dwelling: boolean;
  dwellLeft: number;
  nextStation: number;
  step: (dt: number) => void;
};

function segmentLengths(loop: readonly LoopPoint[]): Float64Array {
  const out = new Float64Array(loop.length);
  for (let i = 0; i < loop.length; i++) {
    const a = loop[i];
    const b = loop[(i + 1) % loop.length];
    out[i] = a && b ? Math.hypot(b.x - a.x, b.z - a.z) : 0;
  }
  return out;
}

function projectOntoLoop(loop: readonly LoopPoint[], lengths: Float64Array, px: number, pz: number): number {
  let best = Infinity;
  let bestS = 0;
  let acc = 0;
  for (let i = 0; i < loop.length; i++) {
    const a = loop[i];
    const b = loop[(i + 1) % loop.length];
    const len = lengths[i] ?? 0;
    if (a && b && len > 0) {
      const t = Math.min(1, Math.max(0, ((px - a.x) * (b.x - a.x) + (pz - a.z) * (b.z - a.z)) / (len * len)));
      const d = Math.hypot(a.x + (b.x - a.x) * t - px, a.z + (b.z - a.z) * t - pz);
      if (d < best) {
        best = d;
        bestS = acc + t * len;
      }
    }
    acc += len;
  }
  return bestS;
}

export function createTrainSim(options: TrainOptions = {}): TrainSim {
  const {
    cars = 4,
    carLength = TRAIN_CAR_LENGTH,
    gap = TRAIN_CAR_GAP,
    dwell = TRAIN_DWELL,
    maxSpeed = TRAIN_MAX_SPEED,
    accel = TRAIN_ACCEL,
    decel = TRAIN_DECEL,
    startStation = 0,
    loop = trainLoop,
  } = options;
  const lengths = segmentLengths(loop);
  let loopLength = 0;
  for (let i = 0; i < lengths.length; i++) loopLength += lengths[i] ?? 0;

  const stations: Station[] = stationSpecs
    .map((spec) => ({ ...spec, s: projectOntoLoop(loop, lengths, spec.x, spec.z) }))
    .sort((a, b) => a.s - b.s);
  const trainLength = cars * carLength + (cars - 1) * gap;
  const pitch = carLength + gap;

  const x = new Float32Array(cars);
  const z = new Float32Array(cars);
  const heading = new Float32Array(cars);
  const scratch = new Float64Array(2);

  const wrap = (s: number): number => ((s % loopLength) + loopLength) % loopLength;

  const sample = (distance: number): void => {
    let s = wrap(distance);
    for (let i = 0; i < loop.length; i++) {
      const len = lengths[i] ?? 0;
      if (s <= len || i === loop.length - 1) {
        const a = loop[i];
        const b = loop[(i + 1) % loop.length];
        if (a && b && len > 0) {
          const t = Math.min(1, s / len);
          scratch[0] = a.x + (b.x - a.x) * t;
          scratch[1] = a.z + (b.z - a.z) * t;
        }
        return;
      }
      s -= len;
    }
  };

  const stopHead = (index: number): number => wrap((stations[index]?.s ?? 0) + trainLength / 2);

  const writeCars = (): void => {
    for (let c = 0; c < cars; c++) {
      const center = sim.head - c * pitch - carLength / 2;
      sample(center);
      x[c] = scratch[0] ?? 0;
      z[c] = scratch[1] ?? 0;
      sample(center + carLength / 2);
      const fx = scratch[0] ?? 0;
      const fz = scratch[1] ?? 0;
      sample(center - carLength / 2);
      heading[c] = Math.atan2(fx - (scratch[0] ?? 0), fz - (scratch[1] ?? 0));
    }
  };

  const start = Math.min(Math.max(startStation, 0), stations.length - 1);
  const sim: TrainSim = {
    cars,
    carLength,
    height: TRAIN_HEIGHT,
    loop,
    loopLength,
    stations,
    x,
    z,
    heading,
    head: stopHead(start),
    speed: 0,
    dwelling: true,
    dwellLeft: dwell,
    nextStation: (start + 1) % stations.length,
    step: (rawDt) => {
      const dt = Math.min(Math.max(rawDt, 0), 0.1);
      if (dt <= 0) return;
      if (sim.dwelling) {
        sim.dwellLeft -= dt;
        if (sim.dwellLeft <= 0) sim.dwelling = false;
      } else {
        let distance = wrap(stopHead(sim.nextStation) - sim.head);
        if (distance > loopLength - 0.5) distance = 0;
        const brake = Math.sqrt(2 * decel * Math.max(distance, 0));
        const goal = Math.min(maxSpeed, brake);
        if (sim.speed < goal) sim.speed = Math.min(goal, sim.speed + accel * dt);
        else sim.speed = Math.max(goal, sim.speed - decel * 1.5 * dt);
        const advance = sim.speed * dt;
        if (advance >= distance - 0.02) {
          sim.head = stopHead(sim.nextStation);
          sim.speed = 0;
          sim.dwelling = true;
          sim.dwellLeft = dwell;
          sim.nextStation = (sim.nextStation + 1) % stations.length;
        } else {
          sim.head = wrap(sim.head + advance);
        }
      }
      writeCars();
    },
  };

  writeCars();
  return sim;
}
