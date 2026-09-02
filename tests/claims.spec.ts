import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const levelText = /Level \d+ of 20/;

async function completeCurrentRun(page: import("@playwright/test").Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (let level = 1; level <= 20; level++) {
    await expect(page.getByText(levelText).first()).toBeVisible();
    if (await page.getByRole("button", { name: "Start timer" }).count()) {
      await page.getByRole("button", { name: "Start timer" }).click();
      await page.getByRole("button", { name: "Stop timer" }).click();
    } else {
      await page.getByRole("radio").first().click();
      await page.getByRole("button", { name: "Lock in answer and confidence" }).click();
    }
    await page.getByRole("button", { name: level === 20 ? "See calibration" : "Next challenge" }).click();
  }
}

async function completeRun(page: import("@playwright/test").Page) {
  await page.goto("/demo");
  await expect(page.getByRole("heading", { name: "How many marks are on this card?" })).toBeVisible();
  await completeCurrentRun(page);
}

async function seriousAxeViolations(page: import("@playwright/test").Page) {
  await page.evaluate(axeSource);
  const results = await page.evaluate(async () =>
    (window as typeof window & { axe: { run: () => Promise<{ violations: Array<{ impact: string | null }> }> } }).axe.run(),
  );
  return results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
}

test("@claim:complete-run demo reaches the calibration screen", async ({ page }) => {
  await completeRun(page);
  await expect(page.getByRole("heading", { name: "See how your confidence matched" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Confidence by challenge type" })).toBeVisible();
});

test("@claim:restart-run a practice run resets to level one", async ({ page }) => {
  await completeRun(page);
  await page.getByRole("button", { name: "Play a fresh practice run" }).click();
  await expect(page.getByText("Level 1 of 20 · Visual estimate")).toBeVisible();
});

test("@claim:daily-levels date seeds a real twenty-level daily game", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Level 1 of 20 · Visual estimate")).toBeVisible();
  const seed = await page.getByText(/SS-\d{8}/).textContent();
  expect(seed).toMatch(/SS-\d{8}/);
  await page.evaluate(() => localStorage.removeItem("sure-shot:active"));
  await page.reload();
  await expect(page.getByText(seed!)).toBeVisible();
});

test("pattern recall renders answer diagrams after its preview and accepts the matching diagram", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("radio").first().click();
  await page.getByRole("button", { name: "Lock in answer and confidence" }).click();
  await page.getByRole("button", { name: "Next challenge" }).click();
  const preview = page.locator(".pattern-stage .pattern");
  await expect(preview).toBeVisible();
  const previewTiles = await preview.locator(".on").evaluateAll((tiles) => tiles.map((tile) => [...tile.parentElement!.children].indexOf(tile)));
  await expect(page.locator(".choices .pattern")).toHaveCount(3, { timeout: 3000 });
  const matchingChoice = page.getByRole("radio").filter({ has: page.locator(".pattern") }).filter({
    has: page.locator(".pattern .on"),
  });
  const choice = page.getByRole("radio").filter({ has: page.locator(".pattern") });
  const matchingIndex = await choice.evaluateAll((buttons, expected) => buttons.findIndex((button) => [...button.querySelectorAll(".pattern .on")].map((tile) => [...tile.parentElement!.children].indexOf(tile)).join(",") === expected.join(",")), previewTiles);
  expect(matchingIndex).toBeGreaterThanOrEqual(0);
  await choice.nth(matchingIndex).click();
  await page.getByRole("button", { name: "Lock in answer and confidence" }).click();
  await expect(page.getByRole("heading", { name: "Your answer held up." })).toBeVisible();
  await expect(matchingChoice).toHaveCount(3);
});

test("@claim:local-scores scores stay in the browser", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/demo");
  await page.getByRole("button", { name: "Use timing assist" }).click();
  await page.getByRole("radio").first().click();
  await page.getByRole("button", { name: "Lock in answer and confidence" }).click();
  expect(requests.every((url) => new URL(url).origin === "http://127.0.0.1:4173")).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem("demo:active"))).not.toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("sure-shot:active"))).toBeNull();
  expect(await page.evaluate(() => Object.keys(localStorage).every((key) => key.startsWith("demo:")))).toBe(true);
});

test("@claim:assist-persist timing assist persists after reload", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: "Use timing assist" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Assist mode on" })).toBeVisible();
});

test("@claim:free-play demo starts without a payment step", async ({ page }) => {
  await page.goto("/demo");
  await expect(page.getByRole("heading", { name: "How many marks are on this card?" })).toBeVisible();
  await expect(page.getByText(/payment|checkout|buy/i)).toHaveCount(0);
});

test("@claim:no-account demo starts without an account step", async ({ page }) => {
  await page.goto("/demo");
  await expect(page.locator('input[type="email"], input[type="password"], form')).toHaveCount(0);
});

test("@claim:fps-60 measures at least 55 FPS in the Chromium mobile profile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demo");
  const fps = await page.evaluate(() => new Promise<number>((resolve) => {
    const stamps: number[] = [];
    const frame = (stamp: number) => {
      stamps.push(stamp);
      if (stamps.length === 61) resolve((stamps.length - 1) * 1000 / (stamps.at(-1)! - stamps[0]));
      else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }));
  expect(fps).toBeGreaterThanOrEqual(55);
});

test("root immediately shows playable game content and Tab begins at the skip link", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "How many marks are on this card?" })).toBeVisible();
  await expect(page.getByRole("radio")).toHaveCount(3);
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip")).toBeFocused();
});

test("has no serious or critical accessibility violations on demo", async ({ page }) => {
  await page.goto("/demo");
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test("keyboard controls select, adjust confidence, and submit", async ({ page }) => {
  await page.goto("/demo");
  const answer = page.getByRole("radio").first();
  await answer.focus();
  await page.keyboard.press("Space");
  await expect(answer).toHaveAttribute("aria-checked", "true");
  const confidence = page.getByLabel("How sure are you?");
  await confidence.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#confidence-value")).toHaveText("80%");
  const lock = page.getByRole("button", { name: "Lock in answer and confidence" });
  await lock.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".feedback")).toBeVisible();
});

test("mobile layout fits and visible controls meet touch target size", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demo");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  const sizes = await page.locator('button:visible, input[type="range"]:visible').evaluateAll((elements) => elements.map((element) => {
    const box = element.getBoundingClientRect();
    return { width: box.width, height: box.height };
  }));
  expect(sizes.every((size) => size.width >= 44 && size.height >= 44)).toBe(true);
});

test("results screen has no serious or critical accessibility violations", async ({ page }) => {
  await completeRun(page);
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test("a loaded run remains playable when the network goes offline", async ({ page, context }) => {
  await page.goto("/demo");
  await context.setOffline(true);
  await page.getByRole("radio").first().click();
  await page.getByRole("button", { name: "Lock in answer and confidence" }).click();
  await expect(page.locator(".feedback")).toBeVisible();
  await context.setOffline(false);
});

test("public and fallback routes render without browser errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  for (const [path, title] of [["/privacy", "Privacy — Sure Shot"], ["/terms", "Terms — Sure Shot"], ["/404", "Page not found — Sure Shot"], ["/not-a-real-route", "Page not found — Sure Shot"]]) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
  }
  expect(errors).toEqual([]);
});
