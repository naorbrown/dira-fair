/**
 * Static data embedded directly in the frontend.
 *
 * Sources:
 *   - Neighborhoods: apps/api/data/neighborhoods.json (19 Tel Aviv neighborhoods)
 *   - Listings: apps/api/api/scrapers/yad2.py seed data (25 Yad2 listings)
 *   - CBS rent stats: apps/api/api/scrapers/cbs.py seed data
 *   - Rent index: generated 24-month time series matching CBS scraper logic
 *   - Seasonal data: apps/api/api/routers/stats.py + services/market_signals.py
 */

import type {
  Neighborhood,
  RentalListing,
  TrendEntry,
  SeasonalData,
} from "./types";

// ---------------------------------------------------------------------------
// Neighborhoods (from apps/api/data/neighborhoods.json)
// The frontend Neighborhood type uses `slug` and `id` (numeric). The backend
// uses string IDs that serve as slugs. We keep the backend's string ID as
// `slug` and assign a sequential numeric `id` for the frontend.
// ---------------------------------------------------------------------------

interface NeighborhoodSeed {
  id: string; // backend string id = slug
  name_en: string;
  name_he: string;
  lat: number;
  lng: number;
  avg_rent_1br: number | null;
  avg_rent_2br: number | null;
  avg_rent_3br: number | null;
  avg_rent_4br: number | null;
  avg_price_sqm: number;
}

