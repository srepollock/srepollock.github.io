import type { Metadata } from "next";
import { PageIntro } from "@/components/ui/PageIntro";
import { ProjectGrid } from "@/components/ui/ProjectGrid";

export const metadata: Metadata = {
  title: "Projects",
  description: "Open- and closed-source side projects, plus work shipped through Developer Box Inc.",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-8">
      <div className="max-w-5xl">
        <div className="panel mb-8 p-6 sm:p-10">
          <PageIntro eyebrow="~/projects" title="Things I build after hours">
            Open-source tools, private side projects, and work shipped through{" "}
            <a href="https://developerbox.ca" rel="noopener" className="link-underline text-amber">
              Developer Box Inc.
            </a>{" "}
            Closed-source projects are described, not linked; Developer Box projects open on developerbox.ca.
          </PageIntro>
        </div>
        <ProjectGrid />
      </div>
    </div>
  );
}
