import { CITY_BOUNDS } from "./generate";
import type { Building } from "./generate";
import type { Keys } from "@/lib/flyInput";

export { noKeys, type Keys } from "@/lib/flyInput";

const bindings: Readonly<Record<string, keyof Keys>> = {
  w: "forward",
  arrowup: "forward",
  s: "back",
  arrowdown: "back",
  a: "left",
  arrowleft: "left",
  d: "right",
  arrowright: "right",
  e: "up",
  " ": "up",
  q: "down",
  c: "down",
  shift: "boost",
};

export function keyFor(key: string): keyof Keys | null {
  return bindings[key.toLowerCase()] ?? null;
}

export type Vec3 = [number, number, number];

export function moveVector(keys: Keys, yaw: number, dt: number): Vec3 {
  const speed = (keys.boost ? 70 : 30) * dt;
  const ahead = Number(keys.forward) - Number(keys.back);
  const strafe = Number(keys.right) - Number(keys.left);
  const climb = Number(keys.up) - Number(keys.down);
  const length = Math.hypot(ahead, strafe) || 1;
  const fx = -Math.sin(yaw);
  const fz = -Math.cos(yaw);
  const rx = Math.cos(yaw);
  const rz = -Math.sin(yaw);
  return [
    ((fx * ahead + rx * strafe) / length) * speed,
    climb * speed * 0.7,
    ((fz * ahead + rz * strafe) / length) * speed,
  ];
}

export type HeightField = (x: number, z: number) => number;

export function heightField(buildings: readonly Building[], cell = 5): HeightField {
  const grid = new Map<string, number>();
  for (const b of buildings) {
    const x0 = Math.floor((b.x - b.width / 2) / cell);
    const x1 = Math.floor((b.x + b.width / 2) / cell);
    const z0 = Math.floor((b.z - b.depth / 2) / cell);
    const z1 = Math.floor((b.z + b.depth / 2) / cell);
    for (let ix = x0; ix <= x1; ix++) {
      for (let iz = z0; iz <= z1; iz++) {
        const key = `${ix},${iz}`;
        grid.set(key, Math.max(grid.get(key) ?? 0, b.height));
      }
    }
  }
  return (x, z) => grid.get(`${Math.floor(x / cell)},${Math.floor(z / cell)}`) ?? 0;
}

export const FLY_LIMITS = {
  minX: CITY_BOUNDS.minX - 80,
  maxX: CITY_BOUNDS.maxX + 80,
  minZ: CITY_BOUNDS.minZ - 160,
  maxZ: CITY_BOUNDS.maxZ + 140,
  maxY: 220,
  clearance: 3,
} as const;

export function constrain(position: Vec3, heightAt: HeightField): Vec3 {
  const x = Math.min(FLY_LIMITS.maxX, Math.max(FLY_LIMITS.minX, position[0]));
  const z = Math.min(FLY_LIMITS.maxZ, Math.max(FLY_LIMITS.minZ, position[2]));
  const floor = heightAt(x, z) + FLY_LIMITS.clearance;
  const y = Math.min(FLY_LIMITS.maxY, Math.max(floor, position[1]));
  return [x, y, z];
}

export function clampPitch(pitch: number): number {
  return Math.min(1.2, Math.max(-1.3, pitch));
}
