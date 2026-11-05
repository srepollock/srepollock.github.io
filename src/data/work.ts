export type CaseStudy = {
  slug: string;
  title: string;
  company: string;
  role: string;
  dates: string;
  summary: string;
  stack: readonly string[];
  outcomes: readonly string[];
};

export const caseStudies: readonly CaseStudy[] = [
  {
    slug: "cicd-framework",
    title: "Custom CI/CD delivery framework",
    company: "Wolters Kluwer (via StandardFusion)",
    role: "Senior Product Software Developer",
    dates: "2022 – present",
    summary:
      "A delivery pipeline rebuilt from first principles for a GRC SaaS product running across hybrid cloud and global on-premise installs. Manual releases became automated, gated and progressive — and customer deployment times dropped 40%.",
    stack: ["AWS", "Azure", "Docker", "GitHub Actions", "Infrastructure as Code", "Progressive deployment"],
    outcomes: [
      "40% faster deployments for customers",
      "Manual-error incidents largely disappeared from postmortems",
      "Became the standard operating model for customer rollouts",
      "Scaled across hybrid and on-prem topologies without structural rework",
    ],
  },
  {
    slug: "whitecap-infrastructure",
    title: "Building a company's internal platform from scratch",
    company: "Whitecap Risk and Safety Consultants",
    role: "Senior Systems Architect",
    dates: "2021 – 2022",
    summary:
      "A growing consultancy with zero internal infrastructure — no docs, no automation, no system of record. I built all of it, and started with the wiki.",
    stack: ["Python", "Bash", "PowerShell", "Windows / macOS / Linux", "Internal wiki"],
    outcomes: [
      "Full internal platform running for a 10–30 person team",
      "Consistent cross-platform endpoint automation",
      "A wiki that turned 'how do we do X?' from a conversation into a link",
      "Headcount could grow without the founders becoming a bottleneck",
    ],
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}
