import { test, expect } from '@playwright/test';

const widths = [320, 768, 1200];

for (const w of widths) {
  test(`snapshot at width ${w}`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('/');
    await page.waitForSelector('text=results');
    await expect(page).toHaveScreenshot(`layout-${w}.png`, { maxDiffPixels: 2 });
  });
}
