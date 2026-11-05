import { districts, type DistrictId } from "@/lib/districts";
import { mulberry32 } from "@/lib/random";

export type Building = {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  seed: number;
  neon: boolean;
};

export type Landmark = {
  district: DistrictId;
  x: number;
  z: number;
  height: number;
  radius: number;
};

export type CityLayout = {
  buildings: Building[];
  landmarks: Landmark[];
};

export const CITY_BOUNDS = { minX: -140, maxX: 140, minZ: -68, maxZ: 96 } as const;
export const WATERLINE_Z = -72;
export const BLOCK = 15;
export const STREET = 4;

const DOWNTOWN = { x: 0, z: -18 };
const PARK = { x: -18, z: 34, radius: 14 };

type Zone = "downtown" | "industrial" | "market" | "residential" | "hill";

function zoneAt(x: number, z: number): Zone {
  const near = (id: DistrictId, radius: number): boolean => {
    const [cx, , cz] = districts[id].center;
    return Math.hypot(x - cx, z - cz) < radius;
  };
  if (near("work", 42)) return "industrial";
  if (near("projects", 40)) return "market";
  if (near("about", 42)) return "residential";
  if (near("contact", 34)) return "hill";
  return "downtown";
}

function heightFor(zone: Zone, x: number, z: number, roll: number): number {
  const fromCore = Math.hypot(x - DOWNTOWN.x, z - DOWNTOWN.z);
  switch (zone) {
    case "industrial":
      return 4 + roll * 9;
    case "residential":
      return 3 + roll * 8;
    case "hill":
      return 3 + roll * 6;
    case "market":
      return 10 + roll * 28;
    case "downtown": {
      const core = Math.exp(-((fromCore / 48) ** 2));
      return 6 + core * (30 + roll * 62) + roll * 10;
    }
  }
}

export function generateCity(seed: number, density: number): CityLayout {
  const rng = mulberry32(seed);
  const buildings: Building[] = [];

  for (let bx = CITY_BOUNDS.minX; bx < CITY_BOUNDS.maxX; bx += BLOCK) {
    for (let bz = CITY_BOUNDS.minZ; bz < CITY_BOUNDS.maxZ; bz += BLOCK) {
      const inner = BLOCK - STREET;
      const split = rng() < 0.55 ? 2 : 1;
      const lot = inner / split;

      for (let ix = 0; ix < split; ix++) {
        for (let iz = 0; iz < split; iz++) {
          const roll = rng();
          const keep = rng();
          const x = bx + STREET / 2 + lot * ix + lot / 2;
          const z = bz + STREET / 2 + lot * iz + lot / 2;

          if (z - lot / 2 < WATERLINE_Z + 2) continue;
          if (Math.hypot(x - PARK.x, z - PARK.z) < PARK.radius) continue;
          if (keep > density) continue;

          const zone = zoneAt(x, z);
          const edgeFade = Math.min(1, (CITY_BOUNDS.maxX - Math.abs(x)) / 30, (CITY_BOUNDS.maxZ - z) / 24);
          if (zone !== "downtown" && rng() < 0.12) continue;

          const footprint = zone === "industrial" ? 0.92 : 0.62 + rng() * 0.3;
          const height = Math.max(2.5, heightFor(zone, x, z, roll) * (0.45 + 0.55 * edgeFade));

          buildings.push({
            x,
            z,
            width: lot * footprint,
            depth: lot * (zone === "industrial" ? 0.8 : 0.62 + rng() * 0.3),
            height,
            seed: rng(),
            neon: (zone === "market" && rng() < 0.45) || (height > 40 && rng() < 0.25),
          });
        }
      }
    }
  }

  const landmarks: Landmark[] = [
    { district: "skyline", x: 2, z: -20, height: 118, radius: 4.2 },
    { district: "work", x: -84, z: -52, height: 38, radius: 3.2 },
    { district: "projects", x: 78, z: 6, height: 64, radius: 3.6 },
    { district: "about", x: -64, z: 46, height: 22, radius: 2.6 },
    { district: "contact", x: 100, z: -64, height: 84, radius: 0.9 },
  ];

  const clear = (b: Building): boolean =>
    landmarks.every((l) => Math.hypot(b.x - l.x, b.z - l.z) > l.radius + Math.max(b.width, b.depth) / 2 + 1.5);

  return { buildings: buildings.filter(clear), landmarks };
}
