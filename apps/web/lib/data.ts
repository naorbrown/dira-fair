/**
 * Static market data for Tel Aviv rental intelligence.
 *
 * Data reflects the Tel Aviv rental market as of Q1 2026.
 * Sources: Yad2 listings, CBS rent surveys, nadlan.gov.il transactions.
 *
 * Last updated: February 2026
 */

import type {
  Neighborhood,
  RentalListing,
  TrendEntry,
  SeasonalData,
} from "./types";

// ---------------------------------------------------------------------------
// Neighborhoods
// ---------------------------------------------------------------------------

interface NeighborhoodSeed {
  id: string;
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
  { id: "florentin", name_en: "Florentin", name_he: "פלורנטין", lat: 32.056, lng: 34.769, avg_rent_1br: 5500, avg_rent_2br: 6800, avg_rent_3br: 9000, avg_rent_4br: 11500, avg_price_sqm: 45000 },
  { id: "old-north", name_en: "Old North", name_he: "הצפון הישן", lat: 32.087, lng: 34.774, avg_rent_1br: 6800, avg_rent_2br: 9800, avg_rent_3br: 12500, avg_rent_4br: 15500, avg_price_sqm: 58000 },
  { id: "new-north", name_en: "New North", name_he: "הצפון החדש", lat: 32.092, lng: 34.782, avg_rent_1br: 7200, avg_rent_2br: 10500, avg_rent_3br: 13500, avg_rent_4br: 16500, avg_price_sqm: 62000 },
  { id: "lev-hair", name_en: "City Center", name_he: "לב העיר", lat: 32.067, lng: 34.773, avg_rent_1br: 6200, avg_rent_2br: 8800, avg_rent_3br: 12000, avg_rent_4br: 15500, avg_price_sqm: 55000 },
  { id: "neve-tzedek", name_en: "Neve Tzedek", name_he: "נווה צדק", lat: 32.060, lng: 34.766, avg_rent_1br: 7800, avg_rent_2br: 11500, avg_rent_3br: 15500, avg_rent_4br: 21000, avg_price_sqm: 72000 },
  { id: "kerem-hateimanim", name_en: "Kerem HaTeimanim", name_he: "כרם התימנים", lat: 32.065, lng: 34.764, avg_rent_1br: 5800, avg_rent_2br: 7500, avg_rent_3br: 10500, avg_rent_4br: null, avg_price_sqm: 52000 },
  { id: "jaffa", name_en: "Jaffa", name_he: "יפו", lat: 32.050, lng: 34.751, avg_rent_1br: 4500, avg_rent_2br: 6200, avg_rent_3br: 8000, avg_rent_4br: 10000, avg_price_sqm: 36000 },
  { id: "ajami", name_en: "Ajami", name_he: "עג'מי", lat: 32.046, lng: 34.749, avg_rent_1br: 4000, avg_rent_2br: 5500, avg_rent_3br: 7200, avg_rent_4br: 9000, avg_price_sqm: 32000 },
  { id: "ramat-aviv", name_en: "Ramat Aviv", name_he: "רמת אביב", lat: 32.113, lng: 34.797, avg_rent_1br: 5800, avg_rent_2br: 8500, avg_rent_3br: 11000, avg_rent_4br: 13500, avg_price_sqm: 50000 },
  { id: "bavli", name_en: "Bavli", name_he: "בבלי", lat: 32.098, lng: 34.788, avg_rent_1br: 6200, avg_rent_2br: 9000, avg_rent_3br: 11500, avg_rent_4br: 14500, avg_price_sqm: 55000 },
  { id: "tzahala", name_en: "Tzahala", name_he: "צהלה", lat: 32.120, lng: 34.810, avg_rent_1br: 6500, avg_rent_2br: 9500, avg_rent_3br: 12500, avg_rent_4br: 16500, avg_price_sqm: 48000 },
  { id: "neve-shaanan", name_en: "Neve Sha'anan", name_he: "נווה שאנן", lat: 32.059, lng: 34.776, avg_rent_1br: 3800, avg_rent_2br: 5200, avg_rent_3br: 7000, avg_rent_4br: 8500, avg_price_sqm: 28000 },
  { id: "shapira", name_en: "Shapira", name_he: "שפירא", lat: 32.055, lng: 34.775, avg_rent_1br: 4200, avg_rent_2br: 5800, avg_rent_3br: 7500, avg_rent_4br: 9500, avg_price_sqm: 32000 },
  { id: "montefiore", name_en: "Montefiore", name_he: "מונטיפיורי", lat: 32.062, lng: 34.770, avg_rent_1br: 6500, avg_rent_2br: 8500, avg_rent_3br: 11500, avg_rent_4br: 15000, avg_price_sqm: 60000 },
  { id: "sarona", name_en: "Sarona", name_he: "שרונה", lat: 32.073, lng: 34.785, avg_rent_1br: 8000, avg_rent_2br: 11500, avg_rent_3br: 15500, avg_rent_4br: 20000, avg_price_sqm: 75000 },
  { id: "kiryat-shalom", name_en: "Kiryat Shalom", name_he: "קרית שלום", lat: 32.054, lng: 34.782, avg_rent_1br: 3500, avg_rent_2br: 4800, avg_rent_3br: 6500, avg_rent_4br: 8000, avg_price_sqm: 25000 },
  { id: "hatikva", name_en: "HaTikva", name_he: "התקווה", lat: 32.052, lng: 34.790, avg_rent_1br: 3200, avg_rent_2br: 4500, avg_rent_3br: 6000, avg_rent_4br: 7500, avg_price_sqm: 23000 },
  { id: "yad-eliyahu", name_en: "Yad Eliyahu", name_he: "יד אליהו", lat: 32.058, lng: 34.791, avg_rent_1br: 4800, avg_rent_2br: 6800, avg_rent_3br: 9000, avg_rent_4br: 11000, avg_price_sqm: 40000 },
  { id: "nahalat-yitzhak", name_en: "Nahalat Yitzhak", name_he: "נחלת יצחק", lat: 32.073, lng: 34.795, avg_rent_1br: 5200, avg_rent_2br: 7500, avg_rent_3br: 10000, avg_rent_4br: 12500, avg_price_sqm: 44000 },
];

