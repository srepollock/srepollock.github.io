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
    skyTop: "#050a1f",
    skyMid: "#2a1d48",
    skyHorizon: "#e7764a",
    sunGlow: "#ffb06b",
    fog: "#120f22",
    fogDensity: 0.0046,
    facade: "#070b16",
    facadeTop: "#111a2e",
    ground: "#04060b",
    street: "#ffb547",
    water: "#03060f",
    waterGlint: "#ffb06b",
    ridgeNear: "#0b0d1f",
    ridgeFar: "#1b1734",
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
    fog: "#b9c5ce",
    fogDensity: 0.0031,
    facade: "#4d5b69",
    facadeTop: "#7d8c99",
    ground: "#46505a",
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
