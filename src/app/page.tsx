import Link from "next/link";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { roles } from "@/data/experience";
import { projects } from "@/data/projects";
import { site } from "@/data/site";

const featured = projects.filter((project) => project.featured).slice(0, 4);
const currentRole = roles[0];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-8">
      <section className="flex min-h-[calc(100dvh-9rem)] flex-col justify-center py-16 text-glow">
        <p className="eyebrow mb-6">
          {site.name} · {site.location}
        </p>
        <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-7xl">
          Platform engineer <span className="text-accent">&amp;</span> builder.
        </h1>
        <p className="mt-8 max-w-2xl text-xl leading-relaxed text-ink/90">
          I build the road between <code className="font-mono text-[0.9em] text-accent">git push</code> and production —
          delivery pipelines, hybrid-cloud infrastructure, and the tooling product teams ship with. After hours I run
          Developer Box Inc. and build things for the fun of it.
        </p>
        <p className="mt-5 max-w-2xl text-lg text-muted">
          Most recently: a delivery framework that cut customer deployment times by{" "}
          <strong className="font-semibold text-amber">40%</strong>.
        </p>
        <div className="mt-10 flex flex-wrap gap-3 font-mono text-sm">
          <Link href="/work/" className="rounded-full bg-accent px-5 py-2.5 font-medium text-accent-ink transition hover:brightness-110">
            See the work →
          </Link>
          <Link href="/projects/" className="rounded-full border border-line bg-surface px-5 py-2.5 text-ink backdrop-blur transition hover:border-accent">
            Browse projects
          </Link>
          <a href={`mailto:${site.email}`} className="rounded-full border border-line bg-surface px-5 py-2.5 text-ink backdrop-blur transition hover:border-accent">
            Say hi
          </a>
        </div>
      </section>

      <section aria-labelledby="now-heading" className="grid gap-5 pb-16 lg:grid-cols-3">
        <h2 id="now-heading" className="sr-only">
          Right now
        </h2>
        {currentRole && (
          <Link href="/work/" className="panel group p-6 transition hover:border-accent/60">
            <p className="eyebrow mb-3">Day job</p>
            <p className="font-display text-xl font-semibold text-ink group-hover:text-accent">{currentRole.title}</p>
            <p className="mt-1 text-muted">{currentRole.company}</p>
            <p className="mt-4 text-sm text-subtle">{currentRole.summary}</p>
          </Link>
        )}
        <a href="https://developerbox.ca" rel="noopener" className="panel group p-6 transition hover:border-amber/60">
          <p className="eyebrow mb-3 !text-amber">Side business</p>
          <p className="font-display text-xl font-semibold text-ink group-hover:text-amber">Developer Box Inc. ↗</p>
          <p className="mt-1 text-muted">Founder</p>
          <p className="mt-4 text-sm text-subtle">
            Client sites, business automation and integrations, and the products I spin up in between.
          </p>
        </a>
        <Link href="/about/" className="panel group p-6 transition hover:border-accent/60">
          <p className="eyebrow mb-3">Off the clock</p>
          <p className="font-display text-xl font-semibold text-ink group-hover:text-accent">Lacrosse referee</p>
          <p className="mt-1 text-muted">20 years and counting</p>
          <p className="mt-4 text-sm text-subtle">Also: hiking, camping, snowboarding and cooking.</p>
        </Link>
      </section>

      <section aria-labelledby="featured-heading" className="pb-24">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 id="featured-heading" className="font-display text-2xl font-semibold text-ink text-glow">
            Things I&apos;ve built
          </h2>
          <Link href="/projects/" className="font-mono text-sm text-accent link-underline">
            all projects →
          </Link>
        </div>
        <ul className="grid gap-5 md:grid-cols-2">
          {featured.map((project) => (
            <li key={project.slug}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