const RAW_NEIGHBORHOODS: NeighborhoodSeed[] = [
  { id: "florentin", name_en: "Florentin", name_he: "\u05e4\u05dc\u05d5\u05e8\u05e0\u05d8\u05d9\u05df", lat: 32.056, lng: 34.769, avg_rent_1br: 5500, avg_rent_2br: 6500, avg_rent_3br: 8500, avg_rent_4br: 11000, avg_price_sqm: 45000 },
  { id: "old-north", name_en: "Old North", name_he: "\u05d4\u05e6\u05e4\u05d5\u05df \u05d4\u05d9\u05e9\u05df", lat: 32.087, lng: 34.774, avg_rent_1br: 6500, avg_rent_2br: 9500, avg_rent_3br: 12000, avg_rent_4br: 15000, avg_price_sqm: 58000 },
  { id: "new-north", name_en: "New North", name_he: "\u05d4\u05e6\u05e4\u05d5\u05df \u05d4\u05d7\u05d3\u05e9", lat: 32.092, lng: 34.782, avg_rent_1br: 7000, avg_rent_2br: 10000, avg_rent_3br: 13000, avg_rent_4br: 16000, avg_price_sqm: 62000 },
  { id: "lev-hair", name_en: "City Center", name_he: "\u05dc\u05d1 \u05d4\u05e2\u05d9\u05e8", lat: 32.067, lng: 34.773, avg_rent_1br: 6000, avg_rent_2br: 8500, avg_rent_3br: 12000, avg_rent_4br: 15500, avg_price_sqm: 55000 },
  { id: "neve-tzedek", name_en: "Neve Tzedek", name_he: "\u05e0\u05d5\u05d5\u05d4 \u05e6\u05d3\u05e7", lat: 32.060, lng: 34.766, avg_rent_1br: 7500, avg_rent_2br: 11000, avg_rent_3br: 15000, avg_rent_4br: 20000, avg_price_sqm: 70000 },
  { id: "kerem-hateimanim", name_en: "Kerem HaTeimanim", name_he: "\u05db\u05e8\u05dd \u05d4\u05ea\u05d9\u05de\u05e0\u05d9\u05dd", lat: 32.065, lng: 34.764, avg_rent_1br: 5500, avg_rent_2br: 7000, avg_rent_3br: 10000, avg_rent_4br: null, avg_price_sqm: 50000 },
  { id: "jaffa", name_en: "Jaffa", name_he: "\u05d9\u05e4\u05d5", lat: 32.050, lng: 34.751, avg_rent_1br: 4200, avg_rent_2br: 5800, avg_rent_3br: 7500, avg_rent_4br: 9500, avg_price_sqm: 35000 },
  { id: "ajami", name_en: "Ajami", name_he: "\u05e2\u05d2'\u05de\u05d9", lat: 32.046, lng: 34.749, avg_rent_1br: 3800, avg_rent_2br: 5200, avg_rent_3br: 6800, avg_rent_4br: 8500, avg_price_sqm: 30000 },
  { id: "ramat-aviv", name_en: "Ramat Aviv", name_he: "\u05e8\u05de\u05ea \u05d0\u05d1\u05d9\u05d1", lat: 32.113, lng: 34.797, avg_rent_1br: 5500, avg_rent_2br: 8000, avg_rent_3br: 10500, avg_rent_4br: 13000, avg_price_sqm: 50000 },
  { id: "bavli", name_en: "Bavli", name_he: "\u05d1\u05d1\u05dc\u05d9", lat: 32.098, lng: 34.788, avg_rent_1br: 5800, avg_rent_2br: 8500, avg_rent_3br: 11000, avg_rent_4br: 14000, avg_price_sqm: 55000 },
  { id: "tzahala", name_en: "Tzahala", name_he: "\u05e6\u05d4\u05dc\u05d4", lat: 32.120, lng: 34.810, avg_rent_1br: 6000, avg_rent_2br: 9000, avg_rent_3br: 12000, avg_rent_4br: 16000, avg_price_sqm: 48000 },
  { id: "neve-shaanan", name_en: "Neve Sha'anan", name_he: "\u05e0\u05d5\u05d5\u05d4 \u05e9\u05d0\u05e0\u05df", lat: 32.059, lng: 34.776, avg_rent_1br: 3500, avg_rent_2br: 5000, avg_rent_3br: 6500, avg_rent_4br: 8000, avg_price_sqm: 27000 },
  { id: "shapira", name_en: "Shapira", name_he: "\u05e9\u05e4\u05d9\u05e8\u05d0", lat: 32.055, lng: 34.775, avg_rent_1br: 4000, avg_rent_2br: 5500, avg_rent_3br: 7200, avg_rent_4br: 9000, avg_price_sqm: 30000 },
  { id: "montefiore", name_en: "Montefiore", name_he: "\u05de\u05d5\u05e0\u05d8\u05d9\u05e4\u05d9\u05d5\u05e8\u05d9", lat: 32.062, lng: 34.770, avg_rent_1br: 6000, avg_rent_2br: 8000, avg_rent_3br: 11000, avg_rent_4br: 14500, avg_price_sqm: 58000 },
  { id: "sarona", name_en: "Sarona", name_he: "\u05e9\u05e8\u05d5\u05e0\u05d4", lat: 32.073, lng: 34.785, avg_rent_1br: 7500, avg_rent_2br: 11000, avg_rent_3br: 15000, avg_rent_4br: 19000, avg_price_sqm: 72000 },
  { id: "kiryat-shalom", name_en: "Kiryat Shalom", name_he: "\u05e7\u05e8\u05d9\u05ea \u05e9\u05dc\u05d5\u05dd", lat: 32.054, lng: 34.782, avg_rent_1br: 3200, avg_rent_2br: 4500, avg_rent_3br: 6000, avg_rent_4br: 7500, avg_price_sqm: 24000 },
  { id: "hatikva", name_en: "HaTikva", name_he: "\u05d4\u05ea\u05e7\u05d5\u05d5\u05d4", lat: 32.052, lng: 34.790, avg_rent_1br: 3000, avg_rent_2br: 4200, avg_rent_3br: 5500, avg_rent_4br: 7000, avg_price_sqm: 22000 },
  { id: "yad-eliyahu", name_en: "Yad Eliyahu", name_he: "\u05d9\u05d3 \u05d0\u05dc\u05d9\u05d4\u05d5", lat: 32.058, lng: 34.791, avg_rent_1br: 4500, avg_rent_2br: 6500, avg_rent_3br: 8500, avg_rent_4br: 10500, avg_price_sqm: 38000 },
  { id: "nahalat-yitzhak", name_en: "Nahalat Yitzhak", name_he: "\u05e0\u05d7\u05dc\u05ea \u05d9\u05e6\u05d7\u05e7", lat: 32.073, lng: 34.795, avg_rent_1br: 5000, avg_rent_2br: 7200, avg_rent_3br: 9500, avg_rent_4br: 12000, avg_price_sqm: 42000 },
];

