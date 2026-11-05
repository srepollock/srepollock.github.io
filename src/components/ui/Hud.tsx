"use client";

import { usePathname } from "next/navigation";
import { districtForPath, districts } from "@/lib/districts";
import { useFlightStatus } from "@/lib/flightStatus";
import { useSettings } from "@/lib/settings";

export function Hud() {
  const pathname = usePathname();
  const settings = useSettings();
  const flight = useFlightStatus();
  const district = districts[districtForPath(pathname)];
  const flying = flight.state === "flying";

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-10 hidden text-right font-mono text-[11px] text-subtle xl:block"
      aria-hidden="true"
    >
      <span className={flying ? "text-amber" : "text-accent"}>●</span>{" "}
      {flying ? `deploying → ${district.id}` : `${district.id} · healthy`} · 49.32°N 123.07°W ·{" "}
      {settings.theme === "dark" ? "dusk" : "overcast"}
      {settings.rain ? " · 100% chance of rain" : ""}
    </div>
  );
}
