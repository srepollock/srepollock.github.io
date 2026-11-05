import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/ui/PageIntro";
import { education, roles, skills } from "@/data/experience";
import { getCaseStudy } from "@/data/work";

export const metadata: Metadata = {
  title: "Work",
  description: "Experience and case studies: CI/CD, hybrid cloud delivery, internal platforms and game systems.",
};

export default function WorkPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-8">
      <div className="panel max-w-3xl p-6 sm:p-10">
        <PageIntro eyebrow="~/work" title="Where I've shipped">
          Seven years across delivery engineering, internal platforms and game systems. The common thread: find the
          friction between code and customers, then remove it — and write down how so it stays removed.
        </PageIntro>

        <ol className="relative space-y-12 border-l border-line pl-6 sm:pl-8">
          {roles.map((role) => (
            <li key={`${role.company}-${role.start}`} className="relative">
              <span aria-hidden="true" className="absolute -left-[31px] top-1.5 size-3 rounded-full border-2 border-accent bg-bg sm:-left-[39px]" />
              <p className="font-mono text-xs text-subtle">
                {role.start} — {role.end}
                {role.location ? ` · ${role.location}` : ""}
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink">{role.title}</h2>
              <p className="text-accent">
                {role.company}
                {role.companyNote && <span className="text-subtle"> · {role.companyNote}</span>}
              </p>
              <p className="mt-3 text-muted">{role.summary}</p>
              <ul className="prose mt-4 !text-base">
                {role.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Stack">
                {role.stack.map((item) => (
                  <li key={item} className="chip">
                    {item}
                  </li>
                ))}
              </ul>
              {role.caseStudies.map((slug) => {
                const study = getCaseStudy(slug);
                return study ? (
                  <Link
                    key={slug}
                    href={`/work/${slug}/`}
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-accent/50 px-4 py-2 font-mono text-sm text-accent transition hover:bg-accent hover:text-accent-ink"
                  >
                    Case study: {study.title} →
                  </Link>
                ) : null;
              })}
            </li>
          ))}
        </ol>

        <section aria-labelledby="skills-heading" className="mt-16 border-t border-line pt-10">
          <h2 id="skills-heading" className="eyebrow mb-6">
            Toolbox
          </h2>
          <dl className="grid gap-6 sm:grid-cols-2">
            {skills.map((group) => (
              <div key={group.group}>
                <dt className="font-display font-semibold text-ink">{group.group}</dt>
                <dd className="mt-1 text-muted">{group.items.join(" · ")}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="education-heading" className="mt-12 border-t border-line pt-10">
          <h2 id="education-heading" className="eyebrow mb-6">
            Education
          </h2>
          <ul className="space-y-4">
            {education.map((item) => (
              <li key={item.credential}>
                <p className="font-display font-semibold text-ink">{item.credential}</p>
                <p className="text-muted">
                  {item.school} · <span className="font-mono text-sm">{item.years}</span>
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