// Build the neighborhoods array the frontend expects.
// The frontend Neighborhood type has a numeric `id` and a `slug` field.
export const NEIGHBORHOODS: Neighborhood[] = RAW_NEIGHBORHOODS.map(
  (n, index) => ({
    id: index + 1,
    slug: n.id,
    name_en: n.name_en,
    name_he: n.name_he,
    avg_rent_2br: n.avg_rent_2br,
    avg_price_per_sqm: n.avg_price_sqm
      ? Math.round(
          (n.avg_rent_2br ?? 6500) / 75 // approximate rent-per-sqm
        )
      : null,
    listing_count: 0, // will be computed below after listings are defined
  })
);

// Helper: get raw neighborhood by slug
export function getRawNeighborhood(slug: string): NeighborhoodSeed | undefined {
  return RAW_NEIGHBORHOODS.find((n) => n.id === slug);
}

// Helper: get rent for a given room count from raw neighborhood data
export function getNeighborhoodRent(
  slug: string,
  rooms: number
): number | null {
  const n = getRawNeighborhood(slug);
  if (!n) return null;

  // Round rooms to nearest 0.5 for lookup
  const rounded = Math.round(rooms * 2) / 2;

  if (rounded <= 1) return n.avg_rent_1br;
  if (rounded <= 1.5) {
    // interpolate between 1br and 2br
    const r1 = n.avg_rent_1br;
    const r2 = n.avg_rent_2br;
    if (r1 != null && r2 != null) return Math.round((r1 + r2) / 2);
    return r1 ?? r2;
  }
  if (rounded <= 2) return n.avg_rent_2br;
  if (rounded <= 2.5) {
    const r2 = n.avg_rent_2br;
    const r3 = n.avg_rent_3br;
    if (r2 != null && r3 != null) return Math.round((r2 + r3) / 2);
    return r2 ?? r3;
  }
  if (rounded <= 3) return n.avg_rent_3br;
  if (rounded <= 3.5) {
    const r3 = n.avg_rent_3br;
    const r4 = n.avg_rent_4br;
    if (r3 != null && r4 != null) return Math.round((r3 + r4) / 2);
    return r3 ?? r4;
  }
  if (rounded <= 4) return n.avg_rent_4br;
  // 4.5+ rooms: extrapolate from 4br
  if (n.avg_rent_4br != null) return Math.round(n.avg_rent_4br * 1.2);
  return null;
}

// ---------------------------------------------------------------------------
// Yad2 Rental Listings (from apps/api/api/scrapers/yad2.py seed data)
// ---------------------------------------------------------------------------

interface ListingSeed {
  id: string;
  address: string;
  neighborhood_id: string; // maps to our slug
  rooms: number;
  sqm: number;
  price: number;
  days_on_market: number;
}

