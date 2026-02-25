import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dira-fair/');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/dira-fair/i);
  });

  test('hero headline is visible', async ({ page }) => {
    const headline = page.locator('h1');
    await expect(headline).toContainText('Is Your Tel Aviv Rent');
    await expect(headline).toContainText('Fair?');
  });

  test('rent checker form is present with all fields', async ({ page }) => {
    // Neighborhood dropdown
    const neighborhoodSelect = page.locator('select').first();
    await expect(neighborhoodSelect).toBeVisible();

    // Rooms dropdown
    const roomsSelect = page.locator('select').nth(1);
    await expect(roomsSelect).toBeVisible();

    // Sqm input
    const sqmInput = page.locator('input[placeholder*="sqm"]');
    await expect(sqmInput).toBeVisible();

    // Rent input
    const rentInput = page.locator('input[placeholder*="rent"]');
    await expect(rentInput).toBeVisible();

    // Submit button
    const submitBtn = page.getByRole('button', { name: /check my rent/i });
    await expect(submitBtn).toBeVisible();
  });

  test('neighborhood dropdown has at least 15 neighborhoods', async ({ page }) => {
    const neighborhoodSelect = page.locator('select').first();
    // Wait for neighborhoods to load (they load via useEffect)
    await page.waitForFunction(() => {
      const select = document.querySelector('select');
      return select && select.options.length > 15;
    }, undefined, { timeout: 10000 });

    const optionCount = await neighborhoodSelect.locator('option').count();
    // At least 15 neighborhoods + 1 placeholder option = 16
    expect(optionCount).toBeGreaterThanOrEqual(16);
  });

  test('stat cards below the fold are visible', async ({ page }) => {
    // The stat cards section with "Average Rent (2BR)", "Year-over-Year Growth", and seasonal tip
    const avgRentCard = page.getByText('Average Rent (2BR)');
    await expect(avgRentCard).toBeVisible();

    const yoyCard = page.getByText('Year-over-Year Growth');
    await expect(yoyCard).toBeVisible();
  });
});
