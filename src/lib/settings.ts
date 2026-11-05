"use client";

import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

export type Settings = {
  theme: Theme;
  city: boolean;
  rain: boolean;
};

const STORAGE_KEY = "sp:settings";

const serverSnapshot: Settings = { theme: "dark", city: true, rain: false };

let current: Settings | null = null;
const listeners = new Set<() => void>();

function readStored(): Partial<Settings> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const record = parsed as Record<string, unknown>;
    const result: Partial<Settings> = {};
    if (record.theme === "dark" || record.theme === "light") result.theme = record.theme;
    if (typeof record.city === "boolean") result.city = record.city;
    if (typeof record.rain === "boolean") result.rain = record.rain;
    return result;
  } catch {
    return {};
  }
}

function initial(): Settings {
  const stored = readStored();
  const attr = document.documentElement.dataset.theme;
  const theme: Theme = stored.theme ?? (attr === "light" ? "light" : "dark");
  return { theme, city: stored.city ?? true, rain: stored.rain ?? false };
}

function getSnapshot(): Settings {
  if (current === null) current = initial();
  return current;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function updateSettings(patch: Partial<Settings>): void {
  const next = { ...getSnapshot(), ...patch };
  current = next;
  document.documentElement.dataset.theme = next.theme;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable (private mode, blocked): settings still apply for this page view
  }
  listeners.forEach((listener) => listener());
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
}

export const themeInitScript = `(function(){try{var s=JSON.parse(localStorage.getItem("${STORAGE_KEY}")||"{}");var t=s.theme==="light"||s.theme==="dark"?s.theme:(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="dark";}})();`;
