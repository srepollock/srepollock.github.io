import { mulberry32 } from "@/lib/random";
import type { Building } from "./generate";

export type FacadeStyle = 0 | 1 | 2 | 3;

export const FACADE = { glass: 0, punched: 1, fins: 2, bands: 3 } as const;

export type Part = {
  x: number;
  z: number;
  y0: number;
  width: number;
  depth: number;
  height: number;
  seed: number;
  style: FacadeStyle;
};

export type RoofUnit = { x: number; z: number; y: number; width: number; depth: number; height: number };

export type AviationLight = { x: number; y: number; z: number };

export type NeonTrim = { x: number; z: number; y: number; width: number; depth: number };

export type Massing = {
  parts: Part[];
  roofUnits: RoofUnit[];
  aviationLights: AviationLight[];
  neonTrims: NeonTrim[];
};

function styleFor(building: Building, roll: number): FacadeStyle {
  if (building.height > 38) return roll < 0.75 ? FACADE.glass : FACADE.fins;
  if (building.height > 16) {
    if (roll < 0.4) return FACADE.glass;
    if (roll < 0.7) return FACADE.punched;
    return roll < 0.85 ? FACADE.fins : FACADE.bands;
  }
  return roll < 0.55 ? FACADE.bands : FACADE.punched;
}

export function massBuilding(building: Building, rng: () => number): Massing {
  const parts: Part[] = [];
  const roofUnits: RoofUnit[] = [];
  const aviationLights: AviationLight[] = [];
  const neonTrims: NeonTrim[] = [];
  const style = styleFor(building, rng());
  const total = building.height;

  const add = (width: number, depth: number, y0: number, height: number, partStyle: FacadeStyle, dx = 0, dz = 0) => {
    parts.push({ x: building.x + dx, z: building.z + dz, y0, width, depth, height, seed: rng(), style: partStyle });
  };

  if (total < 12) {
    add(building.width, building.depth, 0, total, style);
  } else if (total < 38) {
    const podium = rng() < 0.6 ? 3 + rng() * 4 : 0;
    if (podium > 0) {
      add(building.width, building.depth, 0, podium, FACADE.punched);
      const scale = 0.68 + rng() * 0.2;
      add(building.width * scale, building.depth * scale, podium, total - podium, style);
    } else {
      add(building.width, building.depth, 0, total, style);
    }
  } else {
    const podium = 4 + rng() * 5;
    add(building.width, building.depth, 0, podium, FACADE.punched);
    let width = building.width * (0.72 + rng() * 0.15);
    let depth = building.depth * (0.72 + rng() * 0.15);
    const crowns = rng() < 0.55 ? 2 : 1;
    const shaft = (total - podium) * (crowns === 2 ? 0.72 : 0.84);
    add(width, depth, podium, shaft, style);
    let y = podium + shaft;
    const remaining = total - y;
    for (let i = 0; i < crowns; i++) {
      width *= 0.72 + rng() * 0.12;
      depth *= 0.72 + rng() * 0.12;
      const h = i === crowns - 1 ? total - y : remaining * (0.55 + rng() * 0.15);
      add(width, depth, y, h, style);
      y += h;
    }
  }

  const top = parts[parts.length - 1];
  if (top && building.neon) {
    neonTrims.push({ x: top.x, z: top.z, y: top.y0 + top.height - 0.9, width: top.width + 0.12, depth: top.depth + 0.12 });
  }
  if (top && top.height > 0) {
    const units = total < 12 ? (rng() < 0.5 ? 1 : 0) : 1 + Math.floor(rng() * 3);
    for (let i = 0; i < units; i++) {
      const w = Math.min(top.width * 0.4, 0.6 + rng() * 1.1);
      const d = Math.min(top.depth * 0.4, 0.6 + rng() * 1.1);
      roofUnits.push({
        x: top.x + (rng() - 0.5) * (top.width - w) * 0.8,
        z: top.z + (rng() - 0.5) * (top.depth - d) * 0.8,
        y: top.y0 + top.height,
        width: w,
        depth: d,
        height: 0.4 + rng() * 0.9,
      });
    }
    if (total > 34) {
      const hx = top.width / 2 - 0.2;
      const hz = top.depth / 2 - 0.2;
      for (const [sx, sz] of [[1, 1], [-1, -1]] as const) {
        aviationLights.push({ x: top.x + sx * hx, y: top.y0 + top.height + 0.3, z: top.z + sz * hz });
      }
    }
  }

  return { parts, roofUnits, aviationLights, neonTrims };
}

export function massCity(buildings: readonly Building[], seed: number): Massing {
  const rng = mulberry32(seed);
  const result: Massing = { parts: [], roofUnits: [], aviationLights: [], neonTrims: [] };
  for (const building of buildings) {
    const m = massBuilding(building, rng);
    result.parts.push(...m.parts);
    result.roofUnits.push(...m.roofUnits);
    result.aviationLights.push(...m.aviationLights);
    result.neonTrims.push(...m.neonTrims);
  }
  return result;
}
