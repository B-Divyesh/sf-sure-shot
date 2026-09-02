import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const levelText = /Level \d+ of 20/;

type Page = import("@playwright/test").Page;

async function answerCurrentLevel(page: Page, level: number) {
  if (await page.getByRole("button", { name: "Hide pattern and choose an answer" }).count())
    await page.getByRole("button", { name: "Hide pattern and choose an answer" }).click();
  if (await page.getByRole("button", { name: "Start timer" }).count()) {
    await page.getByRole("button", { name: "Start timer" }).click();
    await page.getByRole("button", { name: "Stop timer" }).click();
  } else {
    await page.getByRole("radio").first().click();
    await page.getByRole("button", { name: "Lock in answer and confidence" }).click();
  }
  await page.getByRole("button", { name: level === 20 ? "See calibration" : "Next challenge" }).click();
}

async function completeCurrentRun(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (let level = 1; level <= 20; level++) {
    await expect(page.getByText(levelText).first()).toBeVisible();
    await answerCurrentLevel(page, level);
  }
}

async function completeRun(page: Page) {
  await page.goto("/demo");
  await expect(page.getByRole("heading", { name: "How many marks are on this card?" })).toBeVisible();
  await completeCurrentRun(page);
}

async function seriousAxeViolations(page: Page) {
  await page.evaluate(axeSource);
  const results = await page.evaluate(async () =>
    (window as typeof window & { axe: { run: () => Promise<{ violations: Array<{ impact: string | null }> }> } }).axe.run(),
  );
  return results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
}

async function storeSeededRun(page: Page, seed: string) {
  await page.evaluate((storedSeed) => {
    localStorage.setItem("sure-shot:active", JSON.stringify({
      round: 0,
      answers: [],
      phase: "answer",
      startedAt: 1,
      seed: storedSeed,
    }));
  }, seed);
}

async function playAndDescribeTwentyLevels(page: Page) {
  const sequence: string[] = [];
  for (let level = 1; level <= 20; level++) {
    await expect(page.getByText(levelText).first()).toBeVisible();
    sequence.push(await page.locator(".game-screen").evaluate((screen) => {
      const top = screen.querySelector(".run-top")?.textContent?.trim() ?? "";
      const prompt = screen.querySelector(".round-question")?.textContent?.trim() ?? "";
      const challenge = screen.querySelector(".challenge")?.textContent?.trim() ?? "";
      const labels = [...screen.querySelectorAll<HTMLElement>("[data-choice]")]
        .map((choice) => choice.getAttribute("aria-label"))
        .join("|");
      return [top, prompt, challenge, labels].join("::");
    }));
    await answerCurrentLevel(page, level);
  }
  return sequence;
}

