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
        <>
          <p className="mt-2 text-muted">
            Your browser didn&apos;t give this page a WebGL context, so the 3D city can&apos;t render.
          </p>
          {status.detail && (
            <p className="mt-2 break-words font-mono text-xs text-ink" data-testid="webgl-error">
              Browser says: {status.detail}
            </p>
          )}
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted">
            <li>Hardware acceleration is off (Settings → System).</li>
            <li>Chrome disabled WebGL after a GPU crash: fully quit and reopen the browser.</li>
            <li>
              Your GPU or driver is blocklisted: check the WebGL lines in <code className="text-ink">chrome://gpu</code>.
            </li>
            <li>An extension is blocking WebGL: try an incognito window.</li>
          </ul>
        </>
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
