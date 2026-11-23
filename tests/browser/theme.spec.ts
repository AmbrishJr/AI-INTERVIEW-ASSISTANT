import { test, expect, type Locator, type Page } from "@playwright/test";

async function selectTheme(page: Page, name: "Light" | "Dark" | "System") {
  await page.getByRole("button", { name: "Change theme" }).click();
  await page.getByRole("menuitemradio", { name, exact: true }).click();
}

async function expectDarkSurface(locator: Locator) {
  const color = await locator.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );
  const channels = color
    .match(/[\d.]+/g)!
    .slice(0, 3)
    .map(Number);
  expect(
    Math.max(...channels),
    `Expected a dark surface, got ${color}`,
  ).toBeLessThan(75);
}

test("system preference, explicit overrides, reloads and cross-tab changes", async ({
  page,
  context,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass("dark");
  await expectDarkSurface(page.locator("header").locator(".."));
  await selectTheme(page, "Light");
  await expect(page.locator("html")).not.toHaveClass("dark");
  await page.reload();
  await expect(page.locator("html")).not.toHaveClass("dark");

  const secondTab = await context.newPage();
  await secondTab.goto("/login");
  await selectTheme(page, "Dark");
  await expect(secondTab.locator("html")).toHaveClass("dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveClass("dark");
  await selectTheme(page, "System");
  await expect(page.locator("html")).not.toHaveClass("dark");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveClass("dark");
  await page.getByRole("button", { name: "Change theme" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("menuitemradio", { name: "System", exact: true }),
  ).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Change theme" }),
  ).toBeFocused();
});

test("saved dark mode is applied before React loads", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() => localStorage.setItem("aicoach.theme", "dark"));
  await page.route(/\/src\/main\.tsx(?:\?|$)/, (route) => route.abort());
  await page.goto("/login");
  await expect(page.locator("#root")).toBeEmpty();
  await expect(page.locator("html")).toHaveClass("dark");
  expect(
    await page.locator("html").evaluate((el) => el.style.colorScheme),
  ).toBe("dark");
});

test("theme switching works when browser storage is blocked", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Storage blocked", "SecurityError");
      },
    });
  });
  await page.goto("/login");
  await expect(page.locator("html")).toHaveClass("dark");
  await selectTheme(page, "Light");
  await expect(page.locator("html")).not.toHaveClass("dark");
  await selectTheme(page, "Dark");
  await expect(page.locator("html")).toHaveClass("dark");
  await expect(page.getByLabel("Username", { exact: true })).toBeVisible();
});

test("dark theme covers every route, mobile navigation, dialogs and charts", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      value: () =>
        Promise.reject(
          new DOMException("Permission denied", "NotAllowedError"),
        ),
    });
  });
  await page.route("**/api/news?**", (route) =>
    route.fulfill({ json: { news: [], source: "unavailable" } }),
  );
  const credentials = {
    username: `theme-${Date.now()}`,
    password: "practice123",
  };
  const registration = await page.request.post("/api/register", {
    data: credentials,
  });
  expect(registration.ok()).toBeTruthy();
  const { user } = await registration.json();
  expect(
    (await page.request.post("/api/login", { data: credentials })).ok(),
  ).toBeTruthy();
  await page.goto("/dashboard");
  await page.evaluate((id) => {
    localStorage.setItem(
      `aicoach:${id}:sessionHistory`,
      JSON.stringify([
        {
          id: "theme-sample",
          date: new Date().toISOString(),
          duration: 120,
          notes: "Theme test",
          status: "completed",
          metrics: {
            talkPct: 60,
            faceVisiblePct: 85,
            eyeContactPct: 75,
            avgWpm: 120,
            words: 100,
            fillers: 2,
          },
        },
      ]),
    );
  }, user.id);

  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      "/",
      "/login",
      "/dashboard",
      "/practice",
      "/session",
      "/analytics",
      "/profile",
      "/news",
      "/jobs",
      "/projects",
      "/missing-page",
    ]) {
      await page.goto(route);
      await expect(
        page.getByRole("button", { name: "Change theme" }),
      ).toBeVisible();
      await expect(page.locator("html")).toHaveClass("dark");
      await expectDarkSurface(page.locator("body"));
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} at ${width}px overflows`,
      ).toBeTruthy();
      if (route === "/dashboard") {
        await expect(page.locator(".recharts-surface")).toBeVisible();
        if (width === 1440) {
          await page.locator(".recharts-line-dot").hover();
          const tooltip = page.locator(".recharts-default-tooltip");
          await expect(tooltip).toBeVisible();
          await expectDarkSurface(tooltip);
        }
      }
      if (route === "/" || route === "/dashboard" || route === "/projects") {
        await page.screenshot({
          path: `/tmp/aicoach-dark-${route.slice(1) || "home"}-${width}.png`,
          fullPage: true,
        });
      }
    }
  }
  await page.goto("/projects");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expectDarkSurface(page.getByRole("dialog"));
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Open AI coach" }).click();
  await expectDarkSurface(page.getByRole("dialog"));
  await page.keyboard.press("Escape");
  await page.goto("/");
  await page.getByRole("button", { name: "Explore the workspace" }).click();
  await expectDarkSurface(page.getByRole("dialog"));
  expect(errors).toEqual([]);
});