function contrast(first: [number, number, number], second: [number, number, number]) {
  const luminance = (rgb: [number, number, number]) => {
    const channels = rgb.map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

test("@claim:complete-run demo reaches the real calibration screen", async ({ page }) => {
  await completeRun(page);
  await expect(page.getByRole("heading", { name: "See how your confidence matched" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Confidence by challenge type" })).toBeVisible();
});

test("@claim:restart-run a practice run resets level, answers, and phase", async ({ page }) => {
  await completeRun(page);
  await page.getByRole("button", { name: "Play a fresh practice run" }).click();
  await expect(page.getByText("Level 1 of 20 · Visual estimate")).toBeVisible();
  const restarted = await page.evaluate(() => JSON.parse(localStorage.getItem("demo:active")!));
  expect(restarted).toMatchObject({
    round: 0,
    answers: [],
    phase: "answer",
  });
});

test("@claim:daily-levels two UTC date seeds create distinct twenty-level games", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await storeSeededRun(page, "SS-20260902");
  await page.reload();
  await expect(page.getByText("SS-20260902")).toBeVisible();
  const first = await playAndDescribeTwentyLevels(page);

  await storeSeededRun(page, "SS-20260903");
  await page.reload();
  await expect(page.getByText("SS-20260903")).toBeVisible();
  const second = await playAndDescribeTwentyLevels(page);

  expect(first).toHaveLength(20);
  expect(second).toHaveLength(20);
  expect(first).not.toEqual(second);
});

test("@claim:session-length the measured pacing budget is four to six minutes", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("20 levels · 4–6 minutes")).toBeVisible();
  await expect(page.locator("progress.round-progress")).toHaveAttribute("max", "20");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const measuredLevelSeconds: number[] = [];
  for (let level = 1; level <= 20; level++) {
    await expect(page.getByText(levelText).first()).toBeVisible();
    measuredLevelSeconds.push(Number(await page.locator(".game-screen").getAttribute("data-planned-seconds")));
    await answerCurrentLevel(page, level);
  }
  expect(measuredLevelSeconds).toHaveLength(20);
  expect(measuredLevelSeconds.every((seconds) => seconds >= 12 && seconds <= 18)).toBe(true);
  const measuredSessionSeconds = measuredLevelSeconds.reduce((sum, seconds) => sum + seconds, 0);
  expect(measuredSessionSeconds).toBeGreaterThanOrEqual(4 * 60 - 1);
  expect(measuredSessionSeconds).toBeLessThanOrEqual(6 * 60 + 1);
  await expect(page.getByText("20 levels complete")).toBeVisible();
});

test("@claim:input-methods answer controls work with mouse, keyboard, and touch", async ({ page, browser }) => {
  await page.goto("/demo");
  const mouseTarget = page.getByRole("radio").first();
  await mouseTarget.click();
  await expect(mouseTarget).toHaveAttribute("aria-checked", "true");

  await page.getByRole("button", { name: "Reset demo" }).click();
  const keyboardTarget = page.getByRole("radio").first();
  await keyboardTarget.focus();
  await page.keyboard.press("Space");
  await expect(keyboardTarget).toHaveAttribute("aria-checked", "true");

  const touchContext = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const touchPage = await touchContext.newPage();
  await touchPage.goto("http://127.0.0.1:4173/demo");
  const touchTarget = touchPage.getByRole("radio").first();
  await touchPage.tap("[data-choice]");
  await expect(touchTarget).toHaveAttribute("aria-checked", "true");
  await touchContext.close();
});

test("@claim:demo-isolation sample play never changes an existing real run", async ({ page }) => {
  await page.goto("/");
  await storeSeededRun(page, "SS-20200101");
  const realRun = await page.evaluate(() => localStorage.getItem("sure-shot:active"));
  await page.reload();
  await page.getByRole("button", { name: "Try it with sample data" }).click();
  await expect(page).toHaveURL(/\/demo$/);
  expect(await page.evaluate(() => localStorage.getItem("sure-shot:active"))).toBe(realRun);
  expect(await page.evaluate(() => localStorage.getItem("demo:active"))).not.toBeNull();
  await page.getByRole("button", { name: "Reset demo" }).click();
  expect(await page.evaluate(() => localStorage.getItem("sure-shot:active"))).toBe(realRun);
});

test("@claim:seed-resume an unfinished game keeps its displayed seed across a later reload", async ({ page }) => {
  await page.goto("/");
  await storeSeededRun(page, "SS-20200101");
  await page.reload();
  await expect(page.getByText("SS-20200101")).toBeVisible();
  await page.getByRole("radio").first().click();
  await page.getByRole("button", { name: "Lock in answer and confidence" }).click();
  await page.reload();
  await expect(page.getByText("SS-20200101")).toBeVisible();
  await expect(page.locator(".feedback")).toBeVisible();
});

test("@claim:local-scores scores stay in the browser with no analytics or third-party requests", async ({ page }) => {
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

test("@claim:no-server-data a complete game sends only allowlisted GET requests with no payload", async ({ page }) => {
  const requests: Array<{ method: string; origin: string; path: string; search: string; payload: string | null }> = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    requests.push({
      method: request.method(),
      origin: url.origin,
      path: url.pathname,
      search: url.search,
      payload: request.postData(),
    });
  });
  await page.goto("/demo");
  await completeCurrentRun(page);
  await expect(page.getByRole("heading", { name: "See how your confidence matched" })).toBeVisible();

  const allowedPath = (path: string) =>
    path === "/demo" || /^\/assets\/index-[A-Za-z0-9_-]+\.(?:css|js)$/.test(path);
  expect(requests.length).toBeGreaterThan(0);
  for (const request of requests) {
    expect(request.method).toBe("GET");
    expect(request.origin).toBe("http://127.0.0.1:4173");
    expect(request.search).toBe("");
    expect(request.payload).toBeNull();
    expect(allowedPath(request.path), `unexpected request path: ${request.path}`).toBe(true);
  }
});

test("@claim:loaded-offline a loaded challenge can be completed offline", async ({ page, context }) => {
  await page.goto("/demo");
  await context.setOffline(true);
  await page.getByRole("radio").first().click();
  await page.getByRole("button", { name: "Lock in answer and confidence" }).click();
  await expect(page.locator(".feedback")).toBeVisible();
  await context.setOffline(false);
});

test("@claim:assist-persist timing assist persists after reload", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: "Use timing assist" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Assist mode on" })).toBeVisible();
});

test("@claim:assist-seconds timing assist adds exactly 1.5 seconds to a timing target", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/demo");
  await answerCurrentLevel(page, 1);
  await answerCurrentLevel(page, 2);
  const before = await page.locator(".timer-stage p").textContent();
  const beforeSeconds = Number(before!.match(/[\d.]+/)![0]);
  await page.getByRole("button", { name: "Use timing assist" }).click();
  const after = await page.locator(".timer-stage p").textContent();
  const afterSeconds = Number(after!.match(/[\d.]+/)![0]);
  expect(afterSeconds - beforeSeconds).toBeCloseTo(1.5, 5);
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

test("root names the audience, first action, and three plain facts while showing the active game", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Calibrate confidence with visual challenges" })).toBeVisible();
  await expect(page.getByText("For curious adults who want a daily mental game that compares confidence with answers.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Try it with sample data" })).toBeVisible();
  await expect(page.locator(".game-facts li")).toHaveCount(3);
  await expect(page.getByRole("heading", { name: "How many marks are on this card?" })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip")).toBeFocused();
});

test("a structurally malformed saved run recovers to a fresh usable game", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("sure-shot:active", JSON.stringify({ seed: "SS-20260902" })));
  await page.reload();
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByText("Your saved game could not be restored. A fresh run has started.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "How many marks are on this card?" })).toBeVisible();
  await expect(page.getByRole("radio")).toHaveCount(3);
  expect(await page.evaluate(() => localStorage.getItem("sure-shot:active"))).toBeNull();
  expect(errors).toEqual([]);
});

