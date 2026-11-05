"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { createGlowPoints, type GlowMaterial } from "./glow";
import type { ScenePalette } from "./palette";
import {
  buildStreetGrid,
  createPedestrianSim,
  createTrafficSim,
  createTrainSim,
  LIGHT_AMBER,
  LIGHT_GREEN,
  trainLoop,
  TRAIN_HEIGHT,
} from "./sim";

const CAR_BODY_COLORS = ["#20242c", "#2b3340", "#5a1f24", "#d7dbe0", "#1f3a52", "#3c3f44", "#8a8f96", "#0f1115"];
const SIGNAL_COLORS = { red: new THREE.Color("#ff3b3b"), amber: new THREE.Color("#ffb547"), green: new THREE.Color("#46ff9a") };
const HEAD = new THREE.Color("#fff3d6");
const TAIL = new THREE.Color("#ff2a1f");
const WALKER = new THREE.Color("#ffd9a8");

type Props = {
  palette: ScenePalette;
  cars: number;
  pedestrians: number;
  showPedestrians: boolean;
  animate: boolean;
};

function useGlowScale(materials: readonly GlowMaterial[]) {
  const size = useThree((state) => state.size);
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    const scale = (size.height * 1.5) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    for (const material of materials) material.uniforms.uScale.value = scale;
  }, [size.height, camera.fov, materials]);
}

