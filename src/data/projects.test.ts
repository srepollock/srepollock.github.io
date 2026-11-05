import { describe, expect, it } from "vitest";
import { isExternal, matchesFilter, projectHref, projects } from "./projects";

describe("projects data", () => {
  it("has unique slugs", () => {
    const slugs = projects.map((project) => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("only links repos for open-source projects", () => {
    for (const project of projects) {
      if (project.kind === "personal" && project.repoUrl) {
        expect(project.visibility).toBe("open");
        expect(project.repoUrl).toMatch(/^https:\/\/github\.com\//);
      }
    }
  });

  it("routes Developer Box projects to developerbox.ca and personal ones internally", () => {
    for (const project of projects) {
      const href = projectHref(project);
      if (project.kind === "devbox") {
        expect(isExternal(project)).toBe(true);
        expect(href).toBe(`https://developerbox.ca/projects/${project.slug}/`);
      } else {
        expect(href).toBe(`/projects/${project.slug}/`);
      }
    }
  });

  it("filters are exhaustive and disjoint", () => {
    for (const project of projects) {
      const hits = (["open", "closed", "devbox"] as const).filter((f) => matchesFilter(project, f));
      expect(hits).toHaveLength(1);
      expect(matchesFilter(project, "all")).toBe(true);
    }
  });
});