const RAW_LISTINGS: ListingSeed[] = [
  // Florentin (5 listings)
  { id: "yad2-001", address: "\u05e4\u05dc\u05d5\u05e8\u05e0\u05d8\u05d9\u05df 32", neighborhood_id: "florentin", rooms: 2, sqm: 50, price: 6400, days_on_market: 12 },
  { id: "yad2-002", address: "\u05e4\u05dc\u05d5\u05e8\u05e0\u05d8\u05d9\u05df 55", neighborhood_id: "florentin", rooms: 2, sqm: 48, price: 6200, days_on_market: 8 },
  { id: "yad2-003", address: "\u05e4\u05dc\u05d5\u05e8\u05e0\u05d8\u05d9\u05df 10", neighborhood_id: "florentin", rooms: 3, sqm: 70, price: 8800, days_on_market: 5 },
  { id: "yad2-004", address: "\u05e4\u05dc\u05d5\u05e8\u05e0\u05d8\u05d9\u05df 28", neighborhood_id: "florentin", rooms: 2.5, sqm: 55, price: 7200, days_on_market: 14 },
  { id: "yad2-022", address: "\u05e4\u05dc\u05d5\u05e8\u05e0\u05d8\u05d9\u05df 40", neighborhood_id: "florentin", rooms: 1, sqm: 35, price: 5300, days_on_market: 10 },
  // Old North (4 listings)
  { id: "yad2-005", address: "\u05d3\u05d9\u05d6\u05e0\u05d2\u05d5\u05e3 180", neighborhood_id: "old-north", rooms: 3, sqm: 75, price: 12200, days_on_market: 3 },
  { id: "yad2-006", address: "\u05d3\u05d9\u05d6\u05e0\u05d2\u05d5\u05e3 220", neighborhood_id: "old-north", rooms: 2, sqm: 55, price: 9200, days_on_market: 7 },
  { id: "yad2-007", address: "\u05d3\u05d9\u05d6\u05e0\u05d2\u05d5\u05e3 150", neighborhood_id: "old-north", rooms: 3.5, sqm: 85, price: 13500, days_on_market: 2 },
  { id: "yad2-008", address: "\u05d0\u05d1\u05df \u05d2\u05d1\u05d9\u05e8\u05d5\u05dc 100", neighborhood_id: "old-north", rooms: 2.5, sqm: 60, price: 10200, days_on_market: 10 },
  // City Center (3 listings)
  { id: "yad2-009", address: "\u05e8\u05d5\u05d8\u05e9\u05d9\u05dc\u05d3 35", neighborhood_id: "lev-hair", rooms: 2, sqm: 55, price: 8800, days_on_market: 6 },
  { id: "yad2-010", address: "\u05e9\u05d9\u05e0\u05e7\u05d9\u05df 20", neighborhood_id: "lev-hair", rooms: 2, sqm: 50, price: 8200, days_on_market: 9 },
  { id: "yad2-011", address: "\u05e8\u05d5\u05d8\u05e9\u05d9\u05dc\u05d3 70", neighborhood_id: "lev-hair", rooms: 3, sqm: 80, price: 12500, days_on_market: 4 },
  // Neve Tzedek (4 listings)
  { id: "yad2-012", address: "\u05e9\u05d1\u05d6\u05d9 8", neighborhood_id: "neve-tzedek", rooms: 2, sqm: 52, price: 10800, days_on_market: 11 },
  { id: "yad2-013", address: "\u05e9\u05d1\u05d6\u05d9 25", neighborhood_id: "neve-tzedek", rooms: 3, sqm: 78, price: 15200, days_on_market: 7 },
  { id: "yad2-026", address: "\u05e0\u05d7\u05dc\u05ea \u05d1\u05e0\u05d9\u05de\u05d9\u05df 12", neighborhood_id: "neve-tzedek", rooms: 2, sqm: 48, price: 10500, days_on_market: 4 },
  { id: "yad2-027", address: "\u05e9\u05d1\u05d6\u05d9 42", neighborhood_id: "neve-tzedek", rooms: 4, sqm: 110, price: 20500, days_on_market: 6 },
  // Jaffa (2 listings)
  { id: "yad2-014", address: "\u05d9\u05e4\u05d5 120", neighborhood_id: "jaffa", rooms: 2, sqm: 45, price: 5600, days_on_market: 15 },
  { id: "yad2-015", address: "\u05d9\u05e4\u05d5 80", neighborhood_id: "jaffa", rooms: 3, sqm: 65, price: 7800, days_on_market: 10 },
  // Ramat Aviv (2 listings)
  { id: "yad2-016", address: "\u05e8\u05de\u05ea \u05d0\u05d1\u05d9\u05d1 15", neighborhood_id: "ramat-aviv", rooms: 3, sqm: 80, price: 10800, days_on_market: 8 },
  { id: "yad2-017", address: "\u05e8\u05de\u05ea \u05d0\u05d1\u05d9\u05d1 40", neighborhood_id: "ramat-aviv", rooms: 4, sqm: 100, price: 13500, days_on_market: 5 },
  // Bavli (2 listings)
  { id: "yad2-018", address: "\u05d1\u05d1\u05dc\u05d9 8", neighborhood_id: "bavli", rooms: 3, sqm: 85, price: 11200, days_on_market: 6 },
  { id: "yad2-019", address: "\u05d1\u05d1\u05dc\u05d9 22", neighborhood_id: "bavli", rooms: 4, sqm: 105, price: 14500, days_on_market: 3 },
  // Neve Sha'anan (1 listing)
  { id: "yad2-020", address: "\u05e0\u05d5\u05d5\u05d4 \u05e9\u05d0\u05e0\u05df 5", neighborhood_id: "neve-shaanan", rooms: 2, sqm: 42, price: 4800, days_on_market: 18 },
  // Shapira (1 listing)
  { id: "yad2-021", address: "\u05e9\u05e4\u05d9\u05e8\u05d0 12", neighborhood_id: "shapira", rooms: 2.5, sqm: 55, price: 5800, days_on_market: 13 },
  // Old North extra (2 listings)
  { id: "yad2-023", address: "\u05d3\u05d9\u05d6\u05e0\u05d2\u05d5\u05e3 100", neighborhood_id: "old-north", rooms: 2, sqm: 52, price: 9600, days_on_market: 11 },
  { id: "yad2-024", address: "\u05d0\u05d1\u05df \u05d2\u05d1\u05d9\u05e8\u05d5\u05dc 200", neighborhood_id: "old-north", rooms: 3, sqm: 72, price: 11800, days_on_market: 9 },
  // Kerem HaTeimanim (3 listings)
  { id: "yad2-025", address: "\u05db\u05e8\u05dd \u05d4\u05ea\u05d9\u05de\u05e0\u05d9\u05dd 5", neighborhood_id: "kerem-hateimanim", rooms: 2, sqm: 48, price: 7200, days_on_market: 7 },
  { id: "yad2-028", address: "\u05db\u05e8\u05dd \u05d4\u05ea\u05d9\u05de\u05e0\u05d9\u05dd 18", neighborhood_id: "kerem-hateimanim", rooms: 3, sqm: 65, price: 10200, days_on_market: 5 },
  { id: "yad2-029", address: "\u05db\u05e8\u05dd \u05d4\u05ea\u05d9\u05de\u05e0\u05d9\u05dd 30", neighborhood_id: "kerem-hateimanim", rooms: 1, sqm: 32, price: 5200, days_on_market: 3 },
  // Montefiore (3 listings)
  { id: "yad2-030", address: "\u05de\u05d5\u05e0\u05d8\u05d9\u05e4\u05d9\u05d5\u05e8\u05d9 15", neighborhood_id: "montefiore", rooms: 2, sqm: 52, price: 8200, days_on_market: 9 },
  { id: "yad2-031", address: "\u05de\u05d5\u05e0\u05d8\u05d9\u05e4\u05d9\u05d5\u05e8\u05d9 8", neighborhood_id: "montefiore", rooms: 3, sqm: 75, price: 11200, days_on_market: 4 },
  { id: "yad2-032", address: "\u05de\u05d5\u05e0\u05d8\u05d9\u05e4\u05d9\u05d5\u05e8\u05d9 22", neighborhood_id: "montefiore", rooms: 4, sqm: 95, price: 14800, days_on_market: 7 },
  // Sarona (1 listing)
  { id: "yad2-033", address: "\u05e9\u05e8\u05d5\u05e0\u05d4 5", neighborhood_id: "sarona", rooms: 2, sqm: 55, price: 11500, days_on_market: 2 },
  // Ajami (1 listing)
  { id: "yad2-034", address: "\u05e2\u05d2'\u05de\u05d9 45", neighborhood_id: "ajami", rooms: 3, sqm: 70, price: 7000, days_on_market: 16 },
  // Yad Eliyahu (1 listing)
  { id: "yad2-035", address: "\u05d9\u05d3 \u05d0\u05dc\u05d9\u05d4\u05d5 20", neighborhood_id: "yad-eliyahu", rooms: 2, sqm: 50, price: 6300, days_on_market: 11 },
];

