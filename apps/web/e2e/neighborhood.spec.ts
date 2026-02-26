import { test, expect } from '@playwright/test';

test.describe('Neighborhood detail pages', () => {
  test('Florentin page shows neighborhood name and listings', async ({ page }) => {
    await page.goto('/dira-fair/neighborhood/florentin');

    // Wait for data to load
    await page.waitForSelector('h1', { timeout: 10000 });

    const heading = page.locator('h1');
    await expect(heading).toContainText('Florentin');

    // Active listings table should be shown
    const listingsHeader = page.getByRole('heading', { name: /Active Listings/ });
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

  test('listings have View links to Yad2', async ({ page }) => {
    await page.goto('/dira-fair/neighborhood/florentin');

    await page.waitForSelector('table', { timeout: 10000 });

    // Each listing row should have a "View" link
    const viewLinks = page.locator('table a[href*="yad2.co.il"]');
    const linkCount = await viewLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('listings show quality scores', async ({ page }) => {
    await page.goto('/dira-fair/neighborhood/florentin');

    await page.waitForSelector('table', { timeout: 10000 });

    // Quality column should show scores
    const qualityScores = page.getByText(/\/100/);
    const scoreCount = await qualityScores.count();
    expect(scoreCount).toBeGreaterThan(0);
  });

  test('Browse on Yad2 button is visible', async ({ page }) => {
    await page.goto('/dira-fair/neighborhood/florentin');

    await page.waitForSelector('h1', { timeout: 10000 });

    const browseButton = page.locator('a[href*="yad2.co.il"]', { hasText: /Browse on Yad2/i });
    await expect(browseButton).toBeVisible();
  });

  test('listings show quality feature badges', async ({ page }) => {
    await page.goto('/dira-fair/neighborhood/old-north');

    await page.waitForSelector('table', { timeout: 10000 });

    // Feature badges in the table (P, Elev, Bal, A/C, Mamad)
    const badges = page.locator('table span:text-matches("^(P|Elev|Bal|A/C|Mamad)$")');
    const badgeCount = await badges.count();
    expect(badgeCount).toBeGreaterThan(0);
  });
});
