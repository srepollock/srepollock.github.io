import { describe, expect, it } from "vitest";
import { commonPrefix, complete, runCommand, type TerminalContext } from "./terminal";

const context: TerminalContext = { district: "skyline", settings: { theme: "dark", city: true, rain: false } };

describe("runCommand", () => {
  it("ignores empty input", () => {
    expect(runCommand("   ", context)).toEqual({ lines: [], effects: [] });
  });

  it("reports unknown commands", () => {
    const { lines, effects } = runCommand("frobnicate", context);
    expect(lines[0]).toEqual({ kind: "err", text: "command not found: frobnicate" });
    expect(effects).toEqual([]);
  });

  it("lists every command in help", () => {
    const text = runCommand("help", context).lines.map((l) => l.text).join("\n");
    for (const name of ["cd", "ls", "open", "deploy", "whoami", "theme", "rain", "city", "clear", "exit"]) {
      expect(text).toContain(name);
    }
  });

  it.each([
    ["cd work", "/work/"],
    ["cd projects/", "/projects/"],
    ["cd ./about", "/about/"],
    ["cd ~/contact", "/contact/"],
  ])("%s navigates to %s and closes", (input, href) => {
    expect(runCommand(input, context).effects).toEqual([{ type: "navigate", href }, { type: "close" }]);
  });

  it("cd with no argument, ~ or .. goes home", () => {
    const away: TerminalContext = { ...context, district: "work" };
    for (const input of ["cd", "cd ~", "cd .."]) {
      expect(runCommand(input, away).effects[0]).toEqual({ type: "navigate", href: "/" });
    }
  });

  it("cd to the current district is a no-op", () => {
    expect(runCommand("cd ~", context).effects).toEqual([]);
  });

  it("rejects unknown districts", () => {
    const { lines, effects } = runCommand("cd narnia", context);
    expect(lines[0]?.kind).toBe("err");
    expect(effects).toEqual([]);
  });

  it("opens personal projects internally and Developer Box projects externally", () => {
    expect(runCommand("open power-gauge", context).effects[0]).toEqual({ type: "navigate", href: "/projects/power-gauge/" });
    expect(runCommand("open caravan", context).effects[0]).toEqual({
      type: "external",
      href: "https://developerbox.ca/projects/caravan/",
    });
  });

  it("deploy prints a pipeline and navigates", () => {
    const { lines, effects } = runCommand("deploy projects", context);
    expect(lines.some((l) => l.text.includes("build"))).toBe(true);
    expect(effects).toEqual([{ type: "navigate", href: "/projects/" }]);
  });

  it.each([
    ["theme", { theme: "light" }],
    ["theme dark", { theme: "dark" }],
    ["rain", { rain: true }],
    ["rain off", { rain: false }],
    ["city off", { city: false }],
  ])("%s patches settings", (input, patch) => {
    expect(runCommand(input, context).effects).toEqual([{ type: "settings", patch }]);
  });

  it("rejects bad toggle values", () => {
    expect(runCommand("rain maybe", context).effects).toEqual([]);
    expect(runCommand("theme purple", context).effects).toEqual([]);
  });

  it("clear and exit emit their effects", () => {
    expect(runCommand("clear", context).effects).toEqual([{ type: "clear" }]);
    expect(runCommand("exit", context).effects).toEqual([{ type: "close" }]);
  });

  it("has a sense of humour about sudo", () => {
    expect(runCommand("sudo reboot", context).lines[0]?.text).toMatch(/sudoers/);
  });
});

describe("complete", () => {
  it("completes command names", () => {
    expect(complete("th")).toEqual(["theme"]);
    expect(complete("c")).toEqual(expect.arrayContaining(["cd", "cat", "contact", "city", "clear"]));
  });

  it("completes arguments", () => {
    expect(complete("cd pro")).toEqual(["cd projects"]);
    expect(complete("open power")).toEqual(["open power-gauge"]);
    expect(complete("cd ")).toContain("cd work");
  });

  it("returns nothing for commands without arguments", () => {
    expect(complete("whoami x")).toEqual([]);
  });
});

describe("commonPrefix", () => {
  it("finds the shared prefix", () => {
    expect(commonPrefix(["cd", "cat", "city"])).toBe("c");
    expect(commonPrefix(["contact"])).toBe("contact");
    expect(commonPrefix([])).toBe("");
  });
});

describe("easter eggs and fly", () => {
  it("fly toggles free-fly and closes the shell", () => {
    expect(runCommand("fly", context).effects).toEqual([{ type: "fly" }, { type: "close" }]);
  });

  it("knows the sandwich rules", () => {
    expect(runCommand("make me a sandwich", context).lines[0]?.text).toBe("What? Make it yourself.");
    expect(runCommand("sudo make me a sandwich", context).lines[0]?.text).toBe("Okay. 🥪");
    expect(runCommand("sudo rm -rf", context).lines[0]?.text).toMatch(/sudoers/);
  });

  it("shred heads home first when needed", () => {
    expect(runCommand("shred", context).effects).toEqual([{ type: "shred" }, { type: "close" }]);
    expect(runCommand("shred", { ...context, district: "work" }).effects[0]).toEqual({ type: "navigate", href: "/" });
  });

  it("git blame has opinions", () => {
    expect(runCommand("git blame", context).lines[0]?.text).toContain("Spencer Pollock");
  });
});
