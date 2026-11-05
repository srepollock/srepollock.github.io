import { roles } from "@/data/experience";
import { projectHref, projects } from "@/data/projects";
import { site, socialLinks } from "@/data/site";
import { districts, navOrder, type DistrictId } from "./districts";
import type { Settings } from "./settings";

export type Line = { kind: "out" | "err" | "ok" | "muted"; text: string };

export type Effect =
  | { type: "navigate"; href: string }
  | { type: "external"; href: string }
  | { type: "settings"; patch: Partial<Settings> }
  | { type: "clear" }
  | { type: "close" }
  | { type: "fly" }
  | { type: "shred" };

export type CommandResult = { lines: Line[]; effects: Effect[] };

export type TerminalContext = { district: DistrictId; settings: Settings };

type Command = {
  name: string;
  usage: string;
  summary: string;
  run: (args: string[], context: TerminalContext) => CommandResult;
  complete?: (partial: string) => string[];
};

const out = (text: string): Line => ({ kind: "out", text });
const ok = (text: string): Line => ({ kind: "ok", text });
const err = (text: string): Line => ({ kind: "err", text });
const muted = (text: string): Line => ({ kind: "muted", text });
const result = (lines: Line[], effects: Effect[] = []): CommandResult => ({ lines, effects });

const districtAliases: Readonly<Record<string, DistrictId>> = {
  "~": "skyline",
  "/": "skyline",
  home: "skyline",
  skyline: "skyline",
  work: "work",
  projects: "projects",
  about: "about",
  contact: "contact",
};

const districtNames = ["~", ...navOrder.filter((id) => id !== "skyline")];