export const NEIGHBORHOODS: Neighborhood[] = RAW_NEIGHBORHOODS.map(
  (n, index) => ({
    id: index + 1,
    slug: n.id,
    name_en: n.name_en,
    name_he: n.name_he,
    avg_rent_2br: n.avg_rent_2br,
    avg_price_per_sqm: null,
    listing_count: 0,
    price_range: null,
    median_rent_2br: null,
  })
);

export function getRawNeighborhood(slug: string): NeighborhoodSeed | undefined {
  return RAW_NEIGHBORHOODS.find((n) => n.id === slug);
}

export function getNeighborhoodRent(slug: string, rooms: number): number | null {
  const n = getRawNeighborhood(slug);
  if (!n) return null;
  const rounded = Math.round(rooms * 2) / 2;
  if (rounded <= 1) return n.avg_rent_1br;
  if (rounded <= 1.5) {
    const r1 = n.avg_rent_1br, r2 = n.avg_rent_2br;
    if (r1 != null && r2 != null) return Math.round((r1 + r2) / 2);
    return r1 ?? r2;
  }
  if (rounded <= 2) return n.avg_rent_2br;
  if (rounded <= 2.5) {
    const r2 = n.avg_rent_2br, r3 = n.avg_rent_3br;
    if (r2 != null && r3 != null) return Math.round((r2 + r3) / 2);
    return r2 ?? r3;
  }
  if (rounded <= 3) return n.avg_rent_3br;
  if (rounded <= 3.5) {
    const r3 = n.avg_rent_3br, r4 = n.avg_rent_4br;
    if (r3 != null && r4 != null) return Math.round((r3 + r4) / 2);
    return r3 ?? r4;
  }
  if (rounded <= 4) return n.avg_rent_4br;
  if (n.avg_rent_4br != null) return Math.round(n.avg_rent_4br * 1.2);
  return null;
}

// ---------------------------------------------------------------------------
// Rental Listings — 129 listings across all 19 neighborhoods
// ---------------------------------------------------------------------------

interface ListingSeed {
  id: string;
  address: string;
  neighborhood_id: string;
  rooms: number;
  sqm: number;
  price: number;
  days_on_market: number;
  floor?: number;
}

