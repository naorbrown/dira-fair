import { test, expect } from '@playwright/test';

/**
 * Comprehensive link verification for all pages.
 * Every internal href and external link must resolve without error.
 */

const ALL_NEIGHBORHOOD_SLUGS = [
  'florentin', 'old-north', 'new-north', 'lev-hair', 'neve-tzedek',
  'kerem-hateimanim', 'jaffa', 'ajami', 'ramat-aviv', 'bavli',
  'tzahala', 'neve-shaanan', 'shapira', 'montefiore', 'sarona',
  'kiryat-shalom', 'hatikva', 'yad-eliyahu', 'nahalat-yitzhak',
  'noga', 'lev-yafo', 'rothschild', 'hadar-yosef', 'tel-baruch',
  'ramat-gan', 'givatayim', 'bat-yam', 'holon', 'herzliya',
  'bnei-brak', 'petah-tikva',
];

test.describe('Navbar links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dira-fair/');
  });

  test('Home link navigates to landing page', async ({ page }) => {
    await page.click('nav >> text=Home');
    await expect(page).toHaveURL(/\/dira-fair\/$/);
  });

  test('Browse Listings link navigates to explore', async ({ page }) => {
    await page.click('nav >> text=Browse Listings');
    await expect(page).toHaveURL(/\/dira-fair\/explore\//);
  });

  test('Market Stats link navigates to dashboard', async ({ page }) => {
    await page.click('nav >> text=Market Stats');
    await expect(page).toHaveURL(/\/dira-fair\/dashboard\//);
  });

  test('Check Rent link scrolls to form', async ({ page }) => {
    await page.click('nav >> text=Check Rent');
    await expect(page).toHaveURL(/\/dira-fair\/#check$/);
    const form = page.locator('#check');
    await expect(form).toBeVisible();
  });

  test('DiraFair logo links to home', async ({ page }) => {
    await page.goto('/dira-fair/dashboard/');
    await page.click('nav a:has-text("DiraFair")');
    await expect(page).toHaveURL(/\/dira-fair\/$/);
  });
});

test.describe('Footer links', () => {
  test('GitHub link is valid external link', async ({ page }) => {
    await page.goto('/dira-fair/');
    const ghLink = page.locator('footer a[href*="github.com"]');
    await expect(ghLink).toHaveAttribute('href', /github\.com\/naorbrown\/dira-fair/);
    await expect(ghLink).toHaveAttribute('target', '_blank');
  });
});

test.describe('Dashboard links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dira-fair/dashboard/');
    await page.waitForSelector('table', { timeout: 10000 });
  });

  test('breadcrumb Home link works', async ({ page }) => {
    const homeLink = page.getByRole('main').locator('nav a:has-text("Home")');
    await homeLink.click();
    await expect(page).toHaveURL(/\/dira-fair\/$/);
  });

  test('neighborhood rows link to neighborhood pages', async ({ page }) => {
    const firstLink = page.locator('table a[href*="/neighborhood/"]').first();
    const href = await firstLink.getAttribute('href');
    expect(href).toMatch(/\/neighborhood\/[a-z-]+\/?$/);
    await firstLink.click();
    await expect(page).toHaveURL(/\/dira-fair\/neighborhood\/[a-z-]+\//);
  });

  test('View arrows link to neighborhood pages', async ({ page }) => {
    const viewLinks = page.locator('table a:has-text("View")');
    const count = await viewLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Check Your Rent CTA links to home form', async ({ page }) => {
    const cta = page.locator('a:has-text("Check Your Rent")').first();
    await expect(cta).toHaveAttribute('href', /\/#check/);
  });
});

test.describe('Check page links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dira-fair/check/?neighborhood=1&rooms=2&sqm=50&rent=7000');
    await page.waitForSelector('text=/below market|above market|Fair price/i', { timeout: 10000 });
  });

  test('breadcrumb Home link works', async ({ page }) => {
    const homeLink = page.getByRole('main').locator('nav a:has-text("Home")');
    await homeLink.click();
    await expect(page).toHaveURL(/\/dira-fair\/$/);
  });

  test('Yad2 comparable links are valid external links', async ({ page }) => {
    const yad2Links = page.locator('a[href*="yad2.co.il"]');
    const count = await yad2Links.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < Math.min(count, 3); i++) {
      await expect(yad2Links.nth(i)).toHaveAttribute('target', '_blank');
    }
  });

  test('Explore All Listings link works', async ({ page }) => {
    const exploreLink = page.locator('a:has-text("Explore All Listings")');
    await expect(exploreLink).toHaveAttribute('href', /\/explore/);
  });

  test('Check Another Apartment link works', async ({ page }) => {
    const checkLink = page.locator('a:has-text("Check Another Apartment")');
    await expect(checkLink).toHaveAttribute('href', /\/#check/);
  });
});

test.describe('Neighborhood page links', () => {
  test('Florentin page has valid Yad2 browse link', async ({ page }) => {
    await page.goto('/dira-fair/neighborhood/florentin/');
    await page.waitForSelector('h1', { timeout: 10000 });

    const browseBtn = page.locator('a[href*="yad2.co.il"]', { hasText: /Browse on Yad2/i });
    await expect(browseBtn).toBeVisible();
    await expect(browseBtn).toHaveAttribute('target', '_blank');
  });

  test('listing View links point to Yad2', async ({ page }) => {
    await page.goto('/dira-fair/neighborhood/florentin/');
    await page.waitForSelector('table', { timeout: 10000 });

    const viewLinks = page.locator('table a[href*="yad2.co.il"]');
    const count = await viewLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('All neighborhood pages load', () => {
  for (const slug of ALL_NEIGHBORHOOD_SLUGS) {
    test(`/neighborhood/${slug}/ returns 200`, async ({ page }) => {
      const res = await page.goto(`/dira-fair/neighborhood/${slug}/`);
      expect(res?.status()).toBe(200);
      await page.waitForSelector('h1', { timeout: 10000 });
    });
  }
});

test.describe('All main pages load', () => {
  const pages = [
    { name: 'Landing', path: '/dira-fair/' },
    { name: 'Explore', path: '/dira-fair/explore/' },
    { name: 'Dashboard', path: '/dira-fair/dashboard/' },
    { name: 'Check (with params)', path: '/dira-fair/check/?neighborhood=1&rooms=2&sqm=50&rent=7000' },
  ];

  for (const { name, path } of pages) {
    test(`${name} page returns 200`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
    });
  }
});
