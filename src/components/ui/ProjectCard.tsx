import Link from "next/link";
import { isExternal, projectHref, type Project } from "@/data/projects";

const statusLabel: Record<Project["status"], string> = {
  active: "active",
  shipped: "shipped",
  archived: "archived",
  experiment: "experiment",
};

function visibilityLabel(project: Project): string {
  if (project.kind === "devbox") return "Developer Box";
  return project.visibility === "open" ? "open source" : "closed source";
}

export function ProjectCard({ project }: { project: Project }) {
  const href = projectHref(project);
  const external = isExternal(project);
  const comingSoon = project.kind === "devbox" && !project.devboxPageLive;

  const body = (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={`chip ${project.kind === "devbox" ? "border-amber/50 text-amber" : project.visibility === "open" ? "border-accent/50 text-accent" : ""}`}>
          {visibilityLabel(project)}
        </span>
        <span className="chip">{statusLabel[project.status]}</span>
        <span className="chip">{project.years}</span>
      </div>
      <h3 className="font-display text-xl font-semibold text-ink transition group-hover:text-accent">
        {project.title}
        {external && (
          <span aria-hidden="true" className="ml-1 inline-block transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            ↗
          </span>
        )}
      </h3>
      <p className="mt-2 text-muted">{project.pitch}</p>
      <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-subtle" aria-label="Stack">
        {project.stack.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {comingSoon && (
        <p className="mt-4 font-mono text-[11px] text-amber">case study on developerbox.ca — coming soon</p>
      )}
      {external && <span className="sr-only"> (opens developerbox.ca)</span>}
    </>
  );

  const className = "panel group block h-full p-6 transition hover:border-accent/60";

  return external ? (
    <a href={href} className={className} rel="noopener" data-devbox-link={project.slug}>
      {body}
    </a>
  ) : (
    <Link href={href} className={className}>
      {body}
    </Link>
  );
}
