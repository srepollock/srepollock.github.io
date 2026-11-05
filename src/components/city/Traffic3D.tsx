"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { DistrictId } from "@/lib/districts";
import type { ScenePalette } from "./palette";
import { buildRoutes, headsTo, pointAt, spawnCars } from "./traffic";

const WHITE = new THREE.Color("#ffffff");

export default function Traffic({
  palette,
  total,
  deployTarget,
  animate,
}: {
  palette: ScenePalette;
  total: number;
  deployTarget: DistrictId | null;
  animate: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const routes = useMemo(() => buildRoutes(), []);
  const cars = useMemo(() => spawnCars(routes, total, 31), [routes, total]);
  const travelled = useMemo(() => Float32Array.from(cars, (car) => car.offset), [cars]);
  const scratch = useMemo(() => ({ matrix: new THREE.Matrix4(), color: new THREE.Color() }), []);

  useFrame((_, delta) => {
    const target = mesh.current;
    if (!target) return;
    const step = animate ? Math.min(delta, 0.1) : 0;
    cars.forEach((car, i) => {
      const route = routes[car.route];
      if (!route) return;
      const surging = deployTarget !== null && headsTo(route, car.outbound, deployTarget);
      travelled[i] = (travelled[i] ?? 0) + step * car.speed * (surging ? 3.2 : 1);
      const pose = pointAt(route, travelled[i] ?? 0, !car.outbound);
      const x = pose.x + (pose.alongX ? 0 : car.lane);
      const z = pose.z + (pose.alongX ? car.lane : 0);
      scratch.matrix.makeScale(pose.alongX ? 4.2 : 0.6, 0.3, pose.alongX ? 0.6 : 4.2).setPosition(x, route.altitude, z);
      target.setMatrixAt(i, scratch.matrix);
      scratch.color.set(car.outbound ? palette.neon : palette.window);
      if (surging) scratch.color.lerp(WHITE, 0.55);
      target.setColorAt(i, scratch.color);
    });
    target.instanceMatrix.needsUpdate = true;
    if (target.instanceColor) target.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, cars.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}