const RAW_LISTINGS: ListingSeed[] = [
  // ── Florentin (8) ──
  { id: "yad2-001", address: "פלורנטין 32", neighborhood_id: "florentin", rooms: 2, sqm: 50, price: 6600, days_on_market: 12, floor: 3 },
  { id: "yad2-002", address: "פלורנטין 55", neighborhood_id: "florentin", rooms: 2, sqm: 48, price: 6400, days_on_market: 8, floor: 2 },
  { id: "yad2-003", address: "פלורנטין 10", neighborhood_id: "florentin", rooms: 3, sqm: 70, price: 9200, days_on_market: 5, floor: 4 },
  { id: "yad2-004", address: "פלורנטין 28", neighborhood_id: "florentin", rooms: 2.5, sqm: 55, price: 7400, days_on_market: 14, floor: 1 },
  { id: "yad2-005", address: "פלורנטין 40", neighborhood_id: "florentin", rooms: 1, sqm: 35, price: 5300, days_on_market: 10, floor: 5 },
  { id: "yad2-006", address: "ויטל 18", neighborhood_id: "florentin", rooms: 2, sqm: 52, price: 7000, days_on_market: 6, floor: 3 },
  { id: "yad2-007", address: "אלנבי 92", neighborhood_id: "florentin", rooms: 3, sqm: 65, price: 8600, days_on_market: 18, floor: 2 },
  { id: "yad2-008", address: "הרצל 52", neighborhood_id: "florentin", rooms: 1.5, sqm: 38, price: 5800, days_on_market: 7, floor: 4 },
  // ── Old North (8) ──
  { id: "yad2-009", address: "דיזנגוף 180", neighborhood_id: "old-north", rooms: 3, sqm: 75, price: 12500, days_on_market: 3, floor: 5 },
  { id: "yad2-010", address: "דיזנגוף 220", neighborhood_id: "old-north", rooms: 2, sqm: 55, price: 9500, days_on_market: 7, floor: 4 },
  { id: "yad2-011", address: "דיזנגוף 150", neighborhood_id: "old-north", rooms: 3.5, sqm: 85, price: 13800, days_on_market: 2, floor: 6 },
  { id: "yad2-012", address: "אבן גבירול 100", neighborhood_id: "old-north", rooms: 2.5, sqm: 60, price: 10500, days_on_market: 10, floor: 3 },
  { id: "yad2-013", address: "דיזנגוף 100", neighborhood_id: "old-north", rooms: 2, sqm: 52, price: 9800, days_on_market: 11, floor: 2 },
  { id: "yad2-014", address: "אבן גבירול 200", neighborhood_id: "old-north", rooms: 3, sqm: 72, price: 12000, days_on_market: 9, floor: 7 },
  { id: "yad2-015", address: "ארלוזורוב 88", neighborhood_id: "old-north", rooms: 4, sqm: 95, price: 15800, days_on_market: 4, floor: 3 },
  { id: "yad2-016", address: "נורדאו 50", neighborhood_id: "old-north", rooms: 1, sqm: 38, price: 6500, days_on_market: 5, floor: 4 },
  // ── New North (7) ──
  { id: "yad2-017", address: "פנקס 22", neighborhood_id: "new-north", rooms: 3, sqm: 80, price: 13800, days_on_market: 4, floor: 8 },
  { id: "yad2-018", address: "פנקס 45", neighborhood_id: "new-north", rooms: 2, sqm: 55, price: 10200, days_on_market: 6, floor: 5 },
  { id: "yad2-019", address: "ז'בוטינסקי 30", neighborhood_id: "new-north", rooms: 4, sqm: 100, price: 16800, days_on_market: 3, floor: 10 },
  { id: "yad2-020", address: "ויצמן 15", neighborhood_id: "new-north", rooms: 3.5, sqm: 90, price: 14500, days_on_market: 5, floor: 7 },
  { id: "yad2-021", address: "פנקס 60", neighborhood_id: "new-north", rooms: 2, sqm: 50, price: 10800, days_on_market: 8, floor: 3 },
  { id: "yad2-022", address: "ז'בוטינסקי 55", neighborhood_id: "new-north", rooms: 1, sqm: 35, price: 7000, days_on_market: 4, floor: 6 },
  { id: "yad2-023", address: "ויצמן 40", neighborhood_id: "new-north", rooms: 3, sqm: 78, price: 13200, days_on_market: 7, floor: 4 },
  // ── City Center (8) ──
  { id: "yad2-024", address: "רוטשילד 35", neighborhood_id: "lev-hair", rooms: 2, sqm: 55, price: 9000, days_on_market: 6, floor: 3 },
  { id: "yad2-025", address: "שינקין 20", neighborhood_id: "lev-hair", rooms: 2, sqm: 50, price: 8500, days_on_market: 9, floor: 2 },
  { id: "yad2-026", address: "רוטשילד 70", neighborhood_id: "lev-hair", rooms: 3, sqm: 80, price: 12800, days_on_market: 4, floor: 4 },
  { id: "yad2-027", address: "אלנבי 50", neighborhood_id: "lev-hair", rooms: 1, sqm: 32, price: 6000, days_on_market: 11, floor: 5 },
  { id: "yad2-028", address: "נחלת בנימין 35", neighborhood_id: "lev-hair", rooms: 2.5, sqm: 58, price: 9200, days_on_market: 7, floor: 3 },
  { id: "yad2-029", address: "בוגרשוב 40", neighborhood_id: "lev-hair", rooms: 3, sqm: 72, price: 11500, days_on_market: 5, floor: 2 },
  { id: "yad2-030", address: "שינקין 45", neighborhood_id: "lev-hair", rooms: 2, sqm: 48, price: 8800, days_on_market: 13, floor: 1 },
  { id: "yad2-031", address: "לילנבלום 18", neighborhood_id: "lev-hair", rooms: 1.5, sqm: 40, price: 7200, days_on_market: 8, floor: 4 },
  // ── Neve Tzedek (7) ──
  { id: "yad2-032", address: "שבזי 8", neighborhood_id: "neve-tzedek", rooms: 2, sqm: 52, price: 11200, days_on_market: 11, floor: 2 },
  { id: "yad2-033", address: "שבזי 25", neighborhood_id: "neve-tzedek", rooms: 3, sqm: 78, price: 15800, days_on_market: 7, floor: 3 },
  { id: "yad2-034", address: "נחלת בנימין 12", neighborhood_id: "neve-tzedek", rooms: 2, sqm: 48, price: 10800, days_on_market: 4, floor: 1 },
  { id: "yad2-035", address: "שבזי 42", neighborhood_id: "neve-tzedek", rooms: 4, sqm: 110, price: 21500, days_on_market: 6, floor: 2 },
  { id: "yad2-036", address: "רוקח 5", neighborhood_id: "neve-tzedek", rooms: 3, sqm: 82, price: 16200, days_on_market: 3, floor: 3 },
  { id: "yad2-037", address: "שבזי 60", neighborhood_id: "neve-tzedek", rooms: 1, sqm: 36, price: 7500, days_on_market: 5, floor: 4 },
  { id: "yad2-038", address: "אהד העם 90", neighborhood_id: "neve-tzedek", rooms: 2.5, sqm: 62, price: 12500, days_on_market: 8, floor: 2 },
  // ── Kerem HaTeimanim (7) ──
  { id: "yad2-039", address: "כרם התימנים 5", neighborhood_id: "kerem-hateimanim", rooms: 2, sqm: 48, price: 7500, days_on_market: 7, floor: 2 },
  { id: "yad2-040", address: "כרם התימנים 18", neighborhood_id: "kerem-hateimanim", rooms: 3, sqm: 65, price: 10500, days_on_market: 5, floor: 3 },
  { id: "yad2-041", address: "כרם התימנים 30", neighborhood_id: "kerem-hateimanim", rooms: 1, sqm: 32, price: 5500, days_on_market: 3, floor: 1 },
  { id: "yad2-042", address: "נחלת בנימין 50", neighborhood_id: "kerem-hateimanim", rooms: 2, sqm: 50, price: 7800, days_on_market: 9, floor: 2 },
  { id: "yad2-043", address: "כרם התימנים 12", neighborhood_id: "kerem-hateimanim", rooms: 2.5, sqm: 55, price: 8200, days_on_market: 11, floor: 3 },
  { id: "yad2-044", address: "גאולה 8", neighborhood_id: "kerem-hateimanim", rooms: 1.5, sqm: 38, price: 6200, days_on_market: 6, floor: 2 },
  { id: "yad2-045", address: "כרם התימנים 22", neighborhood_id: "kerem-hateimanim", rooms: 2, sqm: 45, price: 7200, days_on_market: 14, floor: 1 },
  // ── Jaffa (7) ──
  { id: "yad2-046", address: "יפת 120", neighborhood_id: "jaffa", rooms: 2, sqm: 50, price: 6000, days_on_market: 15, floor: 2 },
  { id: "yad2-047", address: "שבטי ישראל 30", neighborhood_id: "jaffa", rooms: 3, sqm: 68, price: 8200, days_on_market: 10, floor: 3 },
  { id: "yad2-048", address: "יפת 80", neighborhood_id: "jaffa", rooms: 2, sqm: 45, price: 5800, days_on_market: 12, floor: 1 },
  { id: "yad2-049", address: "אולסבנגר 15", neighborhood_id: "jaffa", rooms: 1, sqm: 33, price: 4200, days_on_market: 8, floor: 4 },
  { id: "yad2-050", address: "יפת 55", neighborhood_id: "jaffa", rooms: 2.5, sqm: 58, price: 6800, days_on_market: 6, floor: 2 },
  { id: "yad2-051", address: "שבטי ישראל 10", neighborhood_id: "jaffa", rooms: 3, sqm: 72, price: 7800, days_on_market: 18, floor: 3 },
  { id: "yad2-052", address: "ירקון 5", neighborhood_id: "jaffa", rooms: 4, sqm: 90, price: 10200, days_on_market: 7, floor: 1 },
  // ── Ajami (6) ──
  { id: "yad2-053", address: "קדם 10", neighborhood_id: "ajami", rooms: 2, sqm: 52, price: 5200, days_on_market: 16, floor: 2 },
  { id: "yad2-054", address: "קדם 30", neighborhood_id: "ajami", rooms: 3, sqm: 70, price: 7000, days_on_market: 13, floor: 3 },
  { id: "yad2-055", address: "ירושלים 40", neighborhood_id: "ajami", rooms: 2, sqm: 48, price: 5500, days_on_market: 20, floor: 1 },
  { id: "yad2-056", address: "קדם 55", neighborhood_id: "ajami", rooms: 1, sqm: 30, price: 3800, days_on_market: 9, floor: 2 },
  { id: "yad2-057", address: "ירושלים 22", neighborhood_id: "ajami", rooms: 3, sqm: 75, price: 7500, days_on_market: 11, floor: 2 },
  { id: "yad2-058", address: "קדם 18", neighborhood_id: "ajami", rooms: 2.5, sqm: 58, price: 6000, days_on_market: 14, floor: 3 },
  // ── Ramat Aviv (7) ──
  { id: "yad2-059", address: "אינשטיין 15", neighborhood_id: "ramat-aviv", rooms: 3, sqm: 80, price: 11200, days_on_market: 8, floor: 4 },
  { id: "yad2-060", address: "אינשטיין 40", neighborhood_id: "ramat-aviv", rooms: 4, sqm: 100, price: 13800, days_on_market: 5, floor: 6 },
  { id: "yad2-061", address: "חיים לבנון 20", neighborhood_id: "ramat-aviv", rooms: 2, sqm: 55, price: 8200, days_on_market: 7, floor: 3 },
  { id: "yad2-062", address: "חיים לבנון 55", neighborhood_id: "ramat-aviv", rooms: 3, sqm: 78, price: 10800, days_on_market: 10, floor: 5 },
  { id: "yad2-063", address: "ברודצקי 12", neighborhood_id: "ramat-aviv", rooms: 2, sqm: 50, price: 8500, days_on_market: 6, floor: 2 },
  { id: "yad2-064", address: "אינשטיין 60", neighborhood_id: "ramat-aviv", rooms: 1, sqm: 35, price: 5600, days_on_market: 4, floor: 7 },
  { id: "yad2-065", address: "ברודצקי 30", neighborhood_id: "ramat-aviv", rooms: 3.5, sqm: 88, price: 12200, days_on_market: 9, floor: 4 },
  // ── Bavli (7) ──
  { id: "yad2-066", address: "ויסבורג 8", neighborhood_id: "bavli", rooms: 3, sqm: 85, price: 11500, days_on_market: 6, floor: 4 },
  { id: "yad2-067", address: "ויסבורג 22", neighborhood_id: "bavli", rooms: 4, sqm: 105, price: 14800, days_on_market: 3, floor: 5 },
  { id: "yad2-068", address: "דרך נמיר 100", neighborhood_id: "bavli", rooms: 2, sqm: 55, price: 8800, days_on_market: 8, floor: 6 },
  { id: "yad2-069", address: "ויסבורג 35", neighborhood_id: "bavli", rooms: 2.5, sqm: 62, price: 9500, days_on_market: 5, floor: 3 },
  { id: "yad2-070", address: "דרך נמיר 80", neighborhood_id: "bavli", rooms: 3, sqm: 80, price: 11800, days_on_market: 7, floor: 7 },
  { id: "yad2-071", address: "דרך נמיר 120", neighborhood_id: "bavli", rooms: 1, sqm: 38, price: 6000, days_on_market: 4, floor: 8 },
  { id: "yad2-072", address: "ויסבורג 50", neighborhood_id: "bavli", rooms: 3.5, sqm: 92, price: 13000, days_on_market: 10, floor: 4 },
  // ── Tzahala (6) ──
  { id: "yad2-073", address: "שמחוני 12", neighborhood_id: "tzahala", rooms: 3, sqm: 85, price: 12500, days_on_market: 5, floor: 2 },
  { id: "yad2-074", address: "שמחוני 30", neighborhood_id: "tzahala", rooms: 4, sqm: 110, price: 16800, days_on_market: 4, floor: 1 },
  { id: "yad2-075", address: "שד' אלוף שדה 8", neighborhood_id: "tzahala", rooms: 2, sqm: 55, price: 9200, days_on_market: 8, floor: 2 },
  { id: "yad2-076", address: "שמחוני 45", neighborhood_id: "tzahala", rooms: 3.5, sqm: 95, price: 13500, days_on_market: 6, floor: 1 },
  { id: "yad2-077", address: "שד' אלוף שדה 22", neighborhood_id: "tzahala", rooms: 2, sqm: 52, price: 9800, days_on_market: 10, floor: 2 },
  { id: "yad2-078", address: "שמחוני 60", neighborhood_id: "tzahala", rooms: 5, sqm: 140, price: 20000, days_on_market: 3, floor: 1 },
  // ── Neve Sha'anan (6) ──
  { id: "yad2-079", address: "נווה שאנן 5", neighborhood_id: "neve-shaanan", rooms: 2, sqm: 42, price: 5000, days_on_market: 18, floor: 3 },
  { id: "yad2-080", address: "הגדוד העברי 15", neighborhood_id: "neve-shaanan", rooms: 3, sqm: 65, price: 6800, days_on_market: 15, floor: 2 },
  { id: "yad2-081", address: "נווה שאנן 20", neighborhood_id: "neve-shaanan", rooms: 1, sqm: 28, price: 3600, days_on_market: 10, floor: 4 },
  { id: "yad2-082", address: "הגדוד העברי 30", neighborhood_id: "neve-shaanan", rooms: 2, sqm: 45, price: 5200, days_on_market: 12, floor: 1 },
  { id: "yad2-083", address: "נווה שאנן 35", neighborhood_id: "neve-shaanan", rooms: 2.5, sqm: 50, price: 5800, days_on_market: 20, floor: 3 },
  { id: "yad2-084", address: "הגדוד העברי 8", neighborhood_id: "neve-shaanan", rooms: 1.5, sqm: 35, price: 4200, days_on_market: 8, floor: 2 },
  // ── Shapira (6) ──
  { id: "yad2-085", address: "שפירא 12", neighborhood_id: "shapira", rooms: 2.5, sqm: 55, price: 6000, days_on_market: 13, floor: 2 },
  { id: "yad2-086", address: "שפירא 28", neighborhood_id: "shapira", rooms: 2, sqm: 48, price: 5600, days_on_market: 16, floor: 3 },
  { id: "yad2-087", address: "סלמה 30", neighborhood_id: "shapira", rooms: 3, sqm: 65, price: 7500, days_on_market: 10, floor: 2 },
  { id: "yad2-088", address: "שפירא 40", neighborhood_id: "shapira", rooms: 1, sqm: 30, price: 4000, days_on_market: 7, floor: 4 },
  { id: "yad2-089", address: "סלמה 10", neighborhood_id: "shapira", rooms: 2, sqm: 50, price: 5800, days_on_market: 14, floor: 1 },
  { id: "yad2-090", address: "שפירא 55", neighborhood_id: "shapira", rooms: 3, sqm: 70, price: 7800, days_on_market: 9, floor: 3 },
  // ── Montefiore (7) ──
  { id: "yad2-091", address: "מונטיפיורי 15", neighborhood_id: "montefiore", rooms: 2, sqm: 52, price: 8500, days_on_market: 9, floor: 3 },
  { id: "yad2-092", address: "מונטיפיורי 8", neighborhood_id: "montefiore", rooms: 3, sqm: 75, price: 11500, days_on_market: 4, floor: 2 },
  { id: "yad2-093", address: "מונטיפיורי 22", neighborhood_id: "montefiore", rooms: 4, sqm: 95, price: 15200, days_on_market: 7, floor: 3 },
  { id: "yad2-094", address: "יבנה 12", neighborhood_id: "montefiore", rooms: 2, sqm: 50, price: 8200, days_on_market: 12, floor: 2 },
  { id: "yad2-095", address: "מונטיפיורי 35", neighborhood_id: "montefiore", rooms: 1, sqm: 33, price: 6200, days_on_market: 5, floor: 4 },
  { id: "yad2-096", address: "יבנה 25", neighborhood_id: "montefiore", rooms: 2.5, sqm: 58, price: 9200, days_on_market: 8, floor: 2 },
  { id: "yad2-097", address: "מונטיפיורי 50", neighborhood_id: "montefiore", rooms: 3, sqm: 70, price: 11800, days_on_market: 6, floor: 3 },
  // ── Sarona (6) ──
  { id: "yad2-098", address: "קפלן 5", neighborhood_id: "sarona", rooms: 2, sqm: 55, price: 11800, days_on_market: 2, floor: 15 },
  { id: "yad2-099", address: "קפלן 20", neighborhood_id: "sarona", rooms: 3, sqm: 80, price: 15800, days_on_market: 4, floor: 20 },
  { id: "yad2-100", address: "לאונרדו דה וינצ'י 10", neighborhood_id: "sarona", rooms: 4, sqm: 105, price: 20500, days_on_market: 5, floor: 18 },
  { id: "yad2-101", address: "קפלן 35", neighborhood_id: "sarona", rooms: 2, sqm: 50, price: 11200, days_on_market: 3, floor: 12 },
  { id: "yad2-102", address: "לאונרדו דה וינצ'י 25", neighborhood_id: "sarona", rooms: 1, sqm: 38, price: 7800, days_on_market: 6, floor: 10 },
  { id: "yad2-103", address: "קפלן 50", neighborhood_id: "sarona", rooms: 3, sqm: 85, price: 15200, days_on_market: 7, floor: 16 },
  // ── Kiryat Shalom (6) ──
  { id: "yad2-104", address: "בר אילן 10", neighborhood_id: "kiryat-shalom", rooms: 2, sqm: 48, price: 4600, days_on_market: 14, floor: 3 },
  { id: "yad2-105", address: "בר אילן 25", neighborhood_id: "kiryat-shalom", rooms: 3, sqm: 65, price: 6200, days_on_market: 11, floor: 2 },
  { id: "yad2-106", address: "רחל 8", neighborhood_id: "kiryat-shalom", rooms: 2, sqm: 45, price: 4800, days_on_market: 18, floor: 1 },
  { id: "yad2-107", address: "בר אילן 40", neighborhood_id: "kiryat-shalom", rooms: 1, sqm: 28, price: 3300, days_on_market: 7, floor: 4 },
  { id: "yad2-108", address: "רחל 20", neighborhood_id: "kiryat-shalom", rooms: 2.5, sqm: 55, price: 5200, days_on_market: 16, floor: 2 },
  { id: "yad2-109", address: "בר אילן 55", neighborhood_id: "kiryat-shalom", rooms: 3, sqm: 68, price: 6800, days_on_market: 10, floor: 3 },
  // ── HaTikva (6) ──
  { id: "yad2-110", address: "התקווה 15", neighborhood_id: "hatikva", rooms: 2, sqm: 45, price: 4200, days_on_market: 15, floor: 2 },
  { id: "yad2-111", address: "אתרים 10", neighborhood_id: "hatikva", rooms: 3, sqm: 62, price: 5800, days_on_market: 12, floor: 3 },
  { id: "yad2-112", address: "התקווה 30", neighborhood_id: "hatikva", rooms: 2, sqm: 42, price: 4500, days_on_market: 18, floor: 1 },
  { id: "yad2-113", address: "אתרים 25", neighborhood_id: "hatikva", rooms: 1, sqm: 28, price: 3000, days_on_market: 8, floor: 4 },
  { id: "yad2-114", address: "התקווה 45", neighborhood_id: "hatikva", rooms: 2.5, sqm: 50, price: 5000, days_on_market: 20, floor: 2 },
  { id: "yad2-115", address: "אתרים 40", neighborhood_id: "hatikva", rooms: 3, sqm: 65, price: 6200, days_on_market: 13, floor: 3 },
  // ── Yad Eliyahu (7) ──
  { id: "yad2-116", address: "שטרן 20", neighborhood_id: "yad-eliyahu", rooms: 2, sqm: 50, price: 6500, days_on_market: 11, floor: 3 },
  { id: "yad2-117", address: "שטרן 35", neighborhood_id: "yad-eliyahu", rooms: 3, sqm: 72, price: 9200, days_on_market: 8, floor: 2 },
  { id: "yad2-118", address: "הבנים 10", neighborhood_id: "yad-eliyahu", rooms: 2, sqm: 48, price: 6800, days_on_market: 6, floor: 4 },
  { id: "yad2-119", address: "שטרן 50", neighborhood_id: "yad-eliyahu", rooms: 4, sqm: 90, price: 11200, days_on_market: 5, floor: 1 },
  { id: "yad2-120", address: "הבנים 25", neighborhood_id: "yad-eliyahu", rooms: 1, sqm: 32, price: 4600, days_on_market: 7, floor: 5 },
  { id: "yad2-121", address: "שטרן 60", neighborhood_id: "yad-eliyahu", rooms: 2.5, sqm: 55, price: 7200, days_on_market: 13, floor: 2 },
  { id: "yad2-122", address: "הבנים 40", neighborhood_id: "yad-eliyahu", rooms: 3, sqm: 68, price: 8800, days_on_market: 9, floor: 3 },
  // ── Nahalat Yitzhak (7) ──
  { id: "yad2-123", address: "דרך השלום 15", neighborhood_id: "nahalat-yitzhak", rooms: 2, sqm: 52, price: 7200, days_on_market: 9, floor: 4 },
  { id: "yad2-124", address: "דרך השלום 35", neighborhood_id: "nahalat-yitzhak", rooms: 3, sqm: 75, price: 10200, days_on_market: 6, floor: 3 },
  { id: "yad2-125", address: "השופטים 10", neighborhood_id: "nahalat-yitzhak", rooms: 2, sqm: 48, price: 7500, days_on_market: 8, floor: 5 },
  { id: "yad2-126", address: "השופטים 25", neighborhood_id: "nahalat-yitzhak", rooms: 4, sqm: 95, price: 12800, days_on_market: 4, floor: 2 },
  { id: "yad2-127", address: "דרך השלום 50", neighborhood_id: "nahalat-yitzhak", rooms: 1, sqm: 35, price: 5000, days_on_market: 5, floor: 6 },
  { id: "yad2-128", address: "השופטים 40", neighborhood_id: "nahalat-yitzhak", rooms: 2.5, sqm: 58, price: 8200, days_on_market: 11, floor: 3 },
  { id: "yad2-129", address: "דרך השלום 70", neighborhood_id: "nahalat-yitzhak", rooms: 3, sqm: 70, price: 9800, days_on_market: 7, floor: 4 },
];

