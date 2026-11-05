import type { Metadata } from "next";
import { PageIntro } from "@/components/ui/PageIntro";
import { site, socialLinks } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Best reached by email. Also on GitHub and LinkedIn.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-8">
      <div className="panel max-w-2xl p-6 sm:p-10">
        <PageIntro eyebrow="~/contact" title="Open a channel.">
          Email is best. I reply to everything — usually within a day or two.
        </PageIntro>
        <a
          href={`mailto:${site.email}`}
          className="inline-block break-all font-mono text-2xl text-accent link-underline sm:text-3xl"
        >
          {site.email}
        </a>
        <section aria-labelledby="elsewhere" className="mt-12 border-t border-line pt-8">
          <h2 id="elsewhere" className="eyebrow mb-4">
            Elsewhere
          </h2>
          <ul className="space-y-3">
            {socialLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} rel="noopener" className="text-ink link-underline">
                  {link.label}
                </a>
                <span className="text-subtle"> — {link.note}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
