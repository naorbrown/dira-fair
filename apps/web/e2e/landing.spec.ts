import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dira-fair/');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/DiraFair/i);
  });

  test('hero headline is visible', async ({ page }) => {
    const headline = page.locator('h1');
    await expect(headline).toContainText('Is Your Rent');
    await expect(headline).toContainText('Fair?');
  });

  test('rent checker form has address input and rooms dropdown', async ({ page }) => {
    // Address autocomplete input (default mode)
    const addressInput = page.locator('input[placeholder*="address"]');
    await expect(addressInput).toBeVisible();

    // "Or select neighborhood" toggle
    const toggleBtn = page.getByText(/select neighborhood/i);
    await expect(toggleBtn).toBeVisible();

    // Rooms dropdown
    const roomsSelect = page.locator('select');
    await expect(roomsSelect.first()).toBeVisible();

    // Sqm input
    const sqmInput = page.locator('input[placeholder*="60"]');
    await expect(sqmInput).toBeVisible();

    // Rent input
    const rentInput = page.locator('input[placeholder*="7500"]');
    await expect(rentInput).toBeVisible();

    // Submit button
    const submitBtn = page.getByRole('button', { name: /check my rent/i });
    await expect(submitBtn).toBeVisible();
  });

  test('manual neighborhood mode has at least 15 options', async ({ page }) => {
    // Switch to manual neighborhood select
    const toggleBtn = page.getByText(/select neighborhood/i);
    await toggleBtn.click();

    // Wait for neighborhoods to load
    await page.waitForFunction(() => {
      const selects = document.querySelectorAll('select');
      return selects.length > 0 && selects[0].options.length > 15;
    }, undefined, { timeout: 10000 });

    const neighborhoodSelect = page.locator('select').first();
    const optionCount = await neighborhoodSelect.locator('option').count();
    expect(optionCount).toBeGreaterThanOrEqual(16);
  });

  test('rooms dropdown shows Israeli room definitions', async ({ page }) => {
    const roomsSelect = page.locator('select').first();
    const options = await roomsSelect.locator('option').allTextContents();
    expect(options.some(o => o.includes('salon'))).toBeTruthy();
    expect(options.some(o => o.includes('bed'))).toBeTruthy();
  });

  test('Israeli room count note is visible', async ({ page }) => {
    const note = page.getByText(/room count includes the living room/i);
    await expect(note).toBeVisible();
  });

  test('listing count and source info are shown', async ({ page }) => {
    // The subtitle shows listing count, sources, and neighborhoods
    const listingInfo = page.getByText(/listings/i);
    await expect(listingInfo.first()).toBeVisible();

    const sourcesInfo = page.getByText(/sources/i);
    await expect(sourcesInfo.first()).toBeVisible();

    const neighborhoodsInfo = page.getByText(/neighborhoods/i);
    await expect(neighborhoodsInfo.first()).toBeVisible();
  });
});