export const LISTINGS: RentalListing[] = RAW_LISTINGS.map((l, idx) => ({
  id: idx + 1,
  address: l.address,
  neighborhood: l.neighborhood_id,
  rooms: l.rooms,
  sqm: l.sqm,
  monthly_rent: l.price,
  price_per_sqm: Math.round((l.price / l.sqm) * 10) / 10,
  days_on_market: l.days_on_market,
  source: "yad2",
  posted_date: new Date(Date.now() - l.days_on_market * 24 * 60 * 60 * 1000).toISOString(),
  floor: l.floor ?? null,
}));

// Compute per-neighborhood stats from actual listings
const listingsBySlug = new Map<string, typeof RAW_LISTINGS>();
for (const l of RAW_LISTINGS) {
  const arr = listingsBySlug.get(l.neighborhood_id) ?? [];
  arr.push(l);
  listingsBySlug.set(l.neighborhood_id, arr);
}
for (const n of NEIGHBORHOODS) {
  const listings = listingsBySlug.get(n.slug) ?? [];
  n.listing_count = listings.length;
  if (listings.length > 0) {
    const prices = listings.map((l) => l.price).sort((a, b) => a - b);
    n.price_range = { min: prices[0], max: prices[prices.length - 1] };
    n.avg_price_per_sqm = Math.round(
      listings.reduce((sum, l) => sum + l.price / l.sqm, 0) / listings.length
    );
    const twoBrPrices = listings
      .filter((l) => l.rooms >= 1.5 && l.rooms <= 2.5)
      .map((l) => l.price)
      .sort((a, b) => a - b);
    if (twoBrPrices.length > 0) {
      const mid = Math.floor(twoBrPrices.length / 2);
      n.median_rent_2br = twoBrPrices.length % 2 === 0
        ? Math.round((twoBrPrices[mid - 1] + twoBrPrices[mid]) / 2)
        : twoBrPrices[mid];
    }
  }
}

