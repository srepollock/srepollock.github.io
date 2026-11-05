import { describe, expect, it } from "vitest";
import { districts } from "@/lib/districts";
import { arcControl, easeInOutCubic, flightDuration, poseAt } from "./flight";

describe("flight math", () => {
  it("eases from 0 to 1", () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5);
  });

  it("starts and ends on the given poses", () => {
    const from = districts.skyline.camera;
    const to = districts.projects.camera;
    expect(poseAt(from, to, 0)).toEqual(from);
    const end = poseAt(from, to, 1);
    end.position.forEach((v, i) => expect(v).toBeCloseTo(to.position[i] ?? NaN));
    end.target.forEach((v, i) => expect(v).toBeCloseTo(to.target[i] ?? NaN));
  });

  it("arcs above both endpoints so flights clear the rooftops", () => {
    const from = districts.work.camera.position;
    const to = districts.projects.camera.position;
    expect(arcControl(from, to)[1]).toBeGreaterThan(Math.max(from[1], to[1]));
  });

  it("clamps duration between 1.6s and 3.2s", () => {
    expect(flightDuration([0, 0, 0], [1, 0, 0])).toBe(1.6);
    expect(flightDuration([0, 0, 0], [5000, 0, 0])).toBe(3.2);
  });
});
