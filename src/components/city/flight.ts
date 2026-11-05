import type { Vec3 } from "@/lib/districts";

export type Pose = { position: Vec3; target: Vec3 };

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export function flightDuration(from: Vec3, to: Vec3): number {
  const distance = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  return Math.min(3.2, Math.max(1.6, distance / 60));
}

export function arcControl(from: Vec3, to: Vec3): Vec3 {
  const distance = Math.hypot(to[0] - from[0], to[2] - from[2]);
  const lift = Math.max(from[1], to[1]) + distance * 0.35;
  return [(from[0] + to[0]) / 2, lift, (from[2] + to[2]) / 2];
}

function quadratic(a: number, b: number, c: number, t: number): number {
  const u = 1 - t;
  return u * u * a + 2 * u * t * b + t * t * c;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function poseAt(from: Pose, to: Pose, progress: number): Pose {
  const t = easeInOutCubic(Math.min(1, Math.max(0, progress)));
  const control = arcControl(from.position, to.position);
  return {
    position: [
      quadratic(from.position[0], control[0], to.position[0], t),
      quadratic(from.position[1], control[1], to.position[1], t),
      quadratic(from.position[2], control[2], to.position[2], t),
    ],
    target: [
      lerp(from.target[0], to.target[0], t),
      lerp(from.target[1], to.target[1], t),
      lerp(from.target[2], to.target[2], t),
    ],
  };
}
