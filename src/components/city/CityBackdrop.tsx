"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { setCityStatus, useCityStatus } from "@/lib/cityStatus";
import { districtForPath } from "@/lib/districts";
import { detectTier, qualityProfile, type QualityProfile } from "@/lib/quality";
import { useSettings } from "@/lib/settings";
import { CityErrorBoundary } from "./CityErrorBoundary";

const CityCanvas = dynamic(() => import("./CityCanvas"), { ssr: false });

type Environment = { webgl: boolean; reducedMotion: boolean; quality: QualityProfile };

let cachedEnvironment: Environment | null = null;

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return gl !== null;
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
  const status = useCityStatus();

  useEffect(() => {
    if (environment && !environment.webgl) setCityStatus({ state: "unsupported" });
  }, [environment]);

  if (!environment || !environment.webgl || !settings.city || status.state === "failed") return null;

  return (
    <div className="city-layer" data-testid="city-canvas">
      <CityErrorBoundary>
        <CityCanvas
          district={districtForPath(pathname)}
          theme={settings.theme}
          rain={settings.rain}
          quality={environment.quality}
          reducedMotion={environment.reducedMotion}
        />
      </CityErrorBoundary>
    </div>
  );
}
