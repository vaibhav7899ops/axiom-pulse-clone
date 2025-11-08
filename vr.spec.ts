import { test, expect } from '@playwright/test';

test('pulse table visual regression', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('text=results');
  await expect(page).toHaveScreenshot('pulse-table.png', { maxDiffPixels: 2 });
});
