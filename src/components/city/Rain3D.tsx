"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { mulberry32 } from "@/lib/random";
import type { ScenePalette } from "./palette";

type Uniforms = Record<string, THREE.IUniform>;

export const rainVertex = /* glsl */ `
  attribute vec3 aOrigin;
  attribute float aEnd;
  uniform float uTime;
  uniform vec3 uCenter;
  varying float vAlpha;
  void main() {
    float fall = mod(aOrigin.y - uTime * 38.0, 70.0);
    vec3 p = vec3(aOrigin.x + uCenter.x, fall + aEnd * 1.6, aOrigin.z + uCenter.z);
    p.x += aEnd * 0.25;
    vAlpha = aEnd;
    gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
  }
`;

export const rainFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(uColor, 0.08 + vAlpha * 0.32);
  }
`;

export default function Rain({ palette, drops, animate }: { palette: ScenePalette; drops: number; animate: boolean }) {
  const camera = useThree((state) => state.camera);
  const geometry = useMemo(() => {
    const rng = mulberry32(99);
    const origins = new Float32Array(drops * 6);
    const ends = new Float32Array(drops * 2);
    for (let i = 0; i < drops; i++) {
      const x = (rng() - 0.5) * 160;
      const y = rng() * 70;
      const z = (rng() - 0.5) * 160;
      origins.set([x, y, z, x, y, z], i * 6);
      ends.set([0, 1], i * 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(drops * 6), 3));
    g.setAttribute("aOrigin", new THREE.BufferAttribute(origins, 3));
    g.setAttribute("aEnd", new THREE.BufferAttribute(ends, 1));
    return g;
  }, [drops]);
  const uniforms = useMemo<Uniforms>(
    () => ({ uTime: { value: 0 }, uCenter: { value: new THREE.Vector3() }, uColor: { value: new THREE.Color() } }),
    [],
  );
  useLayoutEffect(() => {
    (uniforms.uColor?.value as THREE.Color | undefined)?.set(palette.rain);
  }, [palette, uniforms]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => {
    if (animate && uniforms.uTime) uniforms.uTime.value += delta;
    (uniforms.uCenter?.value as THREE.Vector3).set(camera.position.x, 0, camera.position.z - 40);
  });
  return (
    <lineSegments geometry={geometry} frustumCulled={false}>
      <shaderMaterial vertexShader={rainVertex} fragmentShader={rainFragment} uniforms={uniforms} transparent depthWrite={false} />
    </lineSegments>
  );
}