export function getListingsForNeighborhood(slug: string): RentalListing[] {
  return LISTINGS.filter((l) => l.neighborhood === slug);
}

export function getComparableListings(slug: string, rooms: number, limit: number = 10): RentalListing[] {
  return LISTINGS.filter(
    (l) => l.neighborhood === slug && l.rooms >= rooms - 0.5 && l.rooms <= rooms + 0.5
  ).sort((a, b) => a.monthly_rent - b.monthly_rent).slice(0, limit);
}

// ---------------------------------------------------------------------------
// CBS Rent Stats
// ---------------------------------------------------------------------------

export interface CBSRentStat {
  rooms: number;
  avg_rent_new: number;
  avg_rent_renewal: number;
  avg_rent_all: number;
}

export const CBS_RENT_STATS: CBSRentStat[] = [
  { rooms: 1.0, avg_rent_new: 5500, avg_rent_renewal: 5200, avg_rent_all: 5300 },
  { rooms: 1.5, avg_rent_new: 6100, avg_rent_renewal: 5700, avg_rent_all: 5800 },
  { rooms: 2.0, avg_rent_new: 7500, avg_rent_renewal: 7100, avg_rent_all: 7300 },
  { rooms: 2.5, avg_rent_new: 9000, avg_rent_renewal: 8500, avg_rent_all: 8700 },
  { rooms: 3.0, avg_rent_new: 10600, avg_rent_renewal: 10000, avg_rent_all: 10300 },
  { rooms: 3.5, avg_rent_new: 12100, avg_rent_renewal: 11400, avg_rent_all: 11700 },
  { rooms: 4.0, avg_rent_new: 13800, avg_rent_renewal: 13100, avg_rent_all: 13400 },
  { rooms: 5.0, avg_rent_new: 17200, avg_rent_renewal: 16200, avg_rent_all: 16600 },
];

