"use client";

import { useCityStatus } from "@/lib/cityStatus";
import { useSettings } from "@/lib/settings";

export function RainOverlay() {
  const settings = useSettings();
  const status = useCityStatus();
  const threeDRaining = settings.city && status.state === "ok";
  if (!settings.rain || threeDRaining) return null;
  return <div className="css-rain" aria-hidden="true" data-testid="css-rain" />;
}
