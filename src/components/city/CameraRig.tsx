"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { districts, type DistrictId } from "@/lib/districts";
import { setFlightStatus } from "@/lib/flightStatus";
import { flightDuration, poseAt, type Pose } from "./flight";

type Flight = { from: Pose; to: Pose; elapsed: number; duration: number };

const lookTarget = new THREE.Vector3();

function framingOffset(district: DistrictId, width: number): number {
  if (district === "skyline" || width < 1024) return 0;
  return -7;
}

export function CameraRig({ district, animate, paused }: { district: DistrictId; animate: boolean; paused: boolean }) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);
  const current = useRef<Pose>(districts[district].camera);
  const flight = useRef<Flight | null>(null);
  const first = useRef(true);
  const wasPaused = useRef(paused);
  const sway = useRef(0);

  useLayoutEffect(() => {
    if (paused) {
      wasPaused.current = true;
      flight.current = null;
      camera.filmOffset = 0;
      camera.updateProjectionMatrix();
      return;
    }
    const destination = districts[district].camera;
    if (wasPaused.current) {
      wasPaused.current = false;
      const ahead = new THREE.Vector3(0, 0, -60).applyQuaternion(camera.quaternion).add(camera.position);
      const from: Pose = { position: [camera.position.x, camera.position.y, camera.position.z], target: [ahead.x, ahead.y, ahead.z] };
      current.current = from;
      if (!animate) {
        current.current = destination;
        camera.position.set(...destination.position);
        camera.lookAt(lookTarget.set(...destination.target));
        invalidate();
        return;
      }
      sway.current = 0;
      flight.current = { from, to: destination, elapsed: 0, duration: flightDuration(from.position, destination.position) };
      setFlightStatus({ state: "flying", district });
      invalidate();
      return;
    }
    if (first.current || !animate) {
      first.current = false;
      flight.current = null;
      current.current = destination;
      camera.position.set(...destination.position);
      camera.lookAt(lookTarget.set(...destination.target));
      camera.filmOffset = framingOffset(district, size.width);
      camera.updateProjectionMatrix();
      setFlightStatus({ state: "idle", district });
      invalidate();
      return;
    }
    const from: Pose = {
      position: [camera.position.x, camera.position.y, camera.position.z],
      target: current.current.target,
    };
    sway.current = 0;
    flight.current = { from, to: destination, elapsed: 0, duration: flightDuration(from.position, destination.position) };
    setFlightStatus({ state: "flying", district });
    invalidate();
  }, [district, animate, paused, camera, invalidate, size.width]);

  useEffect(() => () => setFlightStatus({ state: "idle", district: null }), []);

  useFrame((state, delta) => {
    if (paused) return;
    const active = flight.current;
    const goalOffset = framingOffset(district, size.width);
    if (Math.abs(camera.filmOffset - goalOffset) > 0.01) {
      camera.filmOffset += (goalOffset - camera.filmOffset) * Math.min(1, delta * 2.5);
      camera.updateProjectionMatrix();
    }

    if (active) {
      active.elapsed += Math.min(delta, 0.1);
      const progress = active.elapsed / active.duration;
      const pose = poseAt(active.from, active.to, progress);
      current.current = pose;
      camera.position.set(...pose.position);
      camera.lookAt(lookTarget.set(...pose.target));
      if (progress >= 1) {
        flight.current = null;
        current.current = active.to;
        setFlightStatus({ state: "idle", district });
      }
      invalidate();
      return;
    }

    if (!animate) return;
    const t = state.clock.elapsedTime;
    const base = current.current;
    sway.current = Math.min(1, sway.current + delta / 2);
    const weight = sway.current * sway.current * (3 - 2 * sway.current);
    camera.position.set(
      base.position[0] + Math.sin(t * 0.11) * 2.2 * weight,
      base.position[1] + Math.sin(t * 0.17) * 0.8 * weight,
      base.position[2],
    );
    camera.lookAt(lookTarget.set(...base.target));
  });

  return null;
}
