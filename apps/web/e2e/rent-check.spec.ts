import { test, expect } from '@playwright/test';

test.describe('Rent check flow', () => {
  test('fill form and navigate to check page - Florentin 3-room 8000', async ({ page }) => {
    await page.goto('/dira-fair/');

    // Wait for neighborhoods to load
    await page.waitForFunction(() => {
      const select = document.querySelector('select');
      return select && select.options.length > 15;
    }, undefined, { timeout: 10000 });

    // Select Florentin (id=1, first neighborhood)
    const neighborhoodSelect = page.locator('select').first();
    await neighborhoodSelect.selectOption('1');

    // Select 3 rooms (default is now 3)
    const roomsSelect = page.locator('select').nth(1);
    await roomsSelect.selectOption('3');

    // Enter sqm
    const sqmInput = page.locator('input[placeholder*="60"]');
    await sqmInput.fill('50');

    // Enter rent
    const rentInput = page.locator('input[placeholder*="7500"]');
    await rentInput.fill('8000');

    // Click submit
    const submitBtn = page.getByRole('button', { name: /check my rent/i });
    await submitBtn.click();

    // Wait for navigation to /check page
    await page.waitForURL(/\/check\?/);

    // Wait for results to render (verdict banner)
    await page.waitForSelector('text=/below market|above market|Fair price/i', { timeout: 10000 });

    // Score card should be visible
    const scoreCard = page.locator('[class*="rounded"]').filter({ hasText: /Above Market|At Market|Below Market/ });
    await expect(scoreCard.first()).toBeVisible();
  });

  test('Neve Tzedek 2-room 12000 - above market with alternatives', async ({ page }) => {
    // Neve Tzedek is id=5, 2br avg is ~11000
    await page.goto('/dira-fair/check?neighborhood=5&rooms=2&sqm=52&rent=12000');

    await page.waitForSelector('text=/above market|below market|Fair price/i', { timeout: 10000 });

    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/above market|overpaying/i);

    // Should show Yad2 link for comparable listings
    const yad2Links = page.locator('a[href*="yad2.co.il"]');
    const linkCount = await yad2Links.count();
    expect(linkCount).toBeGreaterThan(0);

    // Should show quality badges
    const qualityBadge = page.getByText(/Quality:.*\/100/);
    await expect(qualityBadge.first()).toBeVisible();
  });

  test('Florentin 2-room 4000 - below market', async ({ page }) => {
    // Florentin 2br avg is ~6400, 4000 is well below
    await page.goto('/dira-fair/check?neighborhood=1&rooms=2&sqm=50&rent=4000');

    await page.waitForSelector('text=/below market|above market|Fair price/i', { timeout: 10000 });

    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/below market|saving/i);
  });

  test('comparable listings show quality features', async ({ page }) => {
    await page.goto('/dira-fair/check?neighborhood=1&rooms=2&sqm=50&rent=7000');

    await page.waitForSelector('text=/below market|above market|Fair price/i', { timeout: 10000 });

    // Quality badges should be visible (Parking, Elevator, A/C, etc.)
    const featureBadges = page.locator('text=/Parking|Elevator|A\\/C|Mamad|Balcony/');
    const badgeCount = await featureBadges.count();
    expect(badgeCount).toBeGreaterThan(0);
  });

  test('above market shows success story and alternatives', async ({ page }) => {
    await page.goto('/dira-fair/check?neighborhood=5&rooms=2&sqm=52&rent=14000');

    await page.waitForSelector('text=/above market|overpaying/i', { timeout: 10000 });

    // Should show success story
    const successStory = page.getByText('Others Have Done It');
    await expect(successStory).toBeVisible();

    // Should show alternative neighborhoods
    const alternatives = page.getByText('Consider Nearby Neighborhoods');
    await expect(alternatives).toBeVisible();
  });

  test('check page has data source attribution with links', async ({ page }) => {
    await page.goto('/dira-fair/check?neighborhood=1&rooms=2&sqm=50&rent=7000');

    await page.waitForSelector('text=/below market|above market|Fair price/i', { timeout: 10000 });

    // Should have source links at the bottom
    const yad2Source = page.locator('a[href*="yad2.co.il"]');
    const sourceCount = await yad2Source.count();
    expect(sourceCount).toBeGreaterThan(0);
  });
});
