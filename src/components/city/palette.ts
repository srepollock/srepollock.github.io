import type { Theme } from "@/lib/settings";

export type ScenePalette = {
  skyTop: string;
  skyMid: string;
  skyHorizon: string;
  sunGlow: string;
  fog: string;
  fogDensity: number;
  facade: string;
  facadeTop: string;
  ground: string;
  street: string;
  water: string;
  waterGlint: string;
  ridgeNear: string;
  ridgeFar: string;
  window: string;
  neon: string;
  beacon: string;
  rain: string;
  windowsLit: number;
  ambient: number;
};

export const palettes: Readonly<Record<Theme, ScenePalette>> = {
  dark: {
    skyTop: "#0a1130",
    skyMid: "#43295c",
    skyHorizon: "#f0875a",
    sunGlow: "#ffb06b",
    fog: "#2b2140",
    fogDensity: 0.0052,
    facade: "#0d1426",
    facadeTop: "#1b2540",
    ground: "#070a12",
    street: "#ffb547",
    water: "#060b18",
    waterGlint: "#ffb06b",
    ridgeNear: "#121630",
    ridgeFar: "#2a2449",
    window: "#ffb547",
    neon: "#3ee6d8",
    beacon: "#ff4d5e",
    rain: "#9fb6d9",
    windowsLit: 1,
    ambient: 0.35,
  },
  light: {
    skyTop: "#7f97ab",
    skyMid: "#aebfcb",
    skyHorizon: "#e2e8eb",
    sunGlow: "#f4f1e6",
    fog: "#c4cfd7",
    fogDensity: 0.005,
    facade: "#6f8091",
    facadeTop: "#9aa9b6",
    ground: "#5a6672",
    street: "#e8edf0",
    water: "#5c7385",
    waterGlint: "#e8eef2",
    ridgeNear: "#5d6f7f",
    ridgeFar: "#8c9eac",
    window: "#cfe3ee",
    neon: "#0fb3a8",
    beacon: "#e5484d",
    rain: "#58697a",
    windowsLit: 0,
    ambient: 0.9,
  },
};