// Convert to the frontend RentalListing type
export const LISTINGS: RentalListing[] = RAW_LISTINGS.map((l) => ({
  id: RAW_LISTINGS.indexOf(l) + 1,
  address: l.address,
  neighborhood: l.neighborhood_id,
  rooms: l.rooms,
  sqm: l.sqm,
  monthly_rent: l.price,
  price_per_sqm: Math.round((l.price / l.sqm) * 10) / 10,
  days_on_market: l.days_on_market,
  source: "yad2",
  posted_date: new Date(
    Date.now() - l.days_on_market * 24 * 60 * 60 * 1000
  ).toISOString(),
}));

// Now compute listing_count per neighborhood
const listingCountBySlug = new Map<string, number>();
for (const l of RAW_LISTINGS) {
  listingCountBySlug.set(
    l.neighborhood_id,
    (listingCountBySlug.get(l.neighborhood_id) ?? 0) + 1
  );
}
for (const n of NEIGHBORHOODS) {
  n.listing_count = listingCountBySlug.get(n.slug) ?? 0;
}

// Also compute avg_price_per_sqm from actual listings where available
const pricePerSqmBySlug = new Map<string, number[]>();
for (const l of RAW_LISTINGS) {
  const arr = pricePerSqmBySlug.get(l.neighborhood_id) ?? [];
  arr.push(Math.round((l.price / l.sqm) * 10) / 10);
  pricePerSqmBySlug.set(l.neighborhood_id, arr);
}
for (const n of NEIGHBORHOODS) {
  const prices = pricePerSqmBySlug.get(n.slug);
  if (prices && prices.length > 0) {
    n.avg_price_per_sqm = Math.round(
      prices.reduce((a, b) => a + b, 0) / prices.length
    );
  }
}

