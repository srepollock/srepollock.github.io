export type Role = {
  company: string;
  companyNote?: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  summary: string;
  highlights: readonly string[];
  stack: readonly string[];
  caseStudies: readonly string[];
};

export const roles: readonly Role[] = [
  {
    company: "Wolters Kluwer",
    companyNote: "formerly StandardFusion — now TeamMate Risk & Compliance",
    title: "Senior Product Software Developer",
    start: "Oct 2022",
    end: "Present",
    location: "Vancouver, BC",
    summary:
      "Run delivery and hybrid-cloud operations for an enterprise governance, risk and compliance SaaS platform with a global, mixed cloud and on-premise customer base.",
    highlights: [
      "Designed a custom CI/CD delivery framework that cut customer deployment times by 40%.",
      "Built security and quality gates into GitHub Actions pipelines — automated scanning and gated releases before anything reaches production.",
      "Operate mission-critical AWS and Azure environments alongside global on-premise deployments.",
      "Containerized application workloads with Docker and own the image build and promotion process.",
      "Primary technical voice for aligning engineering velocity with business goals; wrote the operational and security standards the product scales on.",
    ],
    stack: ["AWS", "Azure", "GitHub Actions", "Docker", "IaC", "Secure SDLC"],
    caseStudies: ["cicd-framework"],
  },
  {
    company: "Whitecap Risk and Safety Consultants",
    title: "Senior Systems Architect",
    start: "Oct 2021",
    end: "Jun 2022",
    summary:
      "Joined a growing consultancy with no internal infrastructure and built all of it — documentation, automation, endpoint management and the backend systems behind day-to-day operations.",
    highlights: [
      "Built the company's backend infrastructure from scratch to production on a tight deadline with conservative requirements.",
      "Automated cross-platform endpoint deployment and management across Windows, macOS and Linux.",
      "Wrote Python services and tooling for logging, notifications, inventory, invoicing, purchasing and safety records.",
      "Started with the wiki — documentation first, then automation anchored to it.",
    ],
    stack: ["Python", "Bash", "PowerShell", "Windows / macOS / Linux"],
    caseStudies: ["whitecap-infrastructure"],
  },
  {
    company: "Night Garden Studios",
    title: "Junior Software Engineer",
    start: "Jun 2020",
    end: "Sep 2021",
    summary:
      "Gameplay and systems engineering in Unity3D and C# across two released mobile titles: Dragon Up Idle Adventure and RuPaul's Drag Race: Superstar.",
    highlights: [
      "Built in-game item management, upgrades and purchasing systems with the design team.",
      "Implemented UI with artists, and extended localization to multi-language support.",
      "Rebuilt analytics hooks and shipped usage dashboards on Firebase, BigQuery and Data Studio.",
    ],
    stack: ["Unity3D", "C#", "Firebase", "BigQuery"],
    caseStudies: [],
  },
  {
    company: "Sony Pictures Imageworks",
    title: "Developer tooling — internships and full-time",
    start: "2016",
    end: "2019",
    summary:
      "Supported 800+ artists across 3,000+ systems. Early developer-experience work, before I knew to call it that.",
    highlights: [
      "Shipped a Python command-line tool for internal operations.",
      "Wrote a git pre-commit hook that cut three steps out of the production engineering team's code review loop.",
    ],
    stack: ["Python", "Git", "Linux"],
    caseStudies: [],
  },
];

export type Education = {
  credential: string;
  school: string;
  years: string;
};

export const education: readonly Education[] = [
  {
    credential: "Bachelor of Technology, Computer Systems",
    school: "British Columbia Institute of Technology",
    years: "2016 – 2019",
  },
  {
    credential: "Diploma, Computer Systems Technology",
    school: "British Columbia Institute of Technology",
    years: "2014 – 2016",
  },
];

export const skills: readonly { group: string; items: readonly string[] }[] = [
  { group: "Delivery", items: ["CI/CD design", "GitHub Actions", "Progressive deployment", "Docker", "Infrastructure as Code"] },
  { group: "Cloud & security", items: ["AWS", "Azure", "Hybrid / on-prem", "Secure SDLC", "Secrets & IAM"] },
  { group: "Languages", items: ["Python", "TypeScript", "C#", "Bash"] },
  { group: "Ways of working", items: ["Technical writing", "Operating standards", "Cross-team delivery", "Mentoring"] },
];
