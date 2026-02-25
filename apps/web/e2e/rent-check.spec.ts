import { test, expect } from '@playwright/test';

test.describe('Rent check flow', () => {
  test('fill form and navigate to check page - Florentin 2br 8000', async ({ page }) => {
    await page.goto('/dira-fair/');

    // Wait for neighborhoods to load
    await page.waitForFunction(() => {
      const select = document.querySelector('select');
      return select && select.options.length > 15;
    }, undefined, { timeout: 10000 });

    // Select Florentin (id=1, first neighborhood)
    const neighborhoodSelect = page.locator('select').first();
    await neighborhoodSelect.selectOption('1');

    // Select 2 rooms (default)
    const roomsSelect = page.locator('select').nth(1);
    await roomsSelect.selectOption('2');

    // Enter sqm
    const sqmInput = page.locator('input[placeholder*="sqm"]');
    await sqmInput.fill('50');

    // Enter rent
    const rentInput = page.locator('input[placeholder*="rent"]');
    await rentInput.fill('8000');

    // Click submit
    const submitBtn = page.getByRole('button', { name: /check my rent/i });
    await submitBtn.click();

    // Wait for navigation to /check page
    await page.waitForURL(/\/check\?/);

    // Wait for results to render
    await page.waitForSelector('h1:has-text("Your Rent Check Results")', { timeout: 10000 });

    // Score should be shown
    const scoreCard = page.locator('[class*="rounded"]').filter({ hasText: /Above Market|At Market|Below Market/ });
    await expect(scoreCard.first()).toBeVisible();

    // Market Signals section
    const signalsHeader = page.getByText('Market Signals');
    await expect(signalsHeader).toBeVisible();

    // Negotiation Tips section
    const tipsHeader = page.getByText('Negotiation Tips');
    await expect(tipsHeader).toBeVisible();

    // Comparable Listings table
    const comparablesHeader = page.getByText('Comparable Listings');
    await expect(comparablesHeader).toBeVisible();
  });

  test('Neve Tzedek 2br 12000 - above market', async ({ page }) => {
    // Neve Tzedek is id=5, 2br avg is 11000 from our data
    await page.goto('/dira-fair/check?neighborhood=5&rooms=2&sqm=52&rent=12000');

    await page.waitForSelector('h1:has-text("Your Rent Check Results")', { timeout: 10000 });

    // Should show above market
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/Above Market/i);
  });

  test('Florentin 2br 4000 - below market', async ({ page }) => {
    // Florentin 2br avg is ~6400, 4000 is well below
    await page.goto('/dira-fair/check?neighborhood=1&rooms=2&sqm=50&rent=4000');

    await page.waitForSelector('h1:has-text("Your Rent Check Results")', { timeout: 10000 });

    // Should show below market
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/Below Market/i);
  });
});