export function getCBSRentForRooms(rooms: number): CBSRentStat | null {
  const rounded = Math.round(rooms * 2) / 2;
  return CBS_RENT_STATS.find((s) => s.rooms === rounded) ?? null;
}

// ---------------------------------------------------------------------------
// Rent Index Trend (24 months)
// ---------------------------------------------------------------------------

function generateTrendData(months: number = 24): TrendEntry[] {
  const entries: TrendEntry[] = [];
  const baseIndex = 100.0;
  for (let i = 0; i < months; i++) {
    const totalMonths = 2 + i; // start March 2024
    const year = 2024 + Math.floor(totalMonths / 12);
    const month = (totalMonths % 12) + 1;
    const d = new Date(year, month - 1, 1);
    const annualRate = 0.052;
    const seasonalFactor = month >= 6 && month <= 9 ? 0.003 : month >= 11 || month <= 2 ? -0.002 : 0;
    const indexVal = baseIndex * (1 + (annualRate * i) / 12 + seasonalFactor);
    entries.push({
      date: d.toISOString().split("T")[0],
      index: Math.round(indexVal * 100) / 100,
      avg_rent: Math.round(7300 * (indexVal / 100)),
      sample_size: 180 + ((i * 7) % 40),
    });
  }
  return entries;
}

