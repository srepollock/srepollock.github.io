import { describe, expect, it } from "vitest";
import { devboxProjectUrl } from "./devbox";

describe("devboxProjectUrl", () => {
  it("builds a project URL on developerbox.ca", () => {
    expect(devboxProjectUrl("card-magic")).toBe("https://developerbox.ca/projects/card-magic/");
  });

  it.each(["", "Card-Magic", "../etc", "a b", "trailing-"])("rejects %j", (slug) => {
    expect(() => devboxProjectUrl(slug)).toThrow();
  });
});
