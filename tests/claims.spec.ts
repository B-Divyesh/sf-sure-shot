import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

async function completeCurrentRun(page: import("@playwright/test").Page) {
  const choose = async (name: string) => {
    await page.getByRole("radio", { name }).click();
    await page
      .getByRole("button", { name: "Lock in answer and confidence" })
      .click();
    await page.getByRole("button", { name: "Next challenge" }).click();
  };
  await choose("13");
  await page.waitForTimeout(2100);
  await choose("Pattern B");
  await page.getByRole("button", { name: "Start timer" }).click();
  await page.getByRole("button", { name: "Stop timer" }).click();
  await page.getByRole("button", { name: "Next challenge" }).click();
  await choose("Option B");
  await page.getByRole("radio", { name: "22" }).click();
  await page
    .getByRole("button", { name: "Lock in answer and confidence" })
    .click();
  await page.getByRole("button", { name: "See calibration" }).click();
}

async function completeRun(page: import("@playwright/test").Page) {
  await page.goto("/demo");
  await expect(
    page.getByRole("heading", { name: "How many marks are on this card?" }),
  ).toBeVisible();
  await completeCurrentRun(page);
}

async function seriousAxeViolations(page: import("@playwright/test").Page) {
  await page.evaluate(axeSource);
  const results = await page.evaluate(async () =>
    (
      window as typeof window & {
        axe: {
          run: () => Promise<{ violations: Array<{ impact: string | null }> }>;
        };
      }
    ).axe.run(),
  );
  return results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
}

test("@claim:complete-run demo reaches the calibration screen", async ({
  page,
}) => {
  await completeRun(page);
  await expect(
    page.getByRole("heading", { name: "See how your confidence matched" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Confidence by challenge type" }),
  ).toBeVisible();
});

test("@claim:restart-run a practice run resets to round one", async ({
  page,
}) => {
  await completeRun(page);
  await page.getByRole("button", { name: "Play a fresh practice run" }).click();
  await expect(page.getByText("Round 1 of 5 · Visual estimate")).toBeVisible();
});

test("@claim:local-scores scores stay in the browser", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/demo");
  await page.getByRole("button", { name: "Use timing assist" }).click();
  await page.getByRole("radio", { name: "13" }).click();
  await page
    .getByRole("button", { name: "Lock in answer and confidence" })
    .click();
  expect(
    requests.every((url) => new URL(url).origin === "http://127.0.0.1:4173"),
  ).toBe(true);
  expect(
    await page.evaluate(() => localStorage.getItem("demo:active")),
  ).not.toBeNull();
  expect(
    await page.evaluate(() => localStorage.getItem("sure-shot:active")),
  ).toBeNull();
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).every((key) => key.startsWith("demo:")),
    ),
  ).toBe(true);
});

test("@claim:assist-persist timing assist persists after reload", async ({
  page,
}) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: "Use timing assist" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Assist mode on" }),
  ).toBeVisible();
});

test("@claim:free-play demo starts without a payment step", async ({
  page,
}) => {
  await page.goto("/demo");
  await expect(
    page.getByRole("heading", { name: "How many marks are on this card?" }),
  ).toBeVisible();
  await expect(page.getByText(/payment|checkout|buy/i)).toHaveCount(0);
});

test("@claim:no-account demo starts without an account step", async ({
  page,
}) => {
  await page.goto("/demo");
  await expect(
    page.getByRole("heading", { name: "How many marks are on this card?" }),
  ).toBeVisible();
  await expect(
    page.locator('input[type="email"], input[type="password"], form'),
  ).toHaveCount(0);
});

test("has no serious or critical accessibility violations on demo", async ({
  page,
}) => {
  await page.goto("/demo");
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test("production CSP stays console-clean through the full game", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(`Page error: ${error.message}`));
  page.on("requestfailed", (request) =>
    errors.push(
      `Request failed: ${request.url()} ${request.failure()?.errorText ?? ""}`,
    ),
  );
  page.on("response", (response) => {
    if (response.status() >= 400)
      errors.push(`HTTP ${response.status()}: ${response.url()}`);
  });

  await page.goto("/");
  await expect(page.locator(".hero-art img")).toHaveJSProperty(
    "complete",
    true,
  );
  expect(
    await page
      .locator(".hero-art img")
      .evaluate((image) => (image as HTMLImageElement).naturalWidth),
  ).toBeGreaterThan(0);
  expect(await page.locator("[style]").count()).toBe(0);
  await page.getByRole("button", { name: "Try it with sample data" }).click();
  await completeCurrentRun(page);
  await expect(
    page.getByRole("heading", { name: "See how your confidence matched" }),
  ).toBeVisible();
  expect(await page.locator("[style]").count()).toBe(0);
  expect(errors).toEqual([]);
});

test("keyboard controls select, adjust confidence, and submit", async ({
  page,
}) => {
  await page.goto("/demo");
  const answer = page.getByRole("radio", { name: "13" });
  await answer.focus();
  await page.keyboard.press("Space");
  await expect(answer).toHaveAttribute("aria-checked", "true");
  const confidence = page.getByLabel("How sure are you?");
  await confidence.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#confidence-value")).toHaveText("80%");
  const lock = page.getByRole("button", {
    name: "Lock in answer and confidence",
  });
  await lock.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Your answer held up." }),
  ).toBeVisible();
});

test("mobile layout fits and visible controls meet touch target size", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demo");
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  const sizes = await page
    .locator('button:visible, input[type="range"]:visible')
    .evaluateAll((elements) =>
      elements.map((element) => {
        const box = element.getBoundingClientRect();
        return { width: box.width, height: box.height };
      }),
    );
  expect(sizes.every((size) => size.width >= 44 && size.height >= 44)).toBe(
    true,
  );
});

test("results screen has no serious or critical accessibility violations", async ({
  page,
}) => {
  await completeRun(page);
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test("a loaded run remains playable when the network goes offline", async ({
  page,
  context,
}) => {
  await page.goto("/demo");
  await context.setOffline(true);
  await page.getByRole("radio", { name: "13" }).click();
  await page
    .getByRole("button", { name: "Lock in answer and confidence" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your answer held up." }),
  ).toBeVisible();
  await context.setOffline(false);
});
