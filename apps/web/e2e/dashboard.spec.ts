import { test, expect } from '@playwright/test';

test.describe('Dashboard page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dira-fair/dashboard');
  });

  test('neighborhood table is visible with rows', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('table', { timeout: 10000 });

    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Table should have rows (neighborhoods)
    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('table has at least 15 neighborhoods', async ({ page }) => {
    await page.waitForSelector('table', { timeout: 10000 });

    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(15);
  });

  test('trend chart is visible', async ({ page }) => {
    // Wait for data to load (chart or its container)
    await page.waitForSelector('text=Rent Index Trend', { timeout: 10000 });

    const chartSection = page.getByText('Rent Index Trend');
    await expect(chartSection).toBeVisible();
  });

  test('seasonal indicator is present', async ({ page }) => {
    await page.waitForSelector('text=Seasonal Indicator', { timeout: 10000 });

    const seasonalCard = page.getByText('Seasonal Indicator');
    await expect(seasonalCard).toBeVisible();

    // Should show a demand level
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/low demand|medium demand|high demand/i);
  });
});