function resolveDistrict(target: string | undefined, from: DistrictId): DistrictId | null {
  if (target === undefined || target === "") return "skyline";
  const trimmed = target.replace(/\/+$/, "");
  if (trimmed === ".." || trimmed === "~/..") return from === "skyline" ? null : "skyline";
  const cleaned = trimmed.replace(/^\.\//, "").replace(/^~\//, "") || "~";
  return districtAliases[cleaned] ?? null;
}

function parseToggle(value: string | undefined, current: boolean): boolean | null {
  if (value === undefined || value === "toggle") return !current;
  if (["on", "true", "1", "yes"].includes(value)) return true;
  if (["off", "false", "0", "no"].includes(value)) return false;
  return null;
}

function toggleCommand(name: "rain" | "city", label: string): Command {
  return {
    name,
    usage: `${name} [on|off]`,
    summary: `Toggle the ${label}`,
    complete: (partial) => ["on", "off"].filter((v) => v.startsWith(partial)),
    run: ([value], { settings }) => {
      const next = parseToggle(value, settings[name]);
      if (next === null) return result([err(`usage: ${name} [on|off]`)]);
      return result([ok(`${label}: ${next ? "on" : "off"}`)], [{ type: "settings", patch: { [name]: next } }]);
    },
  };
}

const commands: Command[] = [
  {
    name: "help",
    usage: "help",
    summary: "List commands",
    run: () =>
      result([
        out("Available commands:"),
        ...commands.map((c) => out(`  ${c.usage.padEnd(22)} ${c.summary}`)),
        muted("Tab completes, ↑/↓ walks history, Esc closes."),
      ]),
  },
  {
    name: "cd",
    usage: "cd <district>",
    summary: "Fly to a district",
    complete: (partial) => districtNames.filter((d) => d.startsWith(partial)),
    run: ([target], { district }) => {
      const destination = resolveDistrict(target, district);
      if (!destination) return result([err(`cd: no such district: ${target ?? ""}`)]);
      if (destination === district) return result([muted(`already in ${districts[destination].label.toLowerCase()}`)]);
      return result([muted(`→ ${districts[destination].href}`)], [{ type: "navigate", href: districts[destination].href }, { type: "close" }]);
    },
  },
  {
    name: "ls",
    usage: "ls [projects]",
    summary: "List districts or projects",
    complete: (partial) => ["projects"].filter((v) => v.startsWith(partial)),
    run: ([target], { district }) => {
      if (target === "projects" || (target === undefined && district === "projects")) {
        return result(
          projects.map((p) => {
            const tag = p.kind === "devbox" ? "devbox" : p.visibility;
            return out(`${tag.padEnd(7)} ${p.slug}`);
          }),
        );
      }
      if (target !== undefined) return result([err(`ls: cannot access '${target}'`)]);
      return result(navOrder.map((id) => out(`${id === district ? "*" : " "} ${id === "skyline" ? "~" : id}/`)));
    },
  },
  {
    name: "open",
    usage: "open <project>",
    summary: "Open a project",
    complete: (partial) => projects.map((p) => p.slug).filter((s) => s.startsWith(partial)),
    run: ([slug]) => {
      const project = projects.find((p) => p.slug === slug);
      if (!project) return result([err(`open: unknown project: ${slug ?? ""}`), muted("try `ls projects`")]);
      const href = projectHref(project);
      return project.kind === "devbox"
        ? result([muted(`→ ${href}`)], [{ type: "external", href }])
        : result([muted(`→ ${href}`)], [{ type: "navigate", href }, { type: "close" }]);
    },
  },
  {
    name: "deploy",
    usage: "deploy [district]",
    summary: "Ship yourself to a district",
    complete: (partial) => districtNames.filter((d) => d.startsWith(partial)),
    run: ([target], { district }) => {
      const destination = target === undefined ? "skyline" : resolveDistrict(target, district);
      if (!destination) return result([err(`deploy: unknown environment: ${target}`)]);
      const name = destination === "skyline" ? "~" : destination;
      return result(
        [
          muted(`$ git push origin ${name}`),
          ok("✓ build   (0.8s)"),
          ok("✓ test    (38 passed)"),
          ok("✓ scan    (0 findings)"),
          out(`→ promoting to ${name}…`),
        ],
        destination === district ? [] : [{ type: "navigate", href: districts[destination].href }],
      );
    },
  },
  {
    name: "whoami",
    usage: "whoami",
    summary: "Who runs this place",
    run: () => {
      const current = roles[0];
      return result([
        out(`${site.name} — ${site.title}`),
        out(current ? `${current.title} @ ${current.company}` : ""),
        out(`Founder, Developer Box Inc. · ${site.location}`),
      ]);
    },
  },
  {
    name: "cat",
    usage: "cat resume",
    summary: "Print the short version",
    complete: (partial) => ["resume"].filter((v) => v.startsWith(partial)),
    run: ([file]) => {
      if (file !== "resume" && file !== "resume.md") return result([err(`cat: ${file ?? ""}: No such file`)]);
      return result([
        ...roles.map((r) => out(`${`${r.start}–${r.end}`.padEnd(18)} ${r.title}, ${r.company}`)),
        muted("full version: cd work"),
      ]);
    },
  },
  {
    name: "contact",
    usage: "contact",
    summary: "Ways to reach me",
    run: () =>
      result([out(`email     ${site.email}`), ...socialLinks.map((l) => out(`${l.label.toLowerCase().padEnd(9)} ${l.href}`))]),
  },
  {
    name: "theme",
    usage: "theme [dark|light]",
    summary: "Dusk or overcast day",
    complete: (partial) => ["dark", "light"].filter((v) => v.startsWith(partial)),
    run: ([value], { settings }) => {
      const next = value === undefined || value === "toggle" ? (settings.theme === "dark" ? "light" : "dark") : value;
      if (next !== "dark" && next !== "light") return result([err("usage: theme [dark|light]")]);
      return result([ok(`theme: ${next === "dark" ? "dusk" : "overcast"}`)], [{ type: "settings", patch: { theme: next } }]);
    },
  },
  toggleCommand("rain", "rain"),
  toggleCommand("city", "city"),
  {
    name: "fly",
    usage: "fly",
    summary: "Take the controls (or press F)",
    run: () => result([muted("free-fly engaged — Esc to land")], [{ type: "fly" }, { type: "close" }]),
  },
  {
    name: "clear",
    usage: "clear",
    summary: "Clear the screen",
    run: () => result([], [{ type: "clear" }]),
  },
  {
    name: "exit",
    usage: "exit",
    summary: "Close the terminal",
    run: () => result([], [{ type: "close" }]),
  },
];

const hidden: Readonly<Record<string, (context: TerminalContext) => CommandResult>> = {
  "make me a sandwich": () => result([err("What? Make it yourself.")]),
  "sudo make me a sandwich": () => result([ok("Okay. 🥪")]),
  "git blame": () =>
    result([
      out("^b10cked (Spencer Pollock 2026-11-05 02:13) the entire city"),
      muted("hint: one building in the park has more to say"),
    ]),
  shred: ({ district }) =>
    result(
      [ok("🏂 dropping in on the North Shore…")],
      [...(district === "skyline" ? [] : [{ type: "navigate" as const, href: "/" }]), { type: "shred" }, { type: "close" }],
    ),
  sudo: () => result([err("spencer is not in the sudoers file. This incident will be reported.")]),
  "rm -rf /": () => result([err("nice try. the city has backups.")]),
  pwd: () => result([out("/home/spencer")]),
  vim: () => result([muted("you are now trapped. (just kidding — type exit)")]),
};

export function tokenize(input: string): string[] {
  return input.trim().split(/\s+/).filter(Boolean);
}

export function runCommand(input: string, context: TerminalContext): CommandResult {
  const trimmed = input.trim();
  if (trimmed === "") return result([]);
  const easter = hidden[trimmed] ?? hidden[tokenize(trimmed)[0] ?? ""];
  if (easter) return easter(context);
  const [name, ...args] = tokenize(trimmed);
  const command = commands.find((c) => c.name === name);
  if (!command) return result([err(`command not found: ${name ?? ""}`), muted("try `help`")]);
  return command.run(args, context);
}

export function complete(input: string): string[] {
  const endsWithSpace = /\s$/.test(input);
  const tokens = tokenize(input);
  if (tokens.length === 0) return commands.map((c) => c.name);
  if (tokens.length === 1 && !endsWithSpace) {
    return commands.map((c) => c.name).filter((n) => n.startsWith(tokens[0] ?? ""));
  }
  const command = commands.find((c) => c.name === tokens[0]);
  if (!command?.complete) return [];
  const partial = endsWithSpace ? "" : (tokens[tokens.length - 1] ?? "");
  return command.complete(partial).map((option) => `${command.name} ${option}`);
}

export function commonPrefix(options: string[]): string {
  if (options.length === 0) return "";
  return options.reduce((prefix, option) => {
    let i = 0;
    while (i < prefix.length && prefix[i] === option[i]) i++;
    return prefix.slice(0, i);
  });
}
