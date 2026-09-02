import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

async function completeRun(page: import('@playwright/test').Page) {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'How many marks are on this card?' })).toBeVisible();
  const choose = async (name: string) => { await page.getByRole('radio', { name }).click(); await page.getByRole('button', { name: 'Lock in answer and confidence' }).click(); await page.getByRole('button', { name: 'Next challenge' }).click(); };
  await choose('13');
  await page.waitForTimeout(2100);
  await choose('Pattern B');
  await page.getByRole('button', { name: 'Start timer' }).click();
  await page.getByRole('button', { name: 'Stop timer' }).click();
  await page.getByRole('button', { name: 'Next challenge' }).click();
  await choose('Option B');
  await page.getByRole('radio', { name: '22' }).click();
  await page.getByRole('button', { name: 'Lock in answer and confidence' }).click();
  await page.getByRole('button', { name: 'See calibration' }).click();
}

test('@claim:complete-run demo reaches the calibration screen', async ({ page }) => {
  await completeRun(page);
  await expect(page.getByRole('heading', { name: 'See how your confidence matched' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Confidence by challenge type' })).toBeVisible();
});

test('@claim:restart-run a practice run resets to round one', async ({ page }) => {
  await completeRun(page);
  await page.getByRole('button', { name: 'Play a fresh practice run' }).click();
  await expect(page.getByText('Round 1 of 5 · Visual estimate')).toBeVisible();
});

test('@claim:local-scores scores stay in the browser', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/demo');
  await page.getByRole('radio', { name: '13' }).click();
  await page.getByRole('button', { name: 'Lock in answer and confidence' }).click();
  expect(requests.every(url => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem('demo:active'))).not.toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('sure-shot:active'))).toBeNull();
});

test('@claim:assist-persist timing assist persists after reload', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Use timing assist' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Assist mode on' })).toBeVisible();
});

test('@claim:free-play demo starts without a payment step', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'How many marks are on this card?' })).toBeVisible();
  await expect(page.getByText(/payment|checkout|buy/i)).toHaveCount(0);
});

test('@claim:no-account demo starts without an account step', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'How many marks are on this card?' })).toBeVisible();
  await expect(page.locator('input[type="email"], input[type="password"], form')).toHaveCount(0);
});

test('has no serious or critical accessibility violations on demo', async ({ page }) => {
  await page.goto('/demo');
  await page.addScriptTag({ content: axeSource });
  const results = await page.evaluate(async () => (window as typeof window & { axe: { run: () => Promise<{ violations: Array<{ impact: string | null }> }> } }).axe.run());
  expect(results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);
});

test('loads the demo without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/demo');
  await expect(page).toHaveTitle('Round 1 of 5 — Sure Shot');
  expect(errors).toEqual([]);
});