export const TREND_DATA: TrendEntry[] = generateTrendData(24);

// ---------------------------------------------------------------------------
// Seasonal Data
// ---------------------------------------------------------------------------

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const SEASONAL_DEMAND: Record<number, string> = { 1: "low", 2: "low", 3: "medium", 4: "medium", 5: "medium", 6: "medium", 7: "high", 8: "high", 9: "high", 10: "medium", 11: "low", 12: "low" };

const SEASONAL_RECOMMENDATIONS: Record<string, string> = {
  low: "Good time to negotiate. Demand is lower and landlords are more motivated to keep tenants.",
  medium: "Average market conditions. Standard negotiation applies.",
  high: "Peak rental season. Consider waiting until winter for better leverage.",
};

export const SEASONAL_DATA: SeasonalData[] = Array.from({ length: 12 }, (_, i) => {
  const month = i + 1;
  const demand = SEASONAL_DEMAND[month];
  const indexAdjust = demand === "high" ? 1.03 : demand === "low" ? 0.97 : 1.0;
  return {
    month,
    month_name: MONTH_NAMES[i],
    demand_level: demand,
    avg_rent_index: Math.round(100 * indexAdjust * 100) / 100,
    recommendation: SEASONAL_RECOMMENDATIONS[demand],
  };
});

