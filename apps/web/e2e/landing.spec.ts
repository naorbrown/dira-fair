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
    await expect(headline).toContainText('Is Your Rent');
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
    const sqmInput = page.locator('input[placeholder*="60"]');
    await expect(sqmInput).toBeVisible();

    // Rent input
    const rentInput = page.locator('input[placeholder*="7500"]');
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

  test('rooms dropdown shows Israeli room definitions', async ({ page }) => {
    const roomsSelect = page.locator('select').nth(1);
    const options = await roomsSelect.locator('option').allTextContents();
    // Should include Israeli room count explanations
    expect(options.some(o => o.includes('salon'))).toBeTruthy();
    expect(options.some(o => o.includes('bed'))).toBeTruthy();
  });

  test('Israeli room count note is visible', async ({ page }) => {
    const note = page.getByText(/room count includes the living room/i);
    await expect(note).toBeVisible();
  });

  test('how it works section is visible', async ({ page }) => {
    const section = page.getByText('How It Works');
    await expect(section).toBeVisible();
  });

  test('market snapshot section shows stats', async ({ page }) => {
    const section = page.getByText('Tel Aviv Market Snapshot');
    await expect(section).toBeVisible();

    // Should show avg rent
    const avgRent = page.getByText('Avg Rent (2BR)');
    await expect(avgRent).toBeVisible();
  });

  test('success stories section is visible', async ({ page }) => {
    const section = page.getByText('Tenants Who Negotiated & Won');
    await expect(section).toBeVisible();

    // Should show savings
    const savings = page.getByText(/Saved.*\/yr/);
    await expect(savings.first()).toBeVisible();
  });

  test('data sources section has links to real sources', async ({ page }) => {
    const section = page.getByText('Our Data Sources');
    await expect(section).toBeVisible();

    // Yad2 link
    const yad2Link = page.locator('a[href*="yad2.co.il"]').first();
    await expect(yad2Link).toBeVisible();

    // CBS link
    const cbsLink = page.locator('a[href*="cbs.gov.il"]').first();
    await expect(cbsLink).toBeVisible();
  });

  test('useful resources for tenants are shown', async ({ page }) => {
    const section = page.getByText('Useful Resources for Tenants');
    await expect(section).toBeVisible();

    // Tenant rights link
    const tenantRightsLink = page.locator('a[href*="lawoffice.org.il"]').first();
    await expect(tenantRightsLink).toBeVisible();
  });
});
