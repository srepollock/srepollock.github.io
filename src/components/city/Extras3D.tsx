"use client";

import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { cityEvent, showToast } from "@/lib/extras";
import type { ScenePalette } from "./palette";

export const BLAME_TOWER = { x: -12, z: 30, height: 26 } as const;

const blameLines = [
  "git blame: every line of this building — Spencer, 2:13 AM",
  "git blame: the tilt was \"temporary\" (4 years ago)",
  "git blame: fix(tower): stop leaning (it did not stop leaning)",
];

function BlameTower({ palette, interactive }: { palette: ScenePalette; interactive: boolean }) {
  const [clicks, setClicks] = useState(0);
  const onClick = (event: ThreeEvent<MouseEvent>) => {
    if (!interactive || event.delta > 4) return;
    event.stopPropagation();
    showToast(blameLines[clicks % blameLines.length] ?? "");
    setClicks((n) => n + 1);
  };
  return (
    <group position={[BLAME_TOWER.x, 0, BLAME_TOWER.z]} rotation-z={0.06} onClick={onClick}>
      <mesh position={[0, BLAME_TOWER.height / 2, 0]}>
        <boxGeometry args={[4, BLAME_TOWER.height, 4]} />
        <meshBasicMaterial color={palette.facadeTop} />
      </mesh>
      <mesh position={[0, BLAME_TOWER.height - 3, 2.05]}>
        <planeGeometry args={[3.4, 1.2]} />
        <meshBasicMaterial color={palette.window} toneMapped={false} />
      </mesh>
      <mesh position={[0, BLAME_TOWER.height + 0.6, 0]}>
        <boxGeometry args={[4.4, 0.3, 4.4]} />
        <meshBasicMaterial color={palette.window} toneMapped={false} />
      </mesh>
    </group>
  );
}

const RUN_SECONDS = 7;
const TRAIL_POINTS = 260;

function runPath(): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(230, 78, -296),
    new THREE.Vector3(198, 62, -294),
    new THREE.Vector3(170, 47, -292),
    new THREE.Vector3(140, 33, -294),
    new THREE.Vector3(112, 19, -290),
    new THREE.Vector3(84, 6, -288),
  ]);
}

function Snowboarder({ palette }: { palette: ScenePalette }) {
  const event = cityEvent.use();
  const invalidate = useThree((state) => state.invalidate);
  const rider = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => runPath(), []);
  const started = useRef<number | null>(null);
  const trailGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(TRAIL_POINTS * 3), 3));
    geometry.setDrawRange(0, 0);
    return geometry;
  }, []);
  const trailMaterial = useMemo(() => new THREE.PointsMaterial({ fog: false, size: 3, sizeAttenuation: false, toneMapped: false, depthTest: false }), []);
  const trail = useMemo(() => {
    const points = new THREE.Points(trailGeometry, trailMaterial);
    points.frustumCulled = false;
    return points;
  }, [trailGeometry, trailMaterial]);

  useEffect(() => {
    trailMaterial.color.set(palette.neon);
    invalidate();
  }, [palette, trailMaterial, invalidate]);

  useEffect(() => {
    if (event?.kind !== "shred") return;
    started.current = null;
    trailGeometry.setDrawRange(0, 0);
    invalidate();
  }, [event, trailGeometry, invalidate]);

  useEffect(
    () => () => {
      trailGeometry.dispose();
      trailMaterial.dispose();
    },
    [trailGeometry, trailMaterial],
  );

  useFrame(({ clock }) => {
    if (event?.kind !== "shred" || !rider.current) return;
    if (started.current === null) started.current = clock.elapsedTime;
    const t = (clock.elapsedTime - started.current) / RUN_SECONDS;
    if (t > 1.15) {
      rider.current.visible = false;
      return;
    }
    const along = Math.min(1, t);
    const carve = Math.sin(along * Math.PI * 7) * 6;
    const p = curve.getPointAt(along);
    rider.current.visible = true;
    rider.current.position.set(p.x, p.y + 1.5, p.z + carve);
    const samples = Math.max(2, Math.floor(along * TRAIL_POINTS));
    const position = trailGeometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < samples; i++) {
      const at = (i / (samples - 1)) * along;
      const q = curve.getPointAt(at);
      position.setXYZ(i, q.x, q.y + 0.4, q.z + Math.sin(at * Math.PI * 7) * 6);
    }
    position.needsUpdate = true;
    trailGeometry.setDrawRange(0, samples);
    invalidate();
  });

  return (
    <group>
      <mesh ref={rider} visible={false} renderOrder={10}>
        <sphereGeometry args={[4.5, 12, 8]} />
        <meshBasicMaterial color="#ffffff" fog={false} toneMapped={false} depthTest={false} />
      </mesh>
      <primitive object={trail} renderOrder={9} />
    </group>
  );
}

export default function Extras3D({ palette, interactive }: { palette: ScenePalette; interactive: boolean }) {
  return (
    <>
      <BlameTower palette={palette} interactive={interactive} />
      <Snowboarder palette={palette} />
    </>
  );
}