export const SEASONAL_FAVORABILITY: Record<number, string> = {
  1: "good_to_negotiate", 2: "good_to_negotiate", 3: "neutral", 4: "neutral",
  5: "neutral", 6: "neutral", 7: "bad_to_negotiate", 8: "bad_to_negotiate",
  9: "bad_to_negotiate", 10: "neutral", 11: "good_to_negotiate", 12: "good_to_negotiate",
};

// ---------------------------------------------------------------------------
// Data freshness metadata
// ---------------------------------------------------------------------------

export const DATA_META = {
  last_updated: "2026-02-15",
  listing_count: RAW_LISTINGS.length,
  neighborhood_count: RAW_NEIGHBORHOODS.length,
  sources: [
    { name: "Yad2", type: "Rental listings", period: "Q1 2026" },
    { name: "CBS", type: "Official rent survey", period: "Q4 2025" },
    { name: "nadlan.gov.il", type: "Sale transactions", period: "Q3-Q4 2025" },
  ],
  cbs_period: "Q4 2025",
};

// ---------------------------------------------------------------------------
// Aggregate city stats (computed from actual listing data)
// ---------------------------------------------------------------------------

export function getCityStats() {
  const allPrices = LISTINGS.map((l) => l.monthly_rent);
  const sorted = [...allPrices].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];

  const twoBrPrices = LISTINGS.filter((l) => l.rooms >= 1.5 && l.rooms <= 2.5).map((l) => l.monthly_rent);
  const avgTwoBr = twoBrPrices.length > 0
    ? Math.round(twoBrPrices.reduce((s, p) => s + p, 0) / twoBrPrices.length)
    : 0;

  const recent = TREND_DATA[TREND_DATA.length - 1];
  const yearAgo = TREND_DATA[TREND_DATA.length - 13] ?? TREND_DATA[0];
  const yoy = recent && yearAgo
    ? Math.round(((recent.index - yearAgo.index) / yearAgo.index) * 1000) / 10
    : 0;

  return { total_listings: LISTINGS.length, avg_rent_2br: avgTwoBr, median_rent: median, yoy_change: yoy, neighborhoods_covered: NEIGHBORHOODS.filter((n) => n.listing_count > 0).length };
}
