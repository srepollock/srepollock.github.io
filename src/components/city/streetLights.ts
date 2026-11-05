import { BLOCK, CITY_BOUNDS } from "./generate";

export const LAMP_SPACING = 5;
export const LAMP_OFFSET = 2.2;
export const LAMP_HEIGHT = 1.1;

export function streetLightPositions(): Float32Array {
  const points: number[] = [];
  const { minX, maxX, minZ, maxZ } = CITY_BOUNDS;
  const xs: number[] = [];
  for (let x = minX; x <= maxX + 1e-6; x += BLOCK) xs.push(x);
  const zs: number[] = [];
  for (let z = minZ; z <= maxZ + 1e-6; z += BLOCK) zs.push(z);

  const nearCross = (value: number, lines: readonly number[]) => lines.some((line) => Math.abs(value - line) < LAMP_OFFSET + 0.6);

  for (const z of zs) {
    for (let x = minX; x <= maxX; x += LAMP_SPACING) {
      if (nearCross(x, xs)) continue;
      points.push(x, LAMP_HEIGHT, z - LAMP_OFFSET, x + LAMP_SPACING / 2, LAMP_HEIGHT, z + LAMP_OFFSET);
    }
  }
  for (const x of xs) {
    for (let z = minZ; z <= maxZ; z += LAMP_SPACING) {
      if (nearCross(z, zs)) continue;
      points.push(x - LAMP_OFFSET, LAMP_HEIGHT, z, x + LAMP_OFFSET, LAMP_HEIGHT, z + LAMP_SPACING / 2);
    }
  }
  return Float32Array.from(points);
}
