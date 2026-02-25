import { test, expect } from '@playwright/test';

test.describe('Neighborhood detail pages', () => {
  test('Florentin page shows neighborhood name and listings', async ({ page }) => {
    await page.goto('/dira-fair/neighborhood/florentin');

    // Wait for data to load
    await page.waitForSelector('h1', { timeout: 10000 });

    const heading = page.locator('h1');
    await expect(heading).toContainText('Florentin');

    // Active listings table should be shown (Florentin has 5 listings)
    const listingsHeader = page.getByRole('heading', { name: 'Active Listings' });
    await expect(listingsHeader).toBeVisible();

    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('Neve Tzedek page shows neighborhood name', async ({ page }) => {
    await page.goto('/dira-fair/neighborhood/neve-tzedek');

    await page.waitForSelector('h1', { timeout: 10000 });

    const heading = page.locator('h1');
    await expect(heading).toContainText('Neve Tzedek');
  });
});
