"use client";

import { useEffect, useRef, useState } from "react";
import { useCityStatus } from "@/lib/cityStatus";
import { freeFly, toast } from "@/lib/extras";
import { flyKeys, resetFlyKeys, type Keys } from "@/lib/flyInput";
import { advanceKonami } from "@/lib/konami";
import { useSettings } from "@/lib/settings";

function isTyping(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
}

export function useCanFly(): boolean {
  const settings = useSettings();
  const status = useCityStatus();
  return settings.city && status.state === "ok";
}

function PadButton({ action, label, children }: { action: keyof Keys; label: string; children: string }) {
  const set = (value: boolean) => () => {
    flyKeys[action] = value;
  };
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={set(true)}
      onPointerUp={set(false)}
      onPointerLeave={set(false)}
      onPointerCancel={set(false)}
      className="grid size-12 select-none place-items-center rounded-full border border-line bg-surface-strong font-mono text-lg text-ink active:border-accent active:text-accent"
    >
      {children}
    </button>
  );
}

function FlyOverlay() {
  const [coarse] = useState(() => window.matchMedia("(pointer: coarse)").matches);

  return (
    <>
      <div
        role="status"
        className="panel fixed left-1/2 top-20 z-30 -translate-x-1/2 px-4 py-2 text-center font-mono text-xs text-muted"
        data-testid="fly-hint"
      >
        <span className="text-accent">free-fly</span>{" "}
        {coarse ? "drag to look · pad to move" : "WASD / arrows move · drag to look · E/Q up/down · Shift boost"} · click a
        beacon to land · <kbd className="text-ink">Esc</kbd> exits
      </div>
      {coarse && (
        <div className="fixed bottom-6 left-1/2 z-30 grid -translate-x-1/2 grid-cols-5 items-center gap-2" aria-label="Flight controls">
          <PadButton action="left" label="Move left">◀</PadButton>
          <div className="grid gap-2">
            <PadButton action="forward" label="Move forward">▲</PadButton>
            <PadButton action="back" label="Move back">▼</PadButton>
          </div>
          <PadButton action="right" label="Move right">▶</PadButton>
          <span />
          <div className="grid gap-2">
            <PadButton action="up" label="Climb">⤒</PadButton>
            <PadButton action="down" label="Descend">⤓</PadButton>
          </div>
        </div>
      )}
    </>
  );
}

function ToastView() {
  const current = toast.use();
  useEffect(() => {
    if (!current) return;
    const id = window.setTimeout(() => toast.set(null), 5000);
    return () => window.clearTimeout(id);
  }, [current]);
  if (!current) return null;
  return (
    <div
      key={current.id}
      role="status"
      data-testid="toast"
      className="panel fixed bottom-12 right-4 z-40 max-w-sm px-4 py-3 font-mono text-sm text-ink shadow-lg"
    >
      {current.text}
    </div>
  );
}

export function Extras() {
  const flying = freeFly.use();
  const canFly = useCanFly();
  const konami = useRef(0);

  useEffect(() => {
    document.documentElement.dataset.flying = flying ? "true" : "false";
    if (!flying) resetFlyKeys();
  }, [flying]);

  useEffect(() => {
    if (!canFly && freeFly.get()) freeFly.set(false);
  }, [canFly]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTyping(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      const result = advanceKonami(konami.current, event.key);
      konami.current = result.progress;
      if (result.complete) {
        void import("./whistle").then(({ blowWhistle }) => blowWhistle());
        return;
      }
      if (event.key === "Escape" && freeFly.get()) {
        event.preventDefault();
        freeFly.set(false);
      } else if (event.key.toLowerCase() === "f" && !event.repeat && canFly) {
        event.preventDefault();
        freeFly.set(!freeFly.get());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [canFly]);

  return (
    <>
      {flying && <FlyOverlay />}
      <ToastView />
    </>
  );
}
