import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { caseStudies, getCaseStudy } from "@/data/work";

type MdxModule = { default: ComponentType };

const bodies: Record<string, () => Promise<MdxModule>> = {
  "cicd-framework": () => import("@content/work/cicd-framework.mdx"),
  "whitecap-infrastructure": () => import("@content/work/whitecap-infrastructure.mdx"),
};

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const study = getCaseStudy((await params).slug);
  return study ? { title: study.title, description: study.summary } : {};
}

export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  const load = bodies[slug];
  if (!study || !load) notFound();
  const { default: Body } = await load();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-8">
      <article className="panel max-w-3xl p-6 sm:p-10">
        <Link href="/work/" className="font-mono text-sm text-accent link-underline">
          ← cd ..
        </Link>
        <header className="mt-6 border-b border-line pb-8">
          <p className="eyebrow mb-3">
            {study.company} · {study.dates}
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{study.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">{study.summary}</p>
          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="eyebrow mb-2">Outcomes</dt>
              <dd>
                <ul className="prose !text-base">
                  {study.outcomes.map((outcome) => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt className="eyebrow mb-2">Stack</dt>
              <dd className="flex flex-wrap gap-2">
                {study.stack.map((item) => (
                  <span key={item} className="chip">
                    {item}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </header>
        <div className="prose mt-4">
          <Body />
        </div>
      </article>
    </div>
  );
}
