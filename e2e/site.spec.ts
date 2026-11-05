import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", heading: /Platform engineer/ },
  { path: "/work/", heading: "Where I've shipped" },
  { path: "/work/cicd-framework/", heading: "Custom CI/CD delivery framework" },
  { path: "/projects/", heading: "Things I build after hours" },
  { path: "/projects/power-gauge/", heading: "PowerGauge HUD" },
  { path: "/about/", heading: "Hi, I'm Spencer." },
  { path: "/contact/", heading: "Open a channel." },
];

for (const route of routes) {
  test(`renders ${route.path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(route.path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(route.heading);
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("client-side navigation updates the active district", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Projects" }).click();
  await expect(page).toHaveURL(/\/projects\/$/);
  await expect(page.getByRole("link", { name: "Projects" })).toHaveAttribute("aria-current", "page");
});

test("Developer Box projects link out to developerbox.ca", async ({ page }) => {
  await page.goto("/projects/");
  await page.getByRole("button", { name: /Developer Box/ }).click();
  const links = page.locator("a[data-devbox-link]");
  await expect(links.first()).toBeVisible();
  for (const href of await links.evaluateAll((els) => els.map((el) => el.getAttribute("href")))) {
    expect(href).toMatch(/^https:\/\/developerbox\.ca\/projects\/[a-z0-9-]+\/$/);
  }
});

test("project filters narrow the grid", async ({ page }) => {
  await page.goto("/projects/");
  const cards = page.locator("main ul[aria-live] > li");
  const all = await cards.count();
  await page.getByRole("button", { name: /Open source/ }).click();
  const open = await cards.count();
  expect(open).toBeGreaterThan(0);
  expect(open).toBeLessThan(all);
});

test("city toggle persists and removes the canvas", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("city-canvas")).toBeAttached();
  await page.getByRole("button", { name: "Turn the city off" }).click();
  await expect(page.getByTestId("city-canvas")).toHaveCount(0);
  await expect(page.getByTestId("skyline-fallback")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Turn the city on" })).toBeVisible();
  await expect(page.getByTestId("city-canvas")).toHaveCount(0);
});

test("theme toggle switches data-theme and persists", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Switch to day" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test.describe("without WebGL", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
        if (type.startsWith("webgl")) return null;
        return (original as (...args: unknown[]) => unknown).call(this, type, ...rest);
      } as typeof HTMLCanvasElement.prototype.getContext;
    });
  });

  test("falls back to the static skyline and stays usable", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("skyline-fallback")).toBeVisible();
    await expect(page.getByTestId("city-canvas")).toHaveCount(0);
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Work" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Where I've shipped");
  });
});

test("content is readable with JavaScript disabled", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/work/cicd-framework/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Custom CI/CD delivery framework");
  await expect(page.getByText("40% faster deployments for customers")).toBeVisible();
  await context.close();
});

test("reduced motion still renders the city and navigates without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByTestId("city-canvas")).toBeAttached();
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "About" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hi, I'm Spencer.");
  expect(errors).toEqual([]);
});

test.describe("terminal", () => {
  test("opens with Ctrl+K, navigates with cd and closes", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+k");
    const terminal = page.getByTestId("terminal");
    await expect(terminal).toBeVisible();
    const input = terminal.getByRole("textbox", { name: /command/ });
    await expect(input).toBeFocused();
    await input.fill("cd projects");
    await input.press("Enter");
    await expect(page).toHaveURL(/\/projects\/$/);
    await expect(terminal).toHaveCount(0);
  });

  test("runs commands, completes with Tab and recalls history", async ({ page }) => {
    await page.goto("/about/");
    await page.getByRole("button", { name: /Open the shell/ }).first().click();
    const terminal = page.getByTestId("terminal");
    const input = terminal.getByRole("textbox", { name: /command/ });
    await input.fill("whoa");
    await input.press("Tab");
    await expect(input).toHaveValue("whoami ");
    await input.press("Enter");
    await expect(terminal).toContainText("Founder, Developer Box Inc.");
    await input.fill("theme light");
    await input.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await input.press("ArrowUp");
    await expect(input).toHaveValue("theme light");
    await input.fill("nope");
    await input.press("Enter");
    await expect(terminal).toContainText("command not found: nope");
  });

  test("Escape closes it and returns focus", async ({ page }) => {
    await page.goto("/");
    const opener = page.getByRole("button", { name: /Open the shell/ }).first();
    await opener.click();
    await expect(page.getByTestId("terminal")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("terminal")).toHaveCount(0);
    await expect(opener).toBeFocused();
  });
});
