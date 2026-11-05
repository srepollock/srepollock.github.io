"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { districtForPath } from "@/lib/districts";
import { detectTier, qualityProfile, type QualityProfile } from "@/lib/quality";
import { useSettings } from "@/lib/settings";

const CityCanvas = dynamic(() => import("./CityCanvas"), { ssr: false });

type Environment = { webgl: boolean; reducedMotion: boolean; quality: QualityProfile };

let cachedEnvironment: Environment | null = null;

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function readEnvironment(): Environment {
  if (cachedEnvironment) return cachedEnvironment;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const tier = detectTier({
    cores: nav.hardwareConcurrency,
    memoryGb: nav.deviceMemory,
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    viewportWidth: window.innerWidth,
    saveData: nav.connection?.saveData === true,
  });
  cachedEnvironment = {
    webgl: supportsWebGL(),
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    quality: qualityProfile(tier),
  };
  return cachedEnvironment;
}

function subscribeMotion(listener: () => void): () => void {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onChange = () => {
    cachedEnvironment = cachedEnvironment && { ...cachedEnvironment, reducedMotion: query.matches };
    listener();
  };
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function CityBackdrop() {
  const pathname = usePathname();
  const settings = useSettings();
  const environment = useSyncExternalStore(subscribeMotion, readEnvironment, () => null);

  if (!environment || !environment.webgl || !settings.city) return null;

  return (
    <div className="city-layer" data-testid="city-canvas">
      <CityCanvas
        district={districtForPath(pathname)}
        theme={settings.theme}
        rain={settings.rain}
        quality={environment.quality}
        reducedMotion={environment.reducedMotion}
      />
    </div>
  );
}
