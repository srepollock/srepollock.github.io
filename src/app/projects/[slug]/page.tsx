import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPersonalProject, personalProjects } from "@/data/projects";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return personalProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const project = getPersonalProject((await params).slug);
  return project ? { title: project.title, description: project.pitch } : {};
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const project = getPersonalProject((await params).slug);
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-8">
      <article className="panel max-w-3xl p-6 sm:p-10">
        <Link href="/projects/" className="font-mono text-sm text-accent link-underline">
          ← cd ..
        </Link>
        <header className="mt-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className={`chip ${project.visibility === "open" ? "border-accent/50 text-accent" : ""}`}>
              {project.visibility === "open" ? "open source" : "closed source"}
            </span>
            <span className="chip">{project.status}</span>
            <span className="chip">{project.years}</span>
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">{project.title}</h1>
          <p className="mt-4 text-xl leading-relaxed text-ink/90">{project.pitch}</p>
        </header>
        <div className="prose mt-8">
          {project.summary.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <ul className="mt-8 flex flex-wrap gap-2" aria-label="Stack">
          {project.stack.map((item) => (
            <li key={item} className="chip">
              {item}
            </li>
          ))}
        </ul>
        {(project.repoUrl ?? project.liveUrl) && (
          <div className="mt-10 flex flex-wrap gap-3 border-t border-line pt-8 font-mono text-sm">
            {project.repoUrl && (
              <a href={project.repoUrl} rel="noopener" className="rounded-full bg-accent px-5 py-2.5 text-accent-ink transition hover:brightness-110">
                View source ↗
              </a>
            )}
            {project.liveUrl && (
              <a href={project.liveUrl} rel="noopener" className="rounded-full border border-line px-5 py-2.5 text-ink transition hover:border-accent">
                Live ↗
              </a>
            )}
          </div>
        )}
        {project.visibility === "closed" && (
          <p className="mt-10 border-t border-line pt-8 font-mono text-sm text-subtle">
            Source is private. Happy to walk through it — <Link href="/contact/" className="link-underline text-accent">get in touch</Link>.
          </p>
        )}
      </article>
    </div>
  );
}
