import { districts, type DistrictId } from "@/lib/districts";
import { mulberry32 } from "@/lib/random";
import { BLOCK, CITY_BOUNDS } from "./generate";

export type Point = { x: number; z: number };

export type Route = {
  from: DistrictId;
  to: DistrictId;
  points: readonly Point[];
  length: number;
  altitude: number;
};

export type Car = {
  route: number;
  outbound: boolean;
  offset: number;
  speed: number;
  lane: number;
};

export type CarPose = { x: number; z: number; alongX: boolean };

const links: readonly [DistrictId, DistrictId][] = [
  ["skyline", "work"],
  ["skyline", "projects"],
  ["skyline", "about"],
  ["skyline", "contact"],
  ["work", "projects"],
  ["projects", "contact"],
  ["about", "work"],
  ["about", "projects"],
];

export function streetLine(value: number, origin: number): number {
  return origin + Math.round((value - origin) / BLOCK) * BLOCK;
}

function snap(id: DistrictId): Point {
  const [x, , z] = districts[id].center;
  return { x: streetLine(x, CITY_BOUNDS.minX), z: streetLine(z, CITY_BOUNDS.minZ) };
}

function polylineLength(points: readonly Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (a && b) total += Math.abs(b.x - a.x) + Math.abs(b.z - a.z);
  }
  return total;
}

export function buildRoutes(): Route[] {
  return links.map(([from, to]) => {
    const a = snap(from);
    const b = snap(to);
    const points = [a, { x: b.x, z: a.z }, b].filter(
      (p, i, all) => i === 0 || p.x !== all[i - 1]?.x || p.z !== all[i - 1]?.z,
    );
    return { from, to, points, length: polylineLength(points), altitude: 0 };
  }).map((route, index) => ({ ...route, altitude: 12 + ((index * 7) % 11) }));
}

export function pointAt(route: Route, distance: number, reverse: boolean): CarPose {
  const length = route.length;
  let s = ((distance % length) + length) % length;
  if (reverse) s = length - s;
  for (let i = 1; i < route.points.length; i++) {
    const a = route.points[i - 1];
    const b = route.points[i];
    if (!a || !b) continue;
    const segment = Math.abs(b.x - a.x) + Math.abs(b.z - a.z);
    if (s <= segment || i === route.points.length - 1) {
      const t = segment === 0 ? 0 : Math.min(1, s / segment);
      return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t, alongX: a.z === b.z };
    }
    s -= segment;
  }
  const last = route.points[route.points.length - 1] ?? { x: 0, z: 0 };
  return { x: last.x, z: last.z, alongX: true };
}

export function spawnCars(routes: readonly Route[], total: number, seed: number): Car[] {
  const rng = mulberry32(seed);
  const totalLength = routes.reduce((sum, r) => sum + r.length, 0);
  const cars: Car[] = [];
  routes.forEach((route, index) => {
    const count = Math.max(2, Math.round((route.length / totalLength) * total));
    for (let i = 0; i < count; i++) {
      const outbound = i % 2 === 0;
      cars.push({
        route: index,
        outbound,
        offset: rng() * route.length,
        speed: 9 + rng() * 7,
        lane: outbound ? 0.7 : -0.7,
      });
    }
  });
  return cars;
}

export function headsTo(route: Route, outbound: boolean, district: DistrictId): boolean {
  return outbound ? route.to === district : route.from === district;
}
