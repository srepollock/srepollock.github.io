"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export default function Bloom({ strength, threshold }: { strength: number; threshold: number }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const dpr = useThree((state) => state.viewport.dpr);

  const { composer, bloom } = useMemo(() => {
    const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
    const fx = new EffectComposer(gl, target);
    fx.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(256, 256), strength, 0.55, threshold);
    fx.addPass(bloomPass);
    fx.addPass(new OutputPass());
    return { composer: fx, bloom: bloomPass };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);

  useLayoutEffect(() => {
    composer.setPixelRatio(dpr);
    composer.setSize(size.width, size.height);
  }, [composer, size.width, size.height, dpr]);

  useLayoutEffect(() => {
    bloom.strength = strength;
    bloom.threshold = threshold;
  }, [bloom, strength, threshold]);

  useEffect(() => () => composer.dispose(), [composer]);

  useFrame((_, delta) => {
    composer.render(delta);
  }, 1);

  return null;
}
