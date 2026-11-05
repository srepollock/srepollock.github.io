"use client";

import { useState } from "react";
import { useCityStatus } from "@/lib/cityStatus";
import { useSettings } from "@/lib/settings";

export function CityNotice() {
  const status = useCityStatus();
  const settings = useSettings();
  const [dismissed, setDismissed] = useState<string | null>(null);

  if (!settings.city) return null;
  if (status.state !== "unsupported" && status.state !== "failed") return null;
  const key = status.state === "failed" ? `failed:${status.reason}` : "unsupported";
  if (dismissed === key) return null;

  return (
    <div
      role="status"
      data-testid="city-notice"
      className="panel fixed bottom-4 left-4 z-30 max-w-sm p-4 text-sm shadow-lg"
    >
      <p className="font-mono text-xs text-amber">static skyline mode</p>
      {status.state === "unsupported" ? (
        <p className="mt-2 text-muted">
          Your browser isn&apos;t providing WebGL, so the 3D city can&apos;t render. Usually that means hardware
          acceleration is off. In Chrome or Edge, turn on <em>Settings → System → Use graphics acceleration when
          available</em> and reload.
        </p>
      ) : (
        <p className="mt-2 text-muted">
          The 3D city stopped because {status.reason}. Switch the city off and on to retry.
        </p>
      )}
      <button
        type="button"
        onClick={() => setDismissed(key)}
        className="mt-3 font-mono text-xs text-accent link-underline"
      >
        dismiss
      </button>
    </div>
  );
}
