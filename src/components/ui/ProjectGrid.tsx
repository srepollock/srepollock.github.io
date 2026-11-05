"use client";

import { useState } from "react";
import { matchesFilter, projects, type ProjectFilter } from "@/data/projects";
import { ProjectCard } from "./ProjectCard";

const filters: readonly { id: ProjectFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open source" },
  { id: "closed", label: "Closed source" },
  { id: "devbox", label: "Developer Box" },
];

export function ProjectGrid() {
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const visible = projects.filter((project) => matchesFilter(project, filter));

  return (
    <div>
      <div role="group" aria-label="Filter projects" className="mb-8 flex flex-wrap gap-2 font-mono text-sm">
        {filters.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={filter === option.id}
            onClick={() => setFilter(option.id)}
            className="rounded-full border border-line bg-surface px-4 py-1.5 text-muted backdrop-blur transition hover:text-ink aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-accent-ink"
          >
            {option.label}
            <span className="ml-2 opacity-60">{projects.filter((p) => matchesFilter(p, option.id)).length}</span>
          </button>
        ))}
      </div>
      <ul className="grid gap-5 md:grid-cols-2" aria-live="polite">
        {visible.map((project) => (
          <li key={project.slug}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </div>
  );
}
