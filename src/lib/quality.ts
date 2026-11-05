export type QualityTier = "high" | "low";

export type DeviceSignals = {
  cores?: number;
  memoryGb?: number;
  coarsePointer: boolean;
  viewportWidth: number;
  saveData: boolean;
};

export function detectTier(signals: DeviceSignals): QualityTier {
  if (signals.saveData) return "low";
  if (signals.coarsePointer || signals.viewportWidth < 768) return "low";
  if (signals.cores !== undefined && signals.cores <= 4) return "low";
  if (signals.memoryGb !== undefined && signals.memoryGb <= 4) return "low";
  return "high";
}

export type QualityProfile = {
  tier: QualityTier;
  dpr: [number, number];
  density: number;
  fpsCap: number | null;
  rainDrops: number;
  trafficCars: number;
  streetCars: number;
  pedestrians: number;
  maxLevel: number;
};

export function qualityProfile(tier: QualityTier): QualityProfile {
  return tier === "high"
    ? { tier, dpr: [1, 2], density: 1, fpsCap: null, rainDrops: 2200, trafficCars: 110, streetCars: 700, pedestrians: 500, maxLevel: 3 }
    : { tier, dpr: [1, 1.5], density: 0.55, fpsCap: 30, rainDrops: 700, trafficCars: 50, streetCars: 260, pedestrians: 160, maxLevel: 2 };
}
