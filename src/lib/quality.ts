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
};

export function qualityProfile(tier: QualityTier): QualityProfile {
  return tier === "high"
    ? { tier, dpr: [1, 2], density: 1, fpsCap: null, rainDrops: 2200 }
    : { tier, dpr: [1, 1.5], density: 0.55, fpsCap: 30, rainDrops: 700 };
}
