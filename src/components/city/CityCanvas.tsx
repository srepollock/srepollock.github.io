"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { adaptQuality, initialAdaptive, levelEffects } from "@/lib/adaptive";
import { districts, type DistrictId } from "@/lib/districts";
import { emitCityEvent, freeFly, showToast } from "@/lib/extras";
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

function AdaptiveMonitor({
  targetFps,
  maxLevel,
  maxDpr,
  onLevel,
}: {
  targetFps: number;
  maxLevel: number;
  maxDpr: number;
  onLevel: (level: number) => void;
}) {
  const setDpr = useThree((state) => state.setDpr);
  const adaptive = useRef(initialAdaptive(maxLevel));
  const sample = useRef({ frames: 0, time: 0, clock: 0 });
  useFrame((_, delta) => {
    const w = sample.current;
    w.frames += 1;
    w.time += delta;
    w.clock += delta;
    if (w.time < 1.5) return;
    const fps = w.frames / w.time;
    w.frames = 0;
    w.time = 0;
    if (document.hidden) return;
    const next = adaptQuality(adaptive.current, fps, targetFps, w.clock);
    const level = Math.min(next.level, maxLevel);
    if (level !== adaptive.current.level) {
      setDpr(Math.max(1, maxDpr * levelEffects(level).dprScale));
      onLevel(level);
    }
    adaptive.current = { ...next, level };
  });
  return null;
}

export default function CityCanvas({ district, theme, rain, quality, reducedMotion }: CityCanvasProps) {
  const [ready, setReady] = useState(false);
  const [invalidate, setInvalidate] = useState<(() => void) | null>(null);
  const capped = !reducedMotion && quality.fpsCap !== null;
  const [pinned] = useState(() => {
    const value = Number(new URLSearchParams(window.location.search).get("city-quality"));
    return Number.isInteger(value) && value >= 0 && value <= 3 && window.location.search.includes("city-quality") ? value : null;
  });
  const [level, setLevel] = useState(pinned ?? quality.maxLevel);
  const effects = levelEffects(level);
  const flight = useFlightStatus();
  const flying = freeFly.use();
  const router = useRouter();

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
        flat
        dpr={quality.dpr}
        frameloop={(reducedMotion && !flying) || capped ? "demand" : "always"}
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
          flying={flying}
          streetCars={Math.round(quality.streetCars * effects.carFraction)}
          pedestrians={effects.pedestrians ? quality.pedestrians : 0}
          bloom={effects.bloom}
          onLandmark={(target) => {
            freeFly.set(false);
            router.push(districts[target].href);
          }}
          onRidge={() => {
            emitCityEvent("shred");
            showToast("🏂 Fresh tracks on the North Shore.");
          }}
        />
        {!reducedMotion && pinned === null && (
          <AdaptiveMonitor targetFps={quality.fpsCap ?? 60} maxLevel={quality.maxLevel} maxDpr={quality.dpr[1]} onLevel={setLevel} />
        )}
      </Canvas>
      {capped && invalidate && <FrameCap fps={quality.fpsCap ?? 30} invalidate={invalidate} />}
    </div>
  );
}
