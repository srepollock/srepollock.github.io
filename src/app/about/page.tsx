import type { Metadata } from "next";
import { PageIntro } from "@/components/ui/PageIntro";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description: "Background on Spencer Pollock — platform engineer, Developer Box founder, lacrosse referee.",
};

const facts: readonly { label: string; value: string }[] = [
  { label: "Based in", value: site.location },
  { label: "Day job", value: "Senior Product Software Developer, Wolters Kluwer" },
  { label: "Also", value: "Founder, Developer Box Inc." },
  { label: "Education", value: "B.Tech, Computer Systems — BCIT" },
  { label: "Working toward", value: "Engineering leadership; AZ-500 in progress" },
  { label: "Off the clock", value: "Lacrosse referee, hiking, camping, snowboarding, cooking" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-8">
      <article className="panel max-w-3xl p-6 sm:p-10">
        <PageIntro eyebrow="~/about" title="Hi, I'm Spencer." />
        <div className="prose">
          <p>
            I&apos;m a platform engineer in North Vancouver. I care about the hundred small frictions between code and
            production — the build that takes too long, the deploy that&apos;s manual, the runbook that only lives in
            someone&apos;s head — and I&apos;ve spent the last several years removing them for product teams.
          </p>
          <p>
            Right now that&apos;s at Wolters Kluwer, where I run delivery and hybrid-cloud operations for a governance,
            risk and compliance platform. Before that I built a consultancy&apos;s internal platform from nothing at
            Whitecap, and before <em>that</em> I shipped gameplay systems on two mobile games at Night Garden Studios.
            That last one still shows: I can&apos;t build a portfolio site without turning it into a city you fly around.
          </p>
          <p>
            The best platform work is quiet. You notice it because deploys got faster, incidents got rarer, and the team
            stopped having the same conversation every Friday. Increasingly the part I enjoy most is the people side of
            that — writing the standards, aligning engineering with what the business actually needs, and helping other
            engineers do their best work.
          </p>
          <p>
            On the side I run <a href="https://developerbox.ca" rel="noopener">Developer Box Inc.</a>, which is where
            client work and my own products live.
          </p>
          <h2>Off the clock</h2>
          <p>
            I&apos;ve refereed lacrosse for twenty years, at every level. It&apos;s excellent training for incident
            command: make the call quickly, explain it calmly, and never take the shouting personally. When I&apos;m not
            on the floor I&apos;m hiking or camping on the North Shore, snowboarding when there&apos;s snow, or cooking.
          </p>
        </div>
        <dl className="mt-12 grid gap-x-8 gap-y-4 border-t border-line pt-8 sm:grid-cols-[10rem_1fr]">
          {facts.map((fact) => (
            <div key={fact.label} className="contents">
              <dt className="font-mono text-xs uppercase tracking-widest text-subtle sm:pt-1">{fact.label}</dt>
              <dd className="text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </article>
    </div>
  );
}