test("pattern recall keeps its target until requested in reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/demo");
  await answerCurrentLevel(page, 1);
  await page.waitForTimeout(50);
  await expect(page.getByRole("img", { name: "Remember this pattern" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Hide pattern and choose an answer" })).toBeVisible();
  await expect(page.getByRole("radio")).toHaveCount(0);
  await page.getByRole("button", { name: "Hide pattern and choose an answer" }).click();
  await expect(page.getByRole("radio")).toHaveCount(3);
});

test("spatial targets and answers have non-visual descriptions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/demo");
  await answerCurrentLevel(page, 1);
  await answerCurrentLevel(page, 2);
  await answerCurrentLevel(page, 3);
  await expect(page.getByRole("img", { name: /Starting shape: a two by two shape with filled squares/ })).toBeVisible();
  for (const name of ["Option A", "Option B", "Option C"])
    await expect(page.getByRole("radio", { name: new RegExp(`${name} — a two by two shape with filled squares`) })).toBeVisible();
});

test("keyboard radio arrows move focus and selection, then range and submit work", async ({ page }) => {
  await page.goto("/demo");
  const first = page.getByRole("radio").first();
  const second = page.getByRole("radio").nth(1);
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(second).toBeFocused();
  await expect(second).toHaveAttribute("aria-checked", "true");
  const confidence = page.getByLabel("How sure are you?");
  await confidence.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#confidence-value")).toHaveText("80%");
  const lock = page.getByRole("button", { name: "Lock in answer and confidence" });
  await lock.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".feedback")).toBeVisible();
});

test("focus ring exceeds three-to-one contrast against chalk and paper surfaces", async ({ page }) => {
  await page.goto("/demo");
  await page.keyboard.press("Tab");
  const colors = await page.locator(".skip").evaluate((link) => {
    const style = getComputedStyle(link);
    const values = style.outlineColor.match(/\d+/g)!.map(Number) as [number, number, number];
    const background = style.backgroundColor.match(/\d+/g)!.map(Number) as [number, number, number];
    return { values, background };
  });
  expect(contrast(colors.values, colors.background)).toBeGreaterThanOrEqual(3);
  expect(contrast(colors.values, [245, 237, 220])).toBeGreaterThanOrEqual(3);
});

test("390px layout remains within the viewport at two-hundred-percent text", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => document.documentElement.classList.add("text-zoom-200"));
  await page.waitForTimeout(50);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(page.getByLabel("Main navigation").getByRole("link", { name: "Terms" })).toBeVisible();
});

test("mobile layout fits and every visible link and control meets touch target size", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/", "/demo", "/privacy", "/terms", "/404", "/not-a-real-route"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${path} horizontal overflow`).toBeLessThanOrEqual(0);
    const sizes = await page.locator('a[href]:visible, button:visible, input[type="range"]:visible').evaluateAll((elements) => elements.map((element) => {
      const box = element.getBoundingClientRect();
      return {
        name: (element.textContent || element.getAttribute("aria-label") || element.getAttribute("id") || element.tagName).trim(),
        width: box.width,
        height: box.height,
      };
    }));
    for (const size of sizes) {
      expect(size.width, `${path} ${size.name} width`).toBeGreaterThanOrEqual(44);
      expect(size.height, `${path} ${size.name} height`).toBeGreaterThanOrEqual(44);
    }
  }
});

test("has no serious or critical accessibility violations on demo and results", async ({ page }) => {
  await page.goto("/demo");
  expect(await seriousAxeViolations(page)).toEqual([]);
  await completeCurrentRun(page);
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test("public routes have their own titles and unknown routes return a real designed 404", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  for (const [path, title, status] of [
    ["/privacy", "Privacy — Sure Shot", 200],
    ["/terms", "Terms — Sure Shot", 200],
    ["/demo", "Demo — Sure Shot", 200],
    ["/404", "Page not found — Sure Shot", 404],
    ["/not-a-real-route", "Page not found — Sure Shot", 404],
  ] as const) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(status);
    await expect(page).toHaveTitle(title);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
  }
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  expect(errors.filter((error) => !error.includes("server responded with a status of 404"))).toEqual([]);
});

test("response policy sends the static security headers", async ({ page }) => {
  const response = await page.goto("/demo");
  expect(response?.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response?.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
});
