import { devboxProjectUrl } from "@/lib/devbox";

export type ProjectStatus = "active" | "shipped" | "archived" | "experiment";

type ProjectBase = {
  slug: string;
  title: string;
  pitch: string;
  summary: readonly string[];
  stack: readonly string[];
  status: ProjectStatus;
  years: string;
  featured?: boolean;
};

export type PersonalProject = ProjectBase & {
  kind: "personal";
  visibility: "open" | "closed";
  repoUrl?: string;
  liveUrl?: string;
};

export type DevboxProject = ProjectBase & {
  kind: "devbox";
  devboxPageLive: boolean;
};

export type Project = PersonalProject | DevboxProject;

export type ProjectFilter = "all" | "open" | "closed" | "devbox";

export const projects: readonly Project[] = [
  {
    kind: "personal",
    slug: "power-gauge",
    title: "PowerGauge HUD",
    pitch: "A Windows desktop performance HUD with gauges you can tear off and float anywhere.",
    summary: [
      "Real-time CPU, memory, disk, network and GPU telemetry rendered as switchable SVG power gauges. Any gauge can be torn off into its own frameless window and docked back later; a click-through ghost mode and tray controls keep it out of the way.",
      "Built on Tauri v2 with a Rust core and a React front end, with architecture decisions captured as ADRs and releases shipped as NSIS, MSI and portable builds with published checksums.",
    ],
    stack: ["Rust", "Tauri v2", "React", "TypeScript", "SVG"],
    status: "active",
    years: "2026",
    visibility: "open",
    repoUrl: "https://github.com/srepollock/power-gauge",
    featured: true,
  },
  {
    kind: "personal",
    slug: "ci-toolkit",
    title: "CI Toolkit",
    pitch: "Versioned, reusable GitHub Actions workflows that replaced a dozen drifting copies.",
    summary: [
      "Reusable workflows and composite actions for Node and Python CI, release-please releases, a Dependabot sweep with merge gating, and an AI-assisted PR review step — pinned at @v1 and rolled out across my other projects.",
      "Platform work at hobby scale: the same problem I solve at work, with nobody to blame for the drift but me.",
    ],
    stack: ["GitHub Actions", "Docker", "release-please", "Python", "Node"],
    status: "active",
    years: "2026",
    visibility: "closed",
    featured: true,
  },
  {
    kind: "personal",
    slug: "divine-engine",
    title: "Divine Engine",
    pitch: "A modular TypeScript game engine, built for developers first.",
    summary: [
      "A lightweight, modular engine for building and shipping small web games in a modern TypeScript toolchain — started at BCIT and kept alive for years after.",
      "Where I learned to care about the developer experience of a codebase: conventional commits, automated changelogs, CI and coverage from day one.",
    ],
    stack: ["TypeScript", "Rollup", "Jest", "GitHub Actions"],
    status: "archived",
    years: "2018 – 2023",
    visibility: "open",
    repoUrl: "https://github.com/srepollock/divine-engine",
  },
  {
    kind: "personal",
    slug: "dotfiles",
    title: "dotfiles",
    pitch: "Ten years of machine setup, now including a guard-railed Claude Code configuration.",
    summary: [
      "One install script for Linux, macOS and Windows/WSL. The newest layer syncs Claude Code and MCP configuration across machines, with hooks that block writes to secrets and lockfiles and flag config drift at session start.",
    ],
    stack: ["Bash", "Zsh", "Python", "Make", "Claude Code"],
    status: "active",
    years: "2016 – 2026",
    visibility: "open",
    repoUrl: "https://github.com/srepollock/dotfiles",
  },
  {
    kind: "personal",
    slug: "changelog-generator-action",
    title: "Changelog Generator Action",
    pitch: "A GitHub Action that writes CHANGELOG.md from conventional commit history.",
    summary: [
      "Parses Angular-style commits and commits an updated changelog back to the repo. Small, but it's the first thing I published that other people's pipelines depended on.",
    ],
    stack: ["Python", "GitHub Actions", "Docker"],
    status: "shipped",
    years: "2020 – 2022",
    visibility: "open",
    repoUrl: "https://github.com/srepollock/changelog-generator-action",
  },
  {
    kind: "personal",
    slug: "recipe-retriever",
    title: "Recipe Retriever",
    pitch: "An AI cookbook that pulls recipes out of links, photos and whatever's left in the fridge.",
    summary: [
      "Extracts structured recipes from blogs and video links, remixes them for dietary needs, scales servings, and turns a meal plan into a grocery list.",
      "Generative flows on Firebase, Stripe subscriptions, four languages, and end-to-end tests that mock the AI layer so CI stays deterministic.",
    ],
    stack: ["Next.js", "TypeScript", "Firebase", "Genkit", "Stripe", "Playwright"],
    status: "active",
    years: "2025 – 2026",
    visibility: "closed",
  },
  {
    kind: "personal",
    slug: "hearthwild",
    title: "Hearthwild",
    pitch: "A cozy survival and base-building slice, built to prove the art direction before a Godot port.",
    summary: [
      "Seeded procedural islands, a crafting and building loop, day/night cycle and save backups, shipped as a browser build and an Electron desktop app.",
      "Deliberately throwaway: a decision log tracks every open question for the engine port, with golden-fixture tests to keep behaviour identical on the other side.",
    ],
    stack: ["TypeScript", "Electron", "Vite"],
    status: "experiment",
    years: "2026",
    visibility: "closed",
  },
  {
    kind: "devbox",
    slug: "caravan",
    title: "Caravan",
    pitch: "Group trip planning that keeps working when the signal doesn't.",
    summary: [
      "Itineraries, shared expenses, stays and tasks for everyone on a trip — an installable PWA with an offline write queue, so optimistic updates survive dead zones.",
    ],
    stack: ["Next.js", "TypeScript", "Firestore", "TanStack Query", "PWA", "Playwright"],
    status: "active",
    years: "2026",
    devboxPageLive: false,
    featured: true,
  },
  {
    kind: "devbox",
    slug: "quickbooks-vendor-payments",
    title: "QuickBooks vendor payments",
    pitch: "Turning vendor timesheets and form submissions into QuickBooks payments, without the copy-paste.",
    summary: [
      "A Google Sheets add-on and companion form script that talk to the QuickBooks Online API over OAuth2, so a small business can approve hours and pay vendors from the tools they already use.",
    ],
    stack: ["Google Apps Script", "QuickBooks Online API", "OAuth2"],
    status: "shipped",
    years: "2022",
    devboxPageLive: false,
  },
  {
    kind: "devbox",
    slug: "developer-box-website",
    title: "Developer Box website",
    pitch: "The bilingual company site for Developer Box Inc.",
    summary: ["A single-page React site with i18n, hosted on Firebase."],
    stack: ["React", "TypeScript", "i18next", "Firebase Hosting"],
    status: "active",
    years: "2022 – 2026",
    devboxPageLive: false,
  },
];

export function projectHref(project: Project): string {
  return project.kind === "devbox" ? devboxProjectUrl(project.slug) : `/projects/${project.slug}/`;
}

export function isExternal(project: Project): boolean {
  return project.kind === "devbox";
}

export function matchesFilter(project: Project, filter: ProjectFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "devbox":
      return project.kind === "devbox";
    case "open":
    case "closed":
      return project.kind === "personal" && project.visibility === filter;
  }
}

export function personalProjects(): readonly PersonalProject[] {
  return projects.filter((project): project is PersonalProject => project.kind === "personal");
}

export function getPersonalProject(slug: string): PersonalProject | undefined {
  return personalProjects().find((project) => project.slug === slug);
}
