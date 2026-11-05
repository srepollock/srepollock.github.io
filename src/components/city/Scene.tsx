"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { DistrictId } from "@/lib/districts";
import { mulberry32 } from "@/lib/random";
import { CameraRig } from "./CameraRig";

const FreeFly = lazy(() => import("./FreeFly"));
const Extras3D = lazy(() => import("./Extras3D"));
const Rain = lazy(() => import("./Rain3D"));
const Traffic = lazy(() => import("./Traffic3D"));
import { BLOCK, CITY_BOUNDS, STREET, WATERLINE_Z, generateCity, type CityLayout } from "./generate";
import type { ScenePalette } from "./palette";
import {
  buildingFragment,
  buildingVertex,
  groundFragment,
  groundVertex,
  skyFragment,
  skyVertex,
  waterFragment,
} from "./shaders";

const CITY_SEED = 604;
const SUN_DIR = new THREE.Vector3(-0.75, 0.06, -0.55);

type SceneProps = {
  district: DistrictId;
  palette: ScenePalette;
  density: number;
  rain: boolean;
  rainDrops: number;
  trafficCars: number;
  deployTarget: DistrictId | null;
  animate: boolean;
  flying: boolean;
  onLandmark: (district: DistrictId) => void;
  onRidge: () => void;
};

type Uniforms = Record<string, THREE.IUniform>;

function fogUniforms(palette: ScenePalette): Uniforms {
  return {
    uFogColor: { value: new THREE.Color(palette.fog) },
    uFogDensity: { value: palette.fogDensity },
  };
}

function applyFog(uniforms: Uniforms, palette: ScenePalette): void {
  (uniforms.uFogColor?.value as THREE.Color).set(palette.fog);
  if (uniforms.uFogDensity) uniforms.uFogDensity.value = palette.fogDensity;
}

function setColor(uniforms: Uniforms, key: string, hex: string): void {
  (uniforms[key]?.value as THREE.Color | undefined)?.set(hex);
}

