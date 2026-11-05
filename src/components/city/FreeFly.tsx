"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { flyKeys, resetFlyKeys } from "@/lib/flyInput";
import { clampPitch, constrain, heightField, keyFor, moveVector, type Vec3 } from "./flyControls";
import type { CityLayout } from "./generate";

const LOOK_SPEED = 0.0035;

function isTyping(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

export default function FreeFly({ layout }: { layout: CityLayout }) {
  const camera = useThree((state) => state.camera);
  const element = useThree((state) => state.gl.domElement);
  const invalidate = useThree((state) => state.invalidate);
  const heightAt = useMemo(() => heightField(layout.buildings), [layout]);
  const look = useRef({ yaw: 0, pitch: 0 });

  useEffect(() => {
    const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, "YXZ");
    look.current = { yaw: euler.y, pitch: clampPitch(euler.x) };

    const onKey = (pressed: boolean) => (event: KeyboardEvent) => {
      if (isTyping(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      const action = keyFor(event.key);
      if (!action) return;
      event.preventDefault();
      flyKeys[action] = pressed;
      invalidate();
    };
    const down = onKey(true);
    const up = onKey(false);

    let dragging: { id: number; x: number; y: number } | null = null;
    const onPointerDown = (event: PointerEvent) => {
      dragging = { id: event.pointerId, x: event.clientX, y: event.clientY };
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging || dragging.id !== event.pointerId) return;
      look.current.yaw -= (event.clientX - dragging.x) * LOOK_SPEED;
      look.current.pitch = clampPitch(look.current.pitch - (event.clientY - dragging.y) * LOOK_SPEED);
      dragging = { ...dragging, x: event.clientX, y: event.clientY };
      invalidate();
    };
    const onPointerUp = (event: PointerEvent) => {
      if (dragging?.id === event.pointerId) dragging = null;
    };
    const onBlur = () => resetFlyKeys();

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", onBlur);
    element.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    element.style.touchAction = "none";
    element.style.cursor = "grab";

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", onBlur);
      element.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      element.style.touchAction = "";
      element.style.cursor = "";
      resetFlyKeys();
    };
  }, [camera, element, invalidate]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const move = moveVector(flyKeys, look.current.yaw, dt);
    const next: Vec3 = constrain(
      [camera.position.x + move[0], camera.position.y + move[1], camera.position.z + move[2]],
      heightAt,
    );
    camera.position.set(...next);
    camera.rotation.set(look.current.pitch, look.current.yaw, 0, "YXZ");
    if (move.some((v) => v !== 0)) invalidate();
  });

  return null;
}