// Get listings for a specific neighborhood
export function getListingsForNeighborhood(slug: string): RentalListing[] {
  return LISTINGS.filter((l) => l.neighborhood === slug);
}

// Get comparable listings: same neighborhood, similar room count
export function getComparableListings(
  slug: string,
  rooms: number,
  limit: number = 5
): RentalListing[] {
  return LISTINGS.filter(
    (l) =>
      l.neighborhood === slug &&
      l.rooms >= rooms - 0.5 &&
      l.rooms <= rooms + 0.5
  )
    .sort((a, b) => a.monthly_rent - b.monthly_rent)
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// CBS Rent Stats (from apps/api/api/scrapers/cbs.py seed data)
// City-level average rents by room count for Tel Aviv
// ---------------------------------------------------------------------------

export interface CBSRentStat {
  rooms: number;
  avg_rent_new: number;
  avg_rent_renewal: number;
  avg_rent_all: number;
}

export const CBS_RENT_STATS: CBSRentStat[] = [
  { rooms: 1.0, avg_rent_new: 5300, avg_rent_renewal: 5000, avg_rent_all: 5100 },
  { rooms: 1.5, avg_rent_new: 5800, avg_rent_renewal: 5500, avg_rent_all: 5600 },
  { rooms: 2.0, avg_rent_new: 7200, avg_rent_renewal: 6800, avg_rent_all: 7000 },
  { rooms: 2.5, avg_rent_new: 8600, avg_rent_renewal: 8100, avg_rent_all: 8400 },
  { rooms: 3.0, avg_rent_new: 10200, avg_rent_renewal: 9600, avg_rent_all: 9900 },
  { rooms: 3.5, avg_rent_new: 11600, avg_rent_renewal: 11000, avg_rent_all: 11300 },
  { rooms: 4.0, avg_rent_new: 13300, avg_rent_renewal: 12600, avg_rent_all: 12900 },
  { rooms: 5.0, avg_rent_new: 16600, avg_rent_renewal: 15600, avg_rent_all: 16000 },
];

export function getCBSRentForRooms(rooms: number): number | null {
  const rounded = Math.round(rooms * 2) / 2;
  const stat = CBS_RENT_STATS.find((s) => s.rooms === rounded);
  return stat?.avg_rent_all ?? null;
}

// ---------------------------------------------------------------------------
// Rent Index Time Series (24 months, matching CBS scraper logic)
// Starting from 2024-03, ~4% annual growth, with slight monthly variation
// ---------------------------------------------------------------------------

function generateTrendData(months: number = 24): TrendEntry[] {
  const entries: TrendEntry[] = [];
  const baseIndex = 100.0;

  for (let i = 0; i < months; i++) {
    // Calculate date: start from March 2024
    const startMonth = 3; // March
    const startYear = 2024;
    const totalMonths = startMonth - 1 + i;
    const year = startYear + Math.floor(totalMonths / 12);
    const month = (totalMonths % 12) + 1;

    const d = new Date(year, month - 1, 1);

    // ~5.5% annual growth reflecting real 2024-2026 Tel Aviv market
    const annualRate = 0.055;
    const indexVal = baseIndex * (1 + (annualRate * i) / 12);
    // YoY variation between 4% and 7% depending on season
    const seasonalBoost = month >= 6 && month <= 9 ? 1.0 : -0.5;
    const yoy = 5.5 + ((i % 3) - 1) * 0.4 + seasonalBoost;

    // avg_rent roughly proportional to index (base 7000 for 2br city avg)
    const avgRent = Math.round(7000 * (indexVal / 100));

    entries.push({
      date: d.toISOString().split("T")[0],
      index: Math.round(indexVal * 100) / 100,
      avg_rent: avgRent,
      sample_size: 150 + Math.floor(Math.random() * 50),
    });
  }

  return entries;
}

export const TREND_DATA: TrendEntry[] = generateTrendData(24);

// ---------------------------------------------------------------------------
// Seasonal Data (from apps/api/api/services/market_signals.py +
//                apps/api/api/routers/stats.py)
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SEASONAL_DEMAND: Record<number, string> = {
  1: "low",
  2: "low",
  3: "medium",
  4: "medium",
  5: "medium",
  6: "medium",
  7: "high",
  8: "high",
  9: "high",
  10: "medium",
  11: "low",
  12: "low",
};

const SEASONAL_RECOMMENDATIONS: Record<string, string> = {
  low: "Good time to negotiate. Demand is lower and landlords are more motivated to keep tenants.",
  medium:
    "Average market conditions. Standard negotiation applies.",
  high: "Peak rental season. Consider waiting until winter for better leverage.",
};

export const SEASONAL_DATA: SeasonalData[] = Array.from(
  { length: 12 },
  (_, i) => {
    const month = i + 1;
    const demand = SEASONAL_DEMAND[month];
    // Rent index relative to average: high demand = higher index
    const indexAdjust =
      demand === "high" ? 1.03 : demand === "low" ? 0.97 : 1.0;
    return {
      month,
      month_name: MONTH_NAMES[i],
      demand_level: demand,
      avg_rent_index: Math.round(100 * indexAdjust * 100) / 100,
      recommendation: SEASONAL_RECOMMENDATIONS[demand],
    };
  }
);

// ---------------------------------------------------------------------------
// Seasonal favorability mapping (from market_signals.py)
// ---------------------------------------------------------------------------

export const SEASONAL_FAVORABILITY: Record<number, string> = {
  1: "good_to_negotiate",
  2: "good_to_negotiate",
  3: "neutral",
  4: "neutral",
  5: "neutral",
  6: "neutral",
  7: "bad_to_negotiate",
  8: "bad_to_negotiate",
  9: "bad_to_negotiate",
  10: "neutral",
  11: "good_to_negotiate",
  12: "good_to_negotiate",
};