function Sky({ palette }: { palette: ScenePalette }) {
  const uniforms = useMemo<Uniforms>(
    () => ({
      uTop: { value: new THREE.Color() },
      uMid: { value: new THREE.Color() },
      uHorizon: { value: new THREE.Color() },
      uSun: { value: new THREE.Color() },
      uSunDir: { value: SUN_DIR },
    }),
    [],
  );
  useLayoutEffect(() => {
    setColor(uniforms, "uTop", palette.skyTop);
    setColor(uniforms, "uMid", palette.skyMid);
    setColor(uniforms, "uHorizon", palette.skyHorizon);
    setColor(uniforms, "uSun", palette.sunGlow);
  }, [palette, uniforms]);

  return (
    <mesh renderOrder={-1}>
      <sphereGeometry args={[900, 32, 16]} />
      <shaderMaterial
        vertexShader={skyVertex}
        fragmentShader={skyFragment}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

function ridgeGeometry(z: number, base: number, amplitude: number, seed: number): THREE.BufferGeometry {
  const rng = mulberry32(seed);
  const phases = Array.from({ length: 4 }, () => rng() * Math.PI * 2);
  const segments = 160;
  const width = 1500;
  const positions: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const x = -width / 2 + (width * i) / segments;
    const t = x / 140;
    const n =
      Math.sin(t + (phases[0] ?? 0)) * 0.5 +
      Math.sin(t * 2.3 + (phases[1] ?? 0)) * 0.28 +
      Math.sin(t * 5.1 + (phases[2] ?? 0)) * 0.14 +
      Math.abs(Math.sin(t * 9.7 + (phases[3] ?? 0))) * 0.08;
    const top = base + amplitude * (0.55 + 0.45 * n);
    positions.push(x, -2, z, x, top, z - 30 * Math.abs(n));
    if (i < segments) {
      const a = i * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  return geometry;
}

function Mountains({ palette, onRidge }: { palette: ScenePalette; onRidge?: (event: ThreeEvent<MouseEvent>) => void }) {
  const near = useMemo(() => ridgeGeometry(-300, 30, 95, 11), []);
  const far = useMemo(() => ridgeGeometry(-430, 60, 140, 29), []);
  useEffect(() => () => {
    near.dispose();
    far.dispose();
  }, [near, far]);
  return (
    <group>
      <mesh geometry={far}>
        <meshBasicMaterial color={palette.ridgeFar} fog={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={near} onClick={onRidge}>
        <meshBasicMaterial color={palette.ridgeNear} fog={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Ground({ palette }: { palette: ScenePalette }) {
  const uniforms = useMemo<Uniforms>(
    () => ({
      ...fogUniforms(palette),
      uGround: { value: new THREE.Color() },
      uStreet: { value: new THREE.Color() },
      uBlock: { value: BLOCK },
      uOrigin: { value: new THREE.Vector2(CITY_BOUNDS.minX, CITY_BOUNDS.minZ) },
      uStreetWidth: { value: STREET },
      uLit: { value: 1 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  useLayoutEffect(() => {
    applyFog(uniforms, palette);
    setColor(uniforms, "uGround", palette.ground);
    setColor(uniforms, "uStreet", palette.street);
    if (uniforms.uLit) uniforms.uLit.value = palette.windowsLit;
  }, [palette, uniforms]);

  const depth = 200 - WATERLINE_Z;
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, WATERLINE_Z + depth / 2]}>
      <planeGeometry args={[900, depth]} />
      <shaderMaterial vertexShader={groundVertex} fragmentShader={groundFragment} uniforms={uniforms} />
    </mesh>
  );
}

function Water({ palette, animate }: { palette: ScenePalette; animate: boolean }) {
  const uniforms = useMemo<Uniforms>(
    () => ({
      ...fogUniforms(palette),
      uWater: { value: new THREE.Color() },
      uGlint: { value: new THREE.Color() },
      uTime: { value: 0 },
      uLit: { value: 1 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  useLayoutEffect(() => {
    applyFog(uniforms, palette);
    setColor(uniforms, "uWater", palette.water);
    setColor(uniforms, "uGlint", palette.waterGlint);
    if (uniforms.uLit) uniforms.uLit.value = palette.windowsLit;
  }, [palette, uniforms]);
  useFrame((_, delta) => {
    if (animate && uniforms.uTime) uniforms.uTime.value += delta;
  });
  const depth = 400;
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.4, WATERLINE_Z - depth / 2]}>
      <planeGeometry args={[1600, depth]} />
      <shaderMaterial vertexShader={groundVertex} fragmentShader={waterFragment} uniforms={uniforms} />
    </mesh>
  );
}

function Buildings({ layout, palette, animate }: { layout: CityLayout; palette: ScenePalette; animate: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => {
    const box = new THREE.BoxGeometry(1, 1, 1);
    box.translate(0, 0.5, 0);
    const seeds = new Float32Array(layout.buildings.map((b) => b.seed));
    box.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
    return box;
  }, [layout]);
  const uniforms = useMemo<Uniforms>(
    () => ({
      ...fogUniforms(palette),
      uFacade: { value: new THREE.Color() },
      uFacadeTop: { value: new THREE.Color() },
      uWindow: { value: new THREE.Color() },
      uLit: { value: 1 },
      uAmbient: { value: 0.4 },
      uTime: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useLayoutEffect(() => {
    applyFog(uniforms, palette);
    setColor(uniforms, "uFacade", palette.facade);
    setColor(uniforms, "uFacadeTop", palette.facadeTop);
    setColor(uniforms, "uWindow", palette.window);
    if (uniforms.uLit) uniforms.uLit.value = palette.windowsLit;
    if (uniforms.uAmbient) uniforms.uAmbient.value = palette.ambient;
  }, [palette, uniforms]);

  useLayoutEffect(() => {
    const target = mesh.current;
    if (!target) return;
    const matrix = new THREE.Matrix4();
    layout.buildings.forEach((b, i) => {
      matrix.makeScale(b.width, b.height, b.depth).setPosition(b.x, 0, b.z);
      target.setMatrixAt(i, matrix);
    });
    target.instanceMatrix.needsUpdate = true;
    target.computeBoundingSphere();
  }, [layout]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    if (animate && uniforms.uTime) uniforms.uTime.value += delta;
  });

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, layout.buildings.length]} frustumCulled={false}>
      <shaderMaterial vertexShader={buildingVertex} fragmentShader={buildingFragment} uniforms={uniforms} />
    </instancedMesh>
  );
}

function NeonTrim({ layout, palette }: { layout: CityLayout; palette: ScenePalette }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const lit = useMemo(() => layout.buildings.filter((b) => b.neon), [layout]);
  useLayoutEffect(() => {
    const target = mesh.current;
    if (!target) return;
    const matrix = new THREE.Matrix4();
    lit.forEach((b, i) => {
      matrix.makeScale(b.width + 0.12, 0.28, b.depth + 0.12).setPosition(b.x, b.height - 0.9, b.z);
      target.setMatrixAt(i, matrix);
    });
    target.instanceMatrix.needsUpdate = true;
  }, [lit]);
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, lit.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={palette.neon} toneMapped={false} />
    </instancedMesh>
  );
}

function Landmarks({
  layout,
  palette,
  animate,
  onSelect,
}: {
  layout: CityLayout;
  palette: ScenePalette;
  animate: boolean;
  onSelect?: (district: DistrictId) => void;
}) {
  const beacons = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (!beacons.current) return;
    beacons.current.opacity = animate ? 0.35 + 0.65 * Math.max(0, Math.sin(clock.elapsedTime * 2.4)) : 1;
  });
  return (
    <group>
      {layout.landmarks.map((l) => (
        <group
          key={l.district}
          position={[l.x, 0, l.z]}
          onClick={
            onSelect
              ? (event: ThreeEvent<MouseEvent>) => {
                  if (event.delta > 4) return;
                  event.stopPropagation();
                  onSelect(l.district);
                }
              : undefined
          }
          onPointerOver={onSelect ? () => (document.body.style.cursor = "pointer") : undefined}
          onPointerOut={onSelect ? () => (document.body.style.cursor = "") : undefined}
        >
          {l.district === "contact" ? (
            <mesh position={[0, l.height / 2, 0]}>
              <cylinderGeometry args={[l.radius * 0.35, l.radius * 2.2, l.height, 6, 1, true]} />
              <meshBasicMaterial color={palette.facadeTop} wireframe />
            </mesh>
          ) : (
            <mesh position={[0, l.height / 2, 0]}>
              <cylinderGeometry args={[l.radius * 0.75, l.radius, l.height, 8]} />
              <meshBasicMaterial color={palette.facade} />
            </mesh>
          )}
          <mesh position={[0, l.height - 1.2, 0]}>
            <cylinderGeometry args={[l.radius * 0.82, l.radius * 0.82, 0.4, 16]} />
            <meshBasicMaterial color={palette.neon} toneMapped={false} />
          </mesh>
          <mesh position={[0, l.height + 1.4, 0]}>
            <sphereGeometry args={[0.9, 12, 8]} />
            <meshBasicMaterial ref={l.district === "skyline" ? beacons : undefined} color={palette.beacon} transparent toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}



export function Scene({
  district,
  palette,
  density,
  rain,
  rainDrops,
  trafficCars,
  deployTarget,
  animate,
  flying,
  onLandmark,
  onRidge,
}: SceneProps) {
  const layout = useMemo(() => generateCity(CITY_SEED, density), [density]);
  return (
    <>
      <fogExp2 attach="fog" args={[palette.fog, palette.fogDensity]} />
      <Sky palette={palette} />
      <Mountains
        palette={palette}
        onRidge={
          flying
            ? (event) => {
                if (event.delta > 4) return;
                event.stopPropagation();
                onRidge();
              }
            : undefined
        }
      />
      <Water palette={palette} animate={animate} />
      <Ground palette={palette} />
      <Buildings layout={layout} palette={palette} animate={animate} />
      <NeonTrim layout={layout} palette={palette} />
      <Landmarks layout={layout} palette={palette} animate={animate} onSelect={flying ? onLandmark : undefined} />
      <Suspense fallback={null}>
        <Traffic palette={palette} total={trafficCars} deployTarget={deployTarget} animate={animate} />
      </Suspense>
      {rain && (
        <Suspense fallback={null}>
          <Rain palette={palette} drops={rainDrops} animate={animate} />
        </Suspense>
      )}
      <CameraRig district={district} animate={animate} paused={flying} />
      <Suspense fallback={null}>
        <Extras3D palette={palette} interactive={flying} />
        {flying && <FreeFly layout={layout} />}
      </Suspense>
    </>
  );
}
