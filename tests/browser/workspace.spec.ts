import { test, expect, type Page } from "@playwright/test";
async function createAccount(page: Page) {
  await page.goto("/login?next=/dashboard");
  await page
    .getByRole("button", { name: "Create an account", exact: true })
    .click();
  await page
    .getByLabel("Username", { exact: true })
    .fill(`candidate-${Date.now()}`);
  await page.getByLabel("Password", { exact: true }).fill("practice123");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page).toHaveURL((url) => url.pathname === "/dashboard");
}
test.beforeEach(async ({ page }) => {
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
});
test("public pages, preview, fallback news and mobile navigation", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Find your words/ }),
  ).toBeVisible();
  await page.screenshot({
    path: "/tmp/aicoach-home-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Explore the workspace" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goto("/news");
  await expect(page.getByText(/These are illustrative examples/)).toBeVisible();
  await page
    .getByPlaceholder("Search news, companies, tech stack...")
    .fill("nothingmatches");
  await expect(
    page.getByText("No news found matching your criteria."),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/jobs");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Projects & research" })
    .click();
  await expect(page).toHaveURL(/projects$/);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Something worth building" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "/tmp/aicoach-projects-mobile.png",
    fullPage: true,
  });
});
test("registration, persisted sign-in, complete session, export, analytics and logout", async ({
  page,
}) => {
  await createAccount(page);
  await page.goto("/profile");
  await page.getByLabel("Display name").fill("Alex");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.getByRole("link", { name: "Overview", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /Welcome back/ }),
  ).toBeVisible();
  await expect(
    page.getByText("Your progress starts with a session"),
  ).toBeVisible();
  await page.screenshot({
    path: "/tmp/aicoach-dashboard-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("link", { name: "Guided practice", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Build your practice session" }),
  ).toBeVisible();
  await page.screenshot({
    path: "/tmp/aicoach-practice-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Enter practice room" }).click();
  await expect(
    page.getByText("Camera not available", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Start Session", exact: true })
    .first()
    .click();
  await page.waitForTimeout(1300);
  await page
    .getByRole("button", { name: "Pause", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Resume", exact: true }).first(),
  ).toBeVisible();
  const timer = await page.getByText(/^14:\d{2}$/).textContent();
  await page.waitForTimeout(1100);
  await expect(page.getByText(timer!, { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Resume", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await page
    .getByLabel("Session notes", { exact: true })
    .fill("Explain the tradeoffs before describing the implementation.");
  await page
    .getByRole("button", { name: "End Session", exact: true })
    .first()
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "End Session", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Interview Replay" }),
  ).toBeVisible();
  await expect(page.getByText("Not measured").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Overview", exact: true }).click();
  await expect(
    page.getByRole("cell", { name: "completed", exact: true }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Data (CSV)" }).click();
  expect((await download).suggestedFilename()).toMatch(/dashboard_export/);
  await page.getByRole("link", { name: "Your progress", exact: true }).click();
  await expect(page.getByText("Saved sessions", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "AI insights" }).click();
  await page.getByRole("button", { name: "Generate insights" }).click();
  await expect(
    page.getByRole("heading", { name: "Insights are unavailable" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL((url) => url.pathname === "/login");
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/login\?next=/);
});
test("navigation guard, pressure mode, bookmarks and coach failure", async ({
  page,
}) => {
  await createAccount(page);
  await page.getByRole("link", { name: "Quick session", exact: true }).click();
  await page
    .getByRole("button", { name: "Start Session", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Pressure mode", exact: true })
    .click();
  for (const button of await page
    .getByRole("button", { name: "Pause", exact: true })
    .all())
    await expect(button).toBeDisabled();
  await page.getByRole("link", { name: "Overview", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Leave this session?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page).toHaveURL(/session$/);
  await page.goBack();
  await expect(
    page.getByRole("dialog", { name: "Leave this session?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page).toHaveURL(/session$/);
  await page.getByRole("link", { name: "Overview", exact: true }).click();
  await page
    .getByRole("button", { name: "Save and leave", exact: true })
    .click();
  await expect(page).toHaveURL((url) => url.pathname === "/dashboard");
  await page.getByRole("link", { name: "Opportunities", exact: true }).click();
  await page
    .getByRole("button", { name: "Bookmark job", exact: true })
    .first()
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Remove bookmark", exact: true }),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "Open AI coach" }).click();
  await page.getByLabel("Message your coach").fill("How do I prepare?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "AI coaching is not configured" }),
  ).toBeVisible();
});

test("every route fits mobile, tablet, and desktop widths", async ({
  page,
}) => {
  await createAccount(page);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
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
      await page.goto(path);
      await expect(page.getByRole("heading").first()).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
        `${path} overflows at ${width}px`,
      ).toBeTruthy();
    }
  }
  expect(errors).toEqual([]);
});

test("speech totals survive a pause and reset for a new session", async ({
  page,
}) => {
  await page.addInitScript(() => {
    class Recognition {
      onresult: ((event: unknown) => void) | null = null;
      timer: number | undefined;
      start() {
        this.timer = window.setTimeout(() => {
          const result = Object.assign([{ transcript: "hello practice" }], {
            isFinal: true,
          });
          this.onresult?.({ resultIndex: 0, results: [result] });
        }, 100);
      }
      stop() {
        window.clearTimeout(this.timer);
      }
      abort() {
        this.stop();
      }
    }
    Object.defineProperty(window, "SpeechRecognition", {
      value: Recognition,
      configurable: true,
    });
  });
  await createAccount(page);
  await page.getByRole("link", { name: "Quick session", exact: true }).click();
  await page
    .getByRole("button", { name: "Start Session", exact: true })
    .first()
    .click();
  await expect(page.getByText("2 / 0", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Pause", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Resume", exact: true })
    .first()
    .click();
  await expect(page.getByText("4 / 0", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "End Session", exact: true })
    .first()
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "End Session", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Start Session", exact: true })
    .first()
    .click();
  await expect(page.getByText("2 / 0", { exact: true })).toBeVisible();
});
