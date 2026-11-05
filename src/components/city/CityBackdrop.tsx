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

type Environment = { webgl: boolean; webglError: string | null; reducedMotion: boolean; quality: QualityProfile };

let cachedEnvironment: Environment | null = null;

type WebGLProbe = { ok: boolean; error: string | null };

function probeWebGL(): WebGLProbe {
  const messages: string[] = [];
  try {
    const canvas = document.createElement("canvas");
    // Fired synchronously inside getContext when the browser refuses; statusMessage says why.
    canvas.addEventListener("webglcontextcreationerror", (event) => {
      const message = (event as WebGLContextEvent).statusMessage;
      if (message) messages.push(message);
    });
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return { ok: gl !== null, error: gl ? null : ([...new Set(messages)].join(" / ") || null) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
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
  const probe = probeWebGL();
  cachedEnvironment = {
    webgl: probe.ok,
    webglError: probe.error,
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
    if (environment && !environment.webgl) setCityStatus({ state: "unsupported", detail: environment.webglError });
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
