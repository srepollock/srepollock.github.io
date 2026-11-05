import { describe, expect, it } from "vitest";
import { navOrder } from "@/lib/districts";
import { BLOCK, CITY_BOUNDS, generateCity, WATERLINE_Z } from "./generate";
import { buildRoutes, headsTo, pointAt, spawnCars } from "./traffic";

const onStreet = (value: number, origin: number) => Math.abs((value - origin) / BLOCK - Math.round((value - origin) / BLOCK)) < 1e-9;

describe("traffic routes", () => {
  const routes = buildRoutes();

  it("connects every district", () => {
    const touched = new Set(routes.flatMap((r) => [r.from, r.to]));
    for (const id of navOrder) expect(touched.has(id)).toBe(true);
  });

  it("only uses axis-aligned segments on street centre lines, on land", () => {
    for (const route of routes) {
      for (const p of route.points) {
        expect(p.z).toBeGreaterThan(WATERLINE_Z);
      }
      for (let i = 1; i < route.points.length; i++) {
        const a = route.points[i - 1];
        const b = route.points[i];
        if (!a || !b) throw new Error("missing point");
        expect(a.x === b.x || a.z === b.z).toBe(true);
        if (a.z === b.z) expect(onStreet(a.z, CITY_BOUNDS.minZ)).toBe(true);
        if (a.x === b.x) expect(onStreet(a.x, CITY_BOUNDS.minX)).toBe(true);
      }
    }
  });

  it("never drives through a building", () => {
    const { buildings } = generateCity(604, 1);
    for (const route of routes) {
      for (let s = 0; s < route.length; s += 1) {
        const p = pointAt(route, s, false);
        const hit = buildings.find(
          (b) => Math.abs(p.x - b.x) < b.width / 2 - 0.01 && Math.abs(p.z - b.z) < b.depth / 2 - 0.01,
        );
        expect(hit).toBeUndefined();
      }
    }
  });

  it("walks the polyline from start to end and back", () => {
    const route = routes[0];
    if (!route) throw new Error("no routes");
    const start = route.points[0];
    const end = route.points[route.points.length - 1];
    expect(pointAt(route, 0, false)).toMatchObject({ x: start?.x, z: start?.z });
    const back = pointAt(route, route.length - 1e-6, true);
    expect(back.x).toBeCloseTo(start?.x ?? NaN);
    expect(back.z).toBeCloseTo(start?.z ?? NaN);
    expect(pointAt(route, route.length - 1e-6, false).x).toBeCloseTo(end?.x ?? NaN);
    expect(pointAt(route, route.length - 1e-6, false).z).toBeCloseTo(end?.z ?? NaN);
  });
});

describe("spawnCars", () => {
  it("is deterministic and puts at least two cars on every route", () => {
    const routes = buildRoutes();
    const cars = spawnCars(routes, 200, 7);
    expect(cars).toEqual(spawnCars(routes, 200, 7));
    routes.forEach((_, index) => expect(cars.filter((c) => c.route === index).length).toBeGreaterThanOrEqual(2));
  });

  it("knows which direction heads to a district", () => {
    const route = buildRoutes().find((r) => r.from === "skyline" && r.to === "work");
    if (!route) throw new Error("missing route");
    expect(headsTo(route, true, "work")).toBe(true);
    expect(headsTo(route, false, "skyline")).toBe(true);
    expect(headsTo(route, true, "skyline")).toBe(false);
  });
});

describe("flight lanes", () => {
  it("fly above street level at varied altitudes", () => {
    const altitudes = buildRoutes().map((r) => r.altitude);
    for (const a of altitudes) expect(a).toBeGreaterThanOrEqual(12);
    expect(new Set(altitudes).size).toBeGreaterThan(3);
  });
});
