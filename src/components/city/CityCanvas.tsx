"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import type { DistrictId } from "@/lib/districts";
import { setCityStatus } from "@/lib/cityStatus";
import { useFlightStatus } from "@/lib/flightStatus";
import type { QualityProfile } from "@/lib/quality";
import type { Theme } from "@/lib/settings";
import { palettes } from "./palette";
import { Scene } from "./Scene";

type CityCanvasProps = {
  district: DistrictId;
  theme: Theme;
  rain: boolean;
  quality: QualityProfile;
  reducedMotion: boolean;
};

function FrameCap({ fps, invalidate }: { fps: number; invalidate: () => void }) {
  useEffect(() => {
    const id = window.setInterval(invalidate, 1000 / fps);
    return () => window.clearInterval(id);
  }, [fps, invalidate]);
  return null;
}

export default function CityCanvas({ district, theme, rain, quality, reducedMotion }: CityCanvasProps) {
  const [ready, setReady] = useState(false);
  const [invalidate, setInvalidate] = useState<(() => void) | null>(null);
  const capped = !reducedMotion && quality.fpsCap !== null;
  const flight = useFlightStatus();

  useEffect(() => {
    if (ready) return;
    const id = window.setTimeout(
      () => setCityStatus({ state: "failed", reason: "the 3D renderer didn't draw a frame within 10 seconds" }),
      10_000,
    );
    return () => window.clearTimeout(id);
  }, [ready]);

  return (
    <div className="city-canvas absolute inset-0" data-ready={ready}>
      <Canvas
        dpr={quality.dpr}
        frameloop={reducedMotion || capped ? "demand" : "always"}
        gl={{ antialias: quality.tier === "high", powerPreference: "high-performance", alpha: false }}
        camera={{ fov: 50, near: 0.5, far: 2000, position: [0, 55, 150] }}
        onCreated={(state) => {
          setInvalidate(() => () => state.invalidate());
          state.gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            setCityStatus({ state: "failed", reason: "the browser dropped the WebGL context (GPU reset or memory pressure)" });
          });
          requestAnimationFrame(() => {
            setReady(true);
            setCityStatus({ state: "ok" });
          });
        }}
        aria-hidden="true"
        tabIndex={-1}
      >
        <Scene
          district={district}
          palette={palettes[theme]}
          density={quality.density}
          rain={rain}
          rainDrops={quality.rainDrops}
          trafficCars={quality.trafficCars}
          deployTarget={flight.state === "flying" ? flight.district : null}
          animate={!reducedMotion}
        />
      </Canvas>
      {capped && invalidate && <FrameCap fps={quality.fpsCap ?? 30} invalidate={invalidate} />}
    </div>
  );
}