export default function Sim3D({ palette, cars, pedestrians, showPedestrians, animate }: Props) {
  const sims = useMemo(() => {
    const grid = buildStreetGrid();
    const traffic = createTrafficSim({ seed: 11, cars, grid });
    const walkers = createPedestrianSim({ seed: 12, count: pedestrians, grid, signals: traffic.signals });
    const train = createTrainSim();
    for (let i = 0; i < 240; i++) {
      traffic.step(0.1);
      walkers.step(0.1);
      train.step(0.1);
    }
    return { traffic, walkers, train };
  }, [cars, pedestrians]);

  const carGlow = useMemo(() => createGlowPoints(cars * 2, 1.25), [cars]);
  const signalGlow = useMemo(() => createGlowPoints(sims.traffic.signals.count * 4, 0.6), [sims]);
  const walkerGlow = useMemo(() => createGlowPoints(pedestrians, 0.55), [pedestrians]);
  const trainGlow = useMemo(() => createGlowPoints(2, 2.2), []);
  const bodies = useRef<THREE.InstancedMesh>(null);
  const trainCars = useRef<THREE.InstancedMesh>(null);
  const trainWindows = useRef<THREE.InstancedMesh>(null);
  const scratch = useMemo(() => ({ matrix: new THREE.Matrix4(), quat: new THREE.Quaternion(), pos: new THREE.Vector3(), scale: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0) }), []);

  useGlowScale(useMemo(() => [carGlow.material, signalGlow.material, walkerGlow.material, trainGlow.material], [carGlow, signalGlow, walkerGlow, trainGlow]));

  useEffect(() => {
    const target = bodies.current;
    if (!target) return;
    const color = new THREE.Color();
    for (let i = 0; i < cars; i++) {
      color.set(CAR_BODY_COLORS[(i * 7) % CAR_BODY_COLORS.length] ?? "#222");
      target.setColorAt(i, color);
    }
    if (target.instanceColor) target.instanceColor.needsUpdate = true;
  }, [cars]);

  useLayoutEffect(() => {
    const night = palette.windowsLit;
    carGlow.material.uniforms.uIntensity.value = 0.35 + 0.65 * night;
    signalGlow.material.uniforms.uIntensity.value = 0.35 + 0.35 * night;
    walkerGlow.material.uniforms.uIntensity.value = night;
    trainGlow.material.uniforms.uIntensity.value = 0.4 + 0.6 * night;
    for (const g of [carGlow, signalGlow, walkerGlow, trainGlow]) g.material.uniforms.uFogDensity.value = palette.fogDensity;
    walkerGlow.points.visible = showPedestrians && night > 0;
  }, [palette, carGlow, signalGlow, walkerGlow, trainGlow, showPedestrians]);

  const guideway = useMemo(() => {
    const segments: { x: number; z: number; length: number; angle: number }[] = [];
    const pillars: { x: number; z: number }[] = [];
    trainLoop.forEach((a, i) => {
      const b = trainLoop[(i + 1) % trainLoop.length];
      if (!b) return;
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const length = Math.hypot(dx, dz);
      segments.push({ x: (a.x + b.x) / 2, z: (a.z + b.z) / 2, length, angle: Math.atan2(dx, dz) });
      for (let s = 0; s < length; s += 9) pillars.push({ x: a.x + (dx / length) * s, z: a.z + (dz / length) * s });
    });
    return { segments, pillars };
  }, []);

  useEffect(
    () => () => {
      for (const g of [carGlow, signalGlow, walkerGlow, trainGlow]) {
        g.points.geometry.dispose();
        g.material.dispose();
      }
    },
    [carGlow, signalGlow, walkerGlow, trainGlow],
  );

  useFrame((_, delta) => {
    const dt = animate ? Math.min(delta, 0.1) : 0;
    const { traffic, walkers, train } = sims;
    if (dt > 0) {
      traffic.step(dt);
      if (showPedestrians) walkers.step(dt);
      train.step(dt);
    }

    const { matrix, quat, pos, scale, up } = scratch;
    const p = carGlow.positions;
    const c = carGlow.colors;
    const body = bodies.current;
    for (let i = 0; i < traffic.count; i++) {
      const x = traffic.x[i] ?? 0;
      const z = traffic.z[i] ?? 0;
      const h = traffic.heading[i] ?? 0;
      const fx = Math.sin(h);
      const fz = Math.cos(h);
      const k = i * 6;
      p[k] = x + fx * 0.4;
      p[k + 1] = 0.22;
      p[k + 2] = z + fz * 0.4;
      p[k + 3] = x - fx * 0.4;
      p[k + 4] = 0.22;
      p[k + 5] = z - fz * 0.4;
      const brake = traffic.braking[i] === 1 ? 1 : 0.55;
      c[k] = HEAD.r;
      c[k + 1] = HEAD.g;
      c[k + 2] = HEAD.b;
      c[k + 3] = TAIL.r * brake;
      c[k + 4] = TAIL.g * brake;
      c[k + 5] = TAIL.b * brake;
      if (body) {
        quat.setFromAxisAngle(up, h);
        matrix.compose(pos.set(x, 0.17, z), quat, scale.set(0.42, 0.3, 0.78));
        body.setMatrixAt(i, matrix);
      }
    }
    carGlow.points.geometry.getAttribute("position").needsUpdate = true;
    carGlow.points.geometry.getAttribute("color").needsUpdate = true;
    if (body) body.instanceMatrix.needsUpdate = true;

    const signals = traffic.signals;
    const sp = signalGlow.positions;
    const sc = signalGlow.colors;
    for (let n = 0; n < signals.count; n++) {
      const x = signals.x[n] ?? 0;
      const z = signals.z[n] ?? 0;
      for (let axis = 0; axis < 2; axis++) {
        const light = signals.lights[n * 2 + axis];
        const color = light === LIGHT_GREEN ? SIGNAL_COLORS.green : light === LIGHT_AMBER ? SIGNAL_COLORS.amber : SIGNAL_COLORS.red;
        for (let side = 0; side < 2; side++) {
          const k = (n * 4 + axis * 2 + side) * 3;
          const sign = side === 0 ? 1 : -1;
          sp[k] = x + sign * 2.3;
          sp[k + 1] = 1.5;
          sp[k + 2] = z + (axis === 0 ? -sign : sign) * 2.3;
          sc[k] = color.r;
          sc[k + 1] = color.g;
          sc[k + 2] = color.b;
        }
      }
    }
    signalGlow.points.geometry.getAttribute("position").needsUpdate = true;
    signalGlow.points.geometry.getAttribute("color").needsUpdate = true;

    if (showPedestrians) {
      const wp = walkerGlow.positions;
      const wc = walkerGlow.colors;
      for (let i = 0; i < walkers.count; i++) {
        wp[i * 3] = walkers.x[i] ?? 0;
        wp[i * 3 + 1] = 0.3;
        wp[i * 3 + 2] = walkers.z[i] ?? 0;
        wc[i * 3] = WALKER.r;
        wc[i * 3 + 1] = WALKER.g;
        wc[i * 3 + 2] = WALKER.b;
      }
      walkerGlow.points.geometry.getAttribute("position").needsUpdate = true;
      walkerGlow.points.geometry.getAttribute("color").needsUpdate = true;
    }

    const cars3d = trainCars.current;
    const windows = trainWindows.current;
    for (let i = 0; i < train.x.length; i++) {
      const h = train.heading[i] ?? 0;
      quat.setFromAxisAngle(up, h);
      pos.set(train.x[i] ?? 0, TRAIN_HEIGHT + 0.35, train.z[i] ?? 0);
      matrix.compose(pos, quat, scale.set(0.62, 0.62, 2.2));
      cars3d?.setMatrixAt(i, matrix);
      matrix.compose(pos.setY(TRAIN_HEIGHT + 0.42), quat, scale.set(0.64, 0.16, 2.0));
      windows?.setMatrixAt(i, matrix);
    }
    if (cars3d) cars3d.instanceMatrix.needsUpdate = true;
    if (windows) windows.instanceMatrix.needsUpdate = true;
    const lead = train.heading[0] ?? 0;
    const tp = trainGlow.positions;
    tp[0] = (train.x[0] ?? 0) + Math.sin(lead) * 1.15;
    tp[1] = TRAIN_HEIGHT + 0.3;
    tp[2] = (train.z[0] ?? 0) + Math.cos(lead) * 1.15;
    const last = train.x.length - 1;
    const tail = train.heading[last] ?? 0;
    tp[3] = (train.x[last] ?? 0) - Math.sin(tail) * 1.15;
    tp[4] = TRAIN_HEIGHT + 0.3;
    tp[5] = (train.z[last] ?? 0) - Math.cos(tail) * 1.15;
    trainGlow.colors.set([HEAD.r, HEAD.g, HEAD.b, TAIL.r, TAIL.g, TAIL.b]);
    trainGlow.points.geometry.getAttribute("position").needsUpdate = true;
    trainGlow.points.geometry.getAttribute("color").needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={bodies} args={[undefined, undefined, cars]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial />
      </instancedMesh>
      <primitive object={carGlow.points} />
      <primitive object={signalGlow.points} />
      <primitive object={walkerGlow.points} />
      {guideway.segments.map((s, i) => (
        <mesh key={`g${i}`} position={[s.x, TRAIN_HEIGHT - 0.2, s.z]} rotation-y={s.angle}>
          <boxGeometry args={[1.1, 0.35, s.length + 1.1]} />
          <meshBasicMaterial color={palette.facadeTop} />
        </mesh>
      ))}
      <instancedMesh
        args={[undefined, undefined, guideway.pillars.length]}
        frustumCulled={false}
        ref={(mesh) => {
          if (!mesh) return;
          const m = new THREE.Matrix4();
          guideway.pillars.forEach((pl, i) => mesh.setMatrixAt(i, m.makeScale(0.35, TRAIN_HEIGHT - 0.2, 0.35).setPosition(pl.x, (TRAIN_HEIGHT - 0.2) / 2, pl.z)));
          mesh.instanceMatrix.needsUpdate = true;
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={palette.facade} />
      </instancedMesh>
      <instancedMesh ref={trainCars} args={[undefined, undefined, sims.train.x.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={palette.windowsLit > 0 ? "#4a5562" : "#c9d1d9"} />
      </instancedMesh>
      <instancedMesh ref={trainWindows} args={[undefined, undefined, sims.train.x.length]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={palette.windowsLit > 0 ? "#6fa7c4" : "#2a3644"} toneMapped={false} />
      </instancedMesh>
      <primitive object={trainGlow.points} />
    </group>
  );
}
