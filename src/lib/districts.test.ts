import { describe, expect, it } from "vitest";
import { districtForPath, districts, navOrder } from "./districts";

describe("districtForPath", () => {
  it.each([
    ["/", "skyline"],
    ["", "skyline"],
    ["/work/", "work"],
    ["/work/cicd-framework/", "work"],
    ["/projects", "projects"],
    ["/projects/some-thing/", "projects"],
    ["/about/", "about"],
    ["/contact/", "contact"],
    ["/nope/", "skyline"],
  ])("%s → %s", (path, expected) => {
    expect(districtForPath(path)).toBe(expected);
  });

  it("every district's href maps back to itself", () => {
    for (const id of navOrder) {
      expect(districtForPath(districts[id].href)).toBe(id);
    }
  });
});
