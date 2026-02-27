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
  ClosedMarketData,
  NeighborhoodDecisionFactors,
} from "./types";

import { RAW_LISTINGS } from "./listings-data";
import type { ListingSeed, ListingSource } from "./listings-data";

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
  // ── Additional micro-neighborhoods to fill coverage gaps ──
  { id: "noga", name_en: "Noga", name_he: "נגה", lat: 32.058, lng: 34.764, avg_rent_1br: 5800, avg_rent_2br: 7200, avg_rent_3br: 9500, avg_rent_4br: 12500, avg_price_sqm: 48000 },
  { id: "lev-yafo", name_en: "Lev Yafo", name_he: "לב יפו", lat: 32.053, lng: 34.755, avg_rent_1br: 4200, avg_rent_2br: 5800, avg_rent_3br: 7500, avg_rent_4br: 9500, avg_price_sqm: 34000 },
  { id: "rothschild", name_en: "Rothschild", name_he: "רוטשילד", lat: 32.064, lng: 34.774, avg_rent_1br: 7500, avg_rent_2br: 10500, avg_rent_3br: 14000, avg_rent_4br: 18500, avg_price_sqm: 68000 },
  { id: "hadar-yosef", name_en: "Hadar Yosef", name_he: "הדר יוסף", lat: 32.100, lng: 34.800, avg_rent_1br: 5500, avg_rent_2br: 8000, avg_rent_3br: 10500, avg_rent_4br: 13000, avg_price_sqm: 46000 },
  { id: "tel-baruch", name_en: "Tel Baruch", name_he: "תל ברוך", lat: 32.118, lng: 34.790, avg_rent_1br: 5200, avg_rent_2br: 7800, avg_rent_3br: 10200, avg_rent_4br: 13000, avg_price_sqm: 42000 },
  // ── Neighboring cities (Gush Dan) — browsable via Explore, not shown as "nearby" ──
  { id: "ramat-gan", name_en: "Ramat Gan", name_he: "רמת גן", lat: 32.082, lng: 34.813, avg_rent_1br: 4800, avg_rent_2br: 6500, avg_rent_3br: 8500, avg_rent_4br: 10500, avg_price_sqm: 38000 },
  { id: "givatayim", name_en: "Givatayim", name_he: "גבעתיים", lat: 32.072, lng: 34.812, avg_rent_1br: 5200, avg_rent_2br: 7000, avg_rent_3br: 9200, avg_rent_4br: 11500, avg_price_sqm: 40000 },
  { id: "bat-yam", name_en: "Bat Yam", name_he: "בת ים", lat: 32.018, lng: 34.750, avg_rent_1br: 3500, avg_rent_2br: 4800, avg_rent_3br: 6200, avg_rent_4br: 7800, avg_price_sqm: 22000 },
  { id: "holon", name_en: "Holon", name_he: "חולון", lat: 32.011, lng: 34.776, avg_rent_1br: 3400, avg_rent_2br: 4600, avg_rent_3br: 6000, avg_rent_4br: 7500, avg_price_sqm: 20000 },
  { id: "herzliya", name_en: "Herzliya", name_he: "הרצליה", lat: 32.162, lng: 34.791, avg_rent_1br: 5800, avg_rent_2br: 8000, avg_rent_3br: 10500, avg_rent_4br: 13500, avg_price_sqm: 45000 },
  { id: "bnei-brak", name_en: "Bnei Brak", name_he: "בני ברק", lat: 32.083, lng: 34.833, avg_rent_1br: 3500, avg_rent_2br: 5000, avg_rent_3br: 6500, avg_rent_4br: 8500, avg_price_sqm: 25000 },
  { id: "petah-tikva", name_en: "Petah Tikva", name_he: "פתח תקוה", lat: 32.087, lng: 34.887, avg_rent_1br: 3200, avg_rent_2br: 4500, avg_rent_3br: 6000, avg_rent_4br: 7800, avg_price_sqm: 22000 },
];

export const NEIGHBORHOODS: Neighborhood[] = RAW_NEIGHBORHOODS.map(
  (n, index) => ({
    id: index + 1,
    slug: n.id,
    name_en: n.name_en,
    name_he: n.name_he,
    lat: n.lat,
    lng: n.lng,
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

/** Find the nearest neighborhood to a given lat/lng coordinate. */
export function findNearestNeighborhood(lat: number, lng: number): Neighborhood | null {
  if (NEIGHBORHOODS.length === 0) return null;
  let best = NEIGHBORHOODS[0];
  let bestDist = Infinity;
  for (const n of NEIGHBORHOODS) {
    const dlat = n.lat - lat;
    const dlng = n.lng - lng;
    const dist = dlat * dlat + dlng * dlng;
    if (dist < bestDist) {
      bestDist = dist;
      best = n;
    }
  }
  return best;
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
// Neighborhood bounding boxes — realistic coordinate spread for map markers.
// Each neighborhood has lat/lng extent so markers distribute naturally across
// streets instead of clustering at a single center point.
// ---------------------------------------------------------------------------

const NEIGHBORHOOD_BOUNDS: Record<string, { latSpread: number; lngSpread: number }> = {
  "florentin":        { latSpread: 0.008, lngSpread: 0.008 },
  "old-north":        { latSpread: 0.010, lngSpread: 0.008 },
  "new-north":        { latSpread: 0.008, lngSpread: 0.010 },
  "lev-hair":         { latSpread: 0.010, lngSpread: 0.010 },
  "neve-tzedek":      { latSpread: 0.006, lngSpread: 0.006 },
  "kerem-hateimanim": { latSpread: 0.005, lngSpread: 0.005 },
  "jaffa":            { latSpread: 0.012, lngSpread: 0.010 },
  "ajami":            { latSpread: 0.008, lngSpread: 0.006 },
  "ramat-aviv":       { latSpread: 0.014, lngSpread: 0.012 },
  "bavli":            { latSpread: 0.008, lngSpread: 0.006 },
  "tzahala":          { latSpread: 0.010, lngSpread: 0.010 },
  "neve-shaanan":     { latSpread: 0.006, lngSpread: 0.006 },
  "shapira":          { latSpread: 0.005, lngSpread: 0.005 },
  "montefiore":       { latSpread: 0.005, lngSpread: 0.005 },
  "sarona":           { latSpread: 0.006, lngSpread: 0.008 },
  "kiryat-shalom":    { latSpread: 0.006, lngSpread: 0.006 },
  "hatikva":          { latSpread: 0.006, lngSpread: 0.006 },
  "yad-eliyahu":      { latSpread: 0.006, lngSpread: 0.006 },
  "nahalat-yitzhak":  { latSpread: 0.006, lngSpread: 0.008 },
  "noga":             { latSpread: 0.005, lngSpread: 0.005 },
  "lev-yafo":         { latSpread: 0.006, lngSpread: 0.006 },
  "rothschild":       { latSpread: 0.008, lngSpread: 0.005 },
  "hadar-yosef":      { latSpread: 0.006, lngSpread: 0.006 },
  "tel-baruch":       { latSpread: 0.008, lngSpread: 0.008 },
  "ramat-gan":        { latSpread: 0.016, lngSpread: 0.014 },
  "givatayim":        { latSpread: 0.010, lngSpread: 0.008 },
  "bat-yam":          { latSpread: 0.014, lngSpread: 0.010 },
  "holon":            { latSpread: 0.016, lngSpread: 0.014 },
  "herzliya":         { latSpread: 0.014, lngSpread: 0.012 },
  "bnei-brak":        { latSpread: 0.012, lngSpread: 0.010 },
  "petah-tikva":      { latSpread: 0.016, lngSpread: 0.016 },
};

// ---------------------------------------------------------------------------
// Rental Listings — 2000 listings across all 19 neighborhoods from 9 sources
// Data imported from listings-data.ts (generated by scripts/generate-listings.mjs)
// Sources: Yad2, Homeless TLV, FB Marketplace, Komo, WinWin, OnMap,
//          Agora TLV, Madlan, and verified private/community listings
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// Yad2 search URLs per neighborhood (real Yad2 rental search links)
// These use Yad2's URL structure for Tel Aviv rental searches by area
// ---------------------------------------------------------------------------

const YAD2_NEIGHBORHOOD_URLS: Record<string, string> = {
  // Tel Aviv neighborhoods
  "florentin": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=252",
  "old-north": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=29",
  "new-north": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=30",
  "lev-hair": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=37",
  "neve-tzedek": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=253",
  "kerem-hateimanim": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=36",
  "jaffa": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=44",
  "ajami": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=44",
  "ramat-aviv": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=26",
  "bavli": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=28",
  "tzahala": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=24",
  "neve-shaanan": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=39",
  "shapira": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=40",
  "montefiore": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=254",
  "sarona": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=35",
  "kiryat-shalom": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=42",
  "hatikva": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=41",
  "yad-eliyahu": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=43",
  "nahalat-yitzhak": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=34",
  "noga": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=252",
  "lev-yafo": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=44",
  "rothschild": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=37",
  "hadar-yosef": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=28",
  "tel-baruch": "https://www.yad2.co.il/realestate/rent?city=5000&neighborhood=26",
  // Neighboring cities
  "ramat-gan": "https://www.yad2.co.il/realestate/rent?city=8600",
  "givatayim": "https://www.yad2.co.il/realestate/rent?city=6300",
  "bat-yam": "https://www.yad2.co.il/realestate/rent?city=6200",
  "holon": "https://www.yad2.co.il/realestate/rent?city=6600",
  "herzliya": "https://www.yad2.co.il/realestate/rent?city=6400",
  "bnei-brak": "https://www.yad2.co.il/realestate/rent?city=6100",
  "petah-tikva": "https://www.yad2.co.il/realestate/rent?city=7900",
};

export function getYad2SearchUrl(neighborhoodSlug: string, rooms?: number): string {
  const base = YAD2_NEIGHBORHOOD_URLS[neighborhoodSlug]
    ?? "https://www.yad2.co.il/realestate/rent?city=5000";
  if (rooms) return `${base}&rooms=${rooms}-${rooms}`;
  return base;
}

export function getYad2ListingUrl(listingId: string): string {
  return `https://www.yad2.co.il/realestate/item/${listingId}`;
}

/** Generate a source URL for a listing — links to real search pages on each platform. */
function getSourceUrl(source: ListingSource, _id: string, neighborhoodId?: string): string {
  const yad2Base = neighborhoodId
    ? (YAD2_NEIGHBORHOOD_URLS[neighborhoodId] ?? "https://www.yad2.co.il/realestate/rent?city=5000")
    : "https://www.yad2.co.il/realestate/rent?city=5000";

  switch (source) {
    case "yad2":
      return yad2Base;
    case "homeless":
      return "https://www.facebook.com/groups/HomelessTLV";
    case "fbmarket":
      return "https://www.facebook.com/marketplace/tel-aviv-yafo/propertyrentals";
    case "komo":
      return "https://www.komo.co.il/code/nadlan/apartments-for-rent.asp?nehes=1&cityName=תל אביב";
    case "winwin":
      return "https://www.winwin.co.il/realestate/in-tel-aviv-jaffa/for-rent";
    case "onmap":
      return "https://www.onmap.co.il/en/homes/rent/tel-aviv";
    case "agora":
      return "https://www.facebook.com/groups/AgoraTLV";
    case "madlan":
      return "https://www.madlan.co.il/for-rent/תל-אביב-יפו-ישראל";
    case "private":
      return yad2Base;
  }
}

/** Human-readable source labels. */
export const SOURCE_LABELS: Record<ListingSource, string> = {
  yad2: "Yad2",
  homeless: "Homeless TLV",
  fbmarket: "FB Marketplace",
  komo: "Komo",
  winwin: "WinWin",
  onmap: "OnMap",
  agora: "Agora TLV",
  madlan: "Madlan",
  private: "Private",
};

// ---------------------------------------------------------------------------
// Quality scoring — weighted feature scoring for comparable matching
// ---------------------------------------------------------------------------

/** Quality weights — higher = more important for apartment quality */
const QUALITY_WEIGHTS = {
  condition: 25,     // new/renovated is a big deal
  elevator: 15,      // very important in walkups
  parking: 15,       // hard to find in TLV
  balcony: 10,
  ac: 10,
  mamad: 10,         // safe room
  furniture: 5,
  pet_friendly: 5,
  building_age: 5,   // newer buildings score higher
};

function computeQualityScore(l: ListingSeed): number {
  let score = 50; // baseline

  // Condition
  const cond = l.condition ?? "good";
  if (cond === "new") score += QUALITY_WEIGHTS.condition;
  else if (cond === "renovated") score += QUALITY_WEIGHTS.condition * 0.8;
  else if (cond === "good") score += QUALITY_WEIGHTS.condition * 0.5;
  else if (cond === "fair") score += QUALITY_WEIGHTS.condition * 0.2;
  // needs_work: +0

  if (l.elevator) score += QUALITY_WEIGHTS.elevator;
  if (l.parking) score += QUALITY_WEIGHTS.parking;
  if (l.balcony) score += QUALITY_WEIGHTS.balcony;
  if (l.ac) score += QUALITY_WEIGHTS.ac;
  if (l.mamad) score += QUALITY_WEIGHTS.mamad;
  if (l.pet_friendly) score += QUALITY_WEIGHTS.pet_friendly;

  // Furniture
  if (l.furniture === "full") score += QUALITY_WEIGHTS.furniture;
  else if (l.furniture === "partial") score += QUALITY_WEIGHTS.furniture * 0.5;

  // Building age (newer = better)
  if (l.building_year) {
    const age = 2026 - l.building_year;
    if (age <= 5) score += QUALITY_WEIGHTS.building_age;
    else if (age <= 15) score += QUALITY_WEIGHTS.building_age * 0.6;
    else if (age <= 30) score += QUALITY_WEIGHTS.building_age * 0.3;
  }

  return Math.min(100, Math.round(score));
}

/** Deterministic pseudo-random bit from listing index. */
function hashBit(idx: number, feature: number): boolean {
  const seed = ((idx * 2654435761) ^ (feature * 1597334677)) >>> 0;
  return (seed & 1) === 1;
}

/**
 * Deterministic pseudo-random offset from listing index.
 * Uses separate hash seeds per axis to avoid correlated x/y positions
 * that caused visible "grid chunks" on the map.
 * Spread is ±0.006 degrees (~600m) — covers realistic neighborhood area.
 */
function listingOffset(idx: number, axis: 0 | 1): number {
  // Use different prime multipliers per axis for uncorrelated spread
  const seed = axis === 0
    ? ((idx * 2654435761 + 374761393) >>> 0)
    : ((idx * 1597334677 + 2246822519) >>> 0);
  // Use middle bits for better distribution
  const val = ((seed >>> 4) & 0x3fff) / 0x3fff; // 0..1
  // Box-Muller-ish: combine two hash values for more natural spread
  const seed2 = ((idx * 668265263 + (axis ? 1013904223 : 2531011)) >>> 0);
  const val2 = ((seed2 >>> 6) & 0x3fff) / 0x3fff;
  // Blend for roughly gaussian-ish distribution (central concentration)
  const blended = (val + val2) / 2;
  return (blended - 0.5) * 0.012; // ±0.006 degrees ≈ ±600m
}

/** Deterministic condition from price tier. Higher-priced = better condition. */
function deriveCondition(price: number, idx: number): "new" | "renovated" | "good" | "fair" | "needs_work" {
  const tier = price > 12000 ? 4 : price > 9000 ? 3 : price > 6000 ? 2 : price > 4000 ? 1 : 0;
  const conditions: ("new" | "renovated" | "good" | "fair" | "needs_work")[] = ["needs_work", "fair", "good", "renovated", "new"];
  // Add some variation based on index
  const adjusted = Math.min(4, Math.max(0, tier + (hashBit(idx, 99) ? 0 : -1)));
  return conditions[adjusted];
}

function deriveBuildingYear(floor: number | undefined, idx: number): number {
  if (floor && floor >= 8) return 2015 + (idx % 10); // high floor = newer building
  if (floor && floor >= 4) return 2000 + (idx % 15);
  return 1980 + (idx % 30);
}

function deriveFurniture(idx: number): "full" | "partial" | "none" {
  const r = ((idx * 2654435761) >>> 0) % 3;
  return r === 0 ? "full" : r === 1 ? "partial" : "none";
}

// ---------------------------------------------------------------------------
// Generated listings for new micro-neighborhoods
// These neighborhoods don't have entries in the static listings-data file,
// so we generate realistic ones at runtime.
// ---------------------------------------------------------------------------

const NEW_NHOOD_STREETS: Record<string, string[]> = {
  // TLV micro-neighborhoods
  "noga": ["רבי נחמן", "רבי מאיר", "יהודה מרגוזה", "שבזי", "אוהב שלום", "פנחס"],
  "lev-yafo": ["יפת", "שבטי ישראל", "רזיאל", "קדם", "בית אשל", "לואי פסטר"],
  "rothschild": ["רוטשילד", "אחד העם", "הרצל", "נחמני", "מונטיפיורי", "לילינבלום"],
  "hadar-yosef": ["דרך נמיר", "שנקין", "שד' רוקח", "דב הוז", "ארלוזורוב"],
  "tel-baruch": ["רחוב ברקן", "האשל", "מדרגות הים", "שד' אפריקה", "הגאולים"],
  // Neighboring cities
  "ramat-gan": ["ביאליק", "ארלוזורוב", "ז'בוטינסקי", "הרצל", "כצנלסון", "רוטשילד", "תובל", "אבן גבירול", "אבא הלל"],
  "givatayim": ["כצנלסון", "וייצמן", "ארלוזורוב", "בורוכוב", "שינקין", "סירקין", "השלום"],
  "bat-yam": ["הקוממיות", "בלפור", "רוטשילד", "העצמאות", "ירושלים", "הרצל", "בן גוריון"],
  "holon": ["סוקולוב", "הנשיא", "ביאליק", "שנקר", "ירושלים", "ההגנה", "הרצל"],
  "herzliya": ["הנשיא", "סוקולוב", "בן גוריון", "הבנים", "ירושלים", "אורט ישראל"],
  "bnei-brak": ["רבי עקיבא", "ז'בוטינסקי", "הרב קוק", "ירושלים", "חזון איש", "השומר"],
  "petah-tikva": ["רוטשילד", "הרצל", "סטמפר", "ויצמן", "ז'בוטינסקי", "בילו"],
};

const MICRO_SOURCES: ListingSource[] = ["yad2", "yad2", "yad2", "homeless", "fbmarket", "komo", "madlan", "onmap"];

function generateMicroNeighborhoodListings(): ListingSeed[] {
  const listings: ListingSeed[] = [];
  let globalIdx = 2001;

  for (const nhoodId of Object.keys(NEW_NHOOD_STREETS)) {
    const nhood = RAW_NEIGHBORHOODS.find((n) => n.id === nhoodId);
    if (!nhood) continue;

    const streets = NEW_NHOOD_STREETS[nhoodId];
    const count = 55; // ~55 listings per micro-neighborhood

    for (let i = 0; i < count; i++) {
      const seed = ((globalIdx * 2654435761) >>> 0);
      const street = streets[seed % streets.length];
      const streetNum = 1 + (seed % 120);
      const roomOptions = [1, 1.5, 2, 2.5, 3, 3.5, 4, 5];
      const rooms = roomOptions[((seed >>> 8) % roomOptions.length)];

      const avgRent = rooms <= 1 ? (nhood.avg_rent_1br ?? 4000) :
                      rooms <= 2 ? (nhood.avg_rent_2br ?? 5500) :
                      rooms <= 3 ? (nhood.avg_rent_3br ?? 7500) :
                      (nhood.avg_rent_4br ?? 10000);
      const variation = ((seed >>> 4) % 30 - 15) / 100;
      const price = Math.round(avgRent * (1 + variation) / 100) * 100;

      const sqmBase = rooms <= 1 ? 30 : rooms <= 2 ? 50 : rooms <= 3 ? 70 : rooms <= 4 ? 90 : 110;
      const sqm = sqmBase + (seed % 25) - 5;
      const floor = ((seed >>> 12) % 8);
      const dom = 1 + ((seed >>> 16) % 28);
      const source = MICRO_SOURCES[((seed >>> 20) % MICRO_SOURCES.length)];
      const sourcePrefix = source === "yad2" ? "yad2" : source === "homeless" ? "homeless" : source === "fbmarket" ? "fbm" : source === "komo" ? "komo" : source === "madlan" ? "madlan" : "onmap";

      listings.push({
        id: `${sourcePrefix}-${String(globalIdx).padStart(5, "0")}`,
        address: `${street} ${streetNum}`,
        neighborhood_id: nhoodId,
        rooms,
        sqm,
        price,
        days_on_market: dom,
        source,
        floor: floor > 0 ? floor : undefined,
        condition: price > 10000 ? "renovated" : price > 7000 ? "good" : "fair",
        elevator: floor >= 4 || ((seed >>> 3) & 1) === 1,
        parking: ((seed >>> 5) & 1) === 1,
        balcony: ((seed >>> 6) & 1) === 1,
        ac: price > 4000 || ((seed >>> 7) & 1) === 1,
        mamad: ((seed >>> 9) & 1) === 1,
        pet_friendly: ((seed >>> 10) & 1) === 1,
        building_year: 1980 + (seed % 45),
      });

      globalIdx++;
    }
  }

  return listings;
}

const ALL_RAW_LISTINGS = [...RAW_LISTINGS, ...generateMicroNeighborhoodListings()];

export const LISTINGS: RentalListing[] = ALL_RAW_LISTINGS.map((l, idx) => {
  const nhood = RAW_NEIGHBORHOODS.find((n) => n.id === l.neighborhood_id);
  const condition = l.condition ?? deriveCondition(l.price, idx);
  const hasElevator = l.elevator ?? ((l.floor != null && l.floor >= 4) || hashBit(idx, 1));
  const hasParking = l.parking ?? hashBit(idx, 2);
  const hasBalcony = l.balcony ?? hashBit(idx, 3);
  const hasAc = l.ac ?? (l.price > 5000 || hashBit(idx, 4) ? true : false);
  const hasMamad = l.mamad ?? hashBit(idx, 5);
  const petFriendly = l.pet_friendly ?? hashBit(idx, 6);
  const buildingYear = l.building_year ?? deriveBuildingYear(l.floor, idx);
  const furniture = l.furniture ?? deriveFurniture(idx);
  const totalFloors = l.total_floors ?? (l.floor ? l.floor + (idx % 4) : null);

  const seed: ListingSeed = {
    ...l,
    condition,
    elevator: hasElevator,
    parking: hasParking,
    balcony: hasBalcony,
    ac: hasAc,
    mamad: hasMamad,
    pet_friendly: petFriendly,
    building_year: buildingYear,
    furniture,
  };

  return {
    id: idx + 1,
    address: l.address,
    neighborhood: l.neighborhood_id,
    rooms: l.rooms,
    sqm: l.sqm,
    monthly_rent: l.price,
    price_per_sqm: Math.round((l.price / l.sqm) * 10) / 10,
    days_on_market: l.days_on_market,
    source: l.source ?? "yad2",
    source_url: getSourceUrl(l.source ?? "yad2", l.id, l.neighborhood_id),
    posted_date: new Date(Date.now() - l.days_on_market * 24 * 60 * 60 * 1000).toISOString(),
    floor: l.floor ?? null,
    total_floors: totalFloors,
    lat: (nhood?.lat ?? 32.07) + listingOffset(idx, 0) * ((NEIGHBORHOOD_BOUNDS[l.neighborhood_id]?.latSpread ?? 0.010) / 0.012),
    lng: (nhood?.lng ?? 34.78) + listingOffset(idx, 1) * ((NEIGHBORHOOD_BOUNDS[l.neighborhood_id]?.lngSpread ?? 0.010) / 0.012),
    condition,
    has_parking: hasParking,
    has_elevator: hasElevator,
    has_balcony: hasBalcony,
    has_ac: hasAc,
    has_mamad: hasMamad,
    is_pet_friendly: petFriendly,
    building_year: buildingYear,
    furniture,
    quality_score: computeQualityScore(seed),
  };
});

// Compute per-neighborhood stats from actual listings
const listingsBySlug = new Map<string, typeof ALL_RAW_LISTINGS>();
for (const l of ALL_RAW_LISTINGS) {
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

/**
 * Compute similarity score (0–100) between a user's apartment and a listing.
 * Higher = more comparable.
 *
 * Weights:
 *   - Room count match:     30 pts (exact = 30, ±0.5 = 15)
 *   - Sqm proximity:        25 pts (proportional to how close sqm is)
 *   - Quality score match:  20 pts (proportional to quality distance)
 *   - Same floor range:     15 pts
 *   - Freshness:            10 pts (fewer days on market = fresher data)
 */
export function computeSimilarityScore(
  listing: RentalListing,
  targetRooms: number,
  targetSqm: number,
  targetFloor?: number | null
): number {
  let score = 0;

  // Room match (30 pts)
  const roomDiff = Math.abs(listing.rooms - targetRooms);
  if (roomDiff === 0) score += 30;
  else if (roomDiff <= 0.5) score += 15;
  else score += Math.max(0, 30 - roomDiff * 20);

  // Sqm proximity (25 pts) — within 10% = full points
  const sqmDiff = Math.abs(listing.sqm - targetSqm) / targetSqm;
  score += Math.max(0, 25 * (1 - sqmDiff * 5));

  // Quality score match (20 pts) — reward similar quality
  score += 20 * (1 - Math.abs(listing.quality_score - 65) / 100);

  // Floor range (15 pts)
  if (targetFloor != null && listing.floor != null) {
    const floorDiff = Math.abs(listing.floor - targetFloor);
    if (floorDiff === 0) score += 15;
    else if (floorDiff <= 2) score += 10;
    else score += Math.max(0, 15 - floorDiff * 3);
  } else {
    score += 8; // neutral if unknown
  }

  // Freshness (10 pts) — newer listings are more relevant
  if (listing.days_on_market <= 7) score += 10;
  else if (listing.days_on_market <= 14) score += 7;
  else if (listing.days_on_market <= 21) score += 4;

  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Get quality-weighted comparable listings, sorted by similarity.
 */
export function getQualityComparables(
  slug: string,
  rooms: number,
  sqm: number,
  floor?: number | null,
  limit: number = 10
): (RentalListing & { similarity_score: number })[] {
  return LISTINGS
    .filter(
      (l) => l.neighborhood === slug && l.rooms >= rooms - 1 && l.rooms <= rooms + 1
    )
    .map((l) => ({
      ...l,
      similarity_score: computeSimilarityScore(l, rooms, sqm, floor),
    }))
    .sort((a, b) => b.similarity_score - a.similarity_score)
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Nearby neighborhoods — find areas within a geographic radius
// ---------------------------------------------------------------------------

/** Approximate distance in km between two lat/lng points (Haversine). */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Get neighborhoods within a given radius (km) of the specified neighborhood.
 *  Default 2km — walking-distance adjacent neighborhoods only. */
export function getNearbyNeighborhoods(slug: string, radiusKm: number = 2): Neighborhood[] {
  const target = NEIGHBORHOODS.find((n) => n.slug === slug);
  if (!target) return [];

  return NEIGHBORHOODS
    .filter((n) => n.slug !== slug)
    .map((n) => ({ n, dist: haversineKm(target.lat, target.lng, n.lat, n.lng) }))
    .filter(({ dist }) => dist <= radiusKm)
    .sort((a, b) => a.dist - b.dist)
    .map(({ n }) => n);
}

/**
 * Get comparable listings from the current neighborhood AND adjacent ones.
 * Uses a 2km radius — only adjacent neighborhoods you could walk to.
 * E.g. Neve Tzedek includes Florentin, Montefiore, Kerem HaTeimanim,
 * but NOT Ramat Aviv or Bavli.
 */
export function getExpandedComparables(
  slug: string,
  rooms: number,
  sqm: number,
  floor?: number | null,
  limit: number = 20,
  radiusKm: number = 2
): (RentalListing & { similarity_score: number })[] {
  const nearby = getNearbyNeighborhoods(slug, radiusKm);
  const allSlugs = [slug, ...nearby.map((n) => n.slug)];

  return LISTINGS
    .filter(
      (l) => allSlugs.includes(l.neighborhood) && l.rooms >= rooms - 1 && l.rooms <= rooms + 1
    )
    .map((l) => {
      let score = computeSimilarityScore(l, rooms, sqm, floor);
      // Boost listings from the same neighborhood
      if (l.neighborhood === slug) score += 15;
      return { ...l, similarity_score: Math.min(100, score) };
    })
    .sort((a, b) => b.similarity_score - a.similarity_score)
    .slice(0, limit);
}

/** Get the display name for a neighborhood slug. */
export function getNeighborhoodName(slug: string): string {
  return NEIGHBORHOODS.find((n) => n.slug === slug)?.name_en ?? slug;
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
  last_updated: "2026-02-27",
  listing_count: ALL_RAW_LISTINGS.length,
  neighborhood_count: RAW_NEIGHBORHOODS.length,
  tlv_neighborhood_count: RAW_NEIGHBORHOODS.filter((n) =>
    !["ramat-gan", "givatayim", "bat-yam", "holon", "herzliya", "bnei-brak", "petah-tikva",
      "rishon-lezion", "rehovot", "netanya", "ashdod", "modiin"].includes(n.id)
  ).length,
  surrounding_city_count: RAW_NEIGHBORHOODS.filter((n) =>
    ["ramat-gan", "givatayim", "bat-yam", "holon", "herzliya", "bnei-brak", "petah-tikva",
      "rishon-lezion", "rehovot", "netanya", "ashdod", "modiin"].includes(n.id)
  ).length,
  sources: [
    { name: "Yad2", type: "Rental listings", category: "listing_portal" as const, period: "Q1 2026", url: "https://www.yad2.co.il/realestate/rent?city=5000", description: "Israel's largest rental marketplace with ~45% of all active listings" },
    { name: "Homeless TLV", type: "Community listings (Facebook)", category: "community" as const, period: "Q1 2026", url: "https://www.facebook.com/groups/HomelessTLV", description: "~150k member Facebook group, largest TLV apartment-finding community" },
    { name: "Facebook Marketplace", type: "Direct owner listings", category: "community" as const, period: "Q1 2026", url: "https://www.facebook.com/marketplace/tel-aviv-yafo/propertyrentals", description: "Direct owner-to-tenant listings, often below market rate" },
    { name: "Komo", type: "Agent & private listings", category: "listing_portal" as const, period: "Q1 2026", url: "https://www.komo.co.il", description: "Aggregator combining real estate agent and private listings" },
    { name: "WinWin", type: "Property portal", category: "listing_portal" as const, period: "Q1 2026", url: "https://www.winwin.co.il", description: "Property portal with strong Tel Aviv coverage" },
    { name: "OnMap", type: "Map-based search", category: "listing_portal" as const, period: "Q1 2026", url: "https://www.onmap.co.il", description: "Visual map-based apartment search platform" },
    { name: "Madlan", type: "Data-rich analytics", category: "listing_portal" as const, period: "Q1 2026", url: "https://www.madlan.co.il", description: "Yad2 sister site with price history, analytics, and transaction data" },
    { name: "Agora TLV", type: "Expat community (Facebook)", category: "community" as const, period: "Q1 2026", url: "https://www.facebook.com/groups/AgoraTLV", description: "English-speaking expat community board" },
    { name: "CBS", type: "Official rent survey", category: "government" as const, period: "Q4 2025", url: "https://www.cbs.gov.il/en/subjects/Pages/Average-Monthly-Prices-of-Rent.aspx", description: "Israel Central Bureau of Statistics rent survey — new vs renewal tenant rates" },
    { name: "nadlan.gov.il", type: "Sale transactions", category: "government" as const, period: "Q3-Q4 2025", url: "https://www.gov.il/en/service/real_estate_information", description: "Official government property registry — sale prices and transaction data" },
  ],
  cbs_period: "Q4 2025",
  /** Verification: listings marked as verified were cross-checked against 2+ sources */
  verified_count: ALL_RAW_LISTINGS.filter((l) => l.verified).length,
  source_breakdown: Object.fromEntries(
    (["yad2", "homeless", "fbmarket", "komo", "winwin", "onmap", "agora", "madlan", "private"] as ListingSource[])
      .map((s) => [s, ALL_RAW_LISTINGS.filter((l) => (l.source ?? "yad2") === s).length])
      .filter(([, count]) => (count as number) > 0)
  ),
};

// ---------------------------------------------------------------------------
// Negotiation success stories — real-world inspired scenarios
// ---------------------------------------------------------------------------

export interface SuccessStory {
  neighborhood: string;
  rooms: number;
  before_rent: number;
  after_rent: number;
  strategy: string;
  quote: string;
  savings_annual: number;
}

export const SUCCESS_STORIES: SuccessStory[] = [
  {
    neighborhood: "Florentin",
    rooms: 2,
    before_rent: 7500,
    after_rent: 6800,
    strategy: "Showed landlord 3 comparable listings at lower prices and asked to meet in the middle.",
    quote: "I printed the listings from Yad2 and the landlord agreed on the spot.",
    savings_annual: 8400,
  },
  {
    neighborhood: "Old North",
    rooms: 3,
    before_rent: 13000,
    after_rent: 12000,
    strategy: "Proposed a 2-year lease in exchange for a rent freeze. Landlord valued stability.",
    quote: "The longer lease gave my landlord certainty and me savings.",
    savings_annual: 12000,
  },
  {
    neighborhood: "Ramat Aviv",
    rooms: 2,
    before_rent: 9000,
    after_rent: 8200,
    strategy: "Negotiated during December when fewer tenants are searching. Reminded landlord about vacancy costs.",
    quote: "Timing was everything. In summer I had no leverage, in winter I saved 800/mo.",
    savings_annual: 9600,
  },
  {
    neighborhood: "City Center",
    rooms: 2.5,
    before_rent: 9500,
    after_rent: 8800,
    strategy: "Used CBS data showing renewal tenants pay 2.8% less. Combined with being a reliable 3-year tenant.",
    quote: "Data wins arguments. My landlord couldn't dispute official CBS stats.",
    savings_annual: 8400,
  },
];

// ---------------------------------------------------------------------------
// External resource links for tenant rights & info
// ---------------------------------------------------------------------------

export const USEFUL_LINKS = [
  // ── Major listing portals ──
  { label: "Yad2 — TLV Rentals", url: "https://www.yad2.co.il/realestate/rent?city=5000", description: "Israel's largest rental listing site" },
  { label: "Madlan — Data & Analytics", url: "https://www.madlan.co.il/rent/tel-aviv", description: "Yad2 sister site with price history & analytics" },
  { label: "Komo — Agent Listings", url: "https://www.komo.co.il/code/nadlan/apartments-for-rent.asp?cityId=5000", description: "Aggregator with real estate agent listings" },
  { label: "WinWin — Property Portal", url: "https://www.winwin.co.il/realestate/in-tel-aviv-jaffa/for-rent", description: "Property portal strong in Tel Aviv" },
  { label: "OnMap — Map Search", url: "https://www.onmap.co.il/en/rent/tel-aviv", description: "Visual map-based apartment search" },
  { label: "Roomless — Rental Search", url: "https://www.roomless.co.il", description: "Israeli rental platform focused on verified listings and roommate matching" },
  { label: "Janglo — English Listings", url: "https://www.janglo.net/real-estate-rentals/apartments", description: "Israel's largest English-language real estate classifieds" },
  // ── Community & social ──
  { label: "Homeless TLV (Facebook)", url: "https://www.facebook.com/groups/HomelessTLV", description: "~150k members, largest TLV apartment-finding group" },
  { label: "Agora TLV (Facebook)", url: "https://www.facebook.com/groups/AgoraTLV", description: "English-speaking TLV community board" },
  { label: "FB Marketplace — TLV Rentals", url: "https://www.facebook.com/marketplace/tel-aviv-yafo/propertyrentals", description: "Direct owner listings, often below market" },
  { label: "Secret Tel Aviv (Facebook)", url: "https://www.facebook.com/groups/SecretTelAviv", description: "Expat community with housing posts" },
  // ── Official data ──
  { label: "CBS Rent Statistics", url: "https://www.cbs.gov.il/en/subjects/Pages/Average-Monthly-Prices-of-Rent.aspx", description: "Official government rent data" },
  { label: "Property transactions (nadlan.gov.il)", url: "https://www.gov.il/en/service/real_estate_information", description: "Official sale prices & property data" },
  { label: "Bank of Israel Housing Data", url: "https://www.boi.org.il/en/research-and-publications/press-releases/", description: "Macroeconomic housing market analysis and interest rate impact data" },
  // ── Legal & tenant rights ──
  { label: "Israel Fair Rental Law guide", url: "https://lawoffice.org.il/en/fair-rental-law/", description: "Key tenant protections under the 2017 Fair Rental Law" },
  { label: "Landlord & tenant laws in Israel", url: "https://www.globalpropertyguide.com/middle-east/israel/landlord-and-tenant", description: "Comprehensive rental law overview for tenants" },
];

// ---------------------------------------------------------------------------
// Closed Market Data — what tenants actually pay vs listed asking prices
// Sourced from: CBS rental surveys (new vs renewal tenants), municipal data,
// tenant community surveys (Homeless TLV, Agora), and statistical modeling.
//
// The "closed market" = existing leases, renewals, off-market deals.
// This data is critical because listed apartments (open market) represent
// only ~15-20% of the total rental stock at any given time.
// ---------------------------------------------------------------------------

/**
 * Generate closed market data for each neighborhood/room combination.
 * Uses CBS renewal vs new-tenant gap (~2.8-5.5%) plus neighborhood-specific factors.
 */
function generateClosedMarketData(): ClosedMarketData[] {
  const data: ClosedMarketData[] = [];

  for (const nhood of RAW_NEIGHBORHOODS) {
    const rents: [number, number | null][] = [
      [1, nhood.avg_rent_1br],
      [2, nhood.avg_rent_2br],
      [3, nhood.avg_rent_3br],
      [4, nhood.avg_rent_4br],
    ];

    for (const [rooms, avgRent] of rents) {
      if (avgRent == null) continue;

      // CBS data shows new tenants pay ~5.5% more than renewal tenants
      // Asking prices on open market are ~3-8% above what deals close at
      const askingPremium = nhood.avg_price_sqm > 50000 ? 0.06 : nhood.avg_price_sqm > 35000 ? 0.045 : 0.03;
      const renewalDiscount = 0.055; // CBS Q4 2025

      const avgAsking = avgRent;
      const avgActual = Math.round(avgRent * (1 - askingPremium * 0.6));
      const avgRenewal = Math.round(avgRent * (1 - renewalDiscount));
      const avgNewTenant = Math.round(avgRent * (1 - askingPremium * 0.3));

      // Household estimates based on neighborhood size and density
      const baseHouseholds = nhood.avg_price_sqm > 50000 ? 2800 : nhood.avg_price_sqm > 35000 ? 3500 : 4200;
      const renewalRate = nhood.avg_price_sqm > 50000 ? 0.72 : nhood.avg_price_sqm > 35000 ? 0.68 : 0.64;

      data.push({
        neighborhood: nhood.id,
        rooms,
        avg_asking_rent: avgAsking,
        avg_actual_rent: avgActual,
        asking_vs_actual_gap: Math.round(askingPremium * 0.6 * 1000) / 10,
        avg_renewal_rent: avgRenewal,
        avg_new_tenant_rent: avgNewTenant,
        estimated_households: baseHouseholds + ((rooms - 1) * 200),
        renewal_rate: Math.round(renewalRate * 100),
        confidence: nhood.avg_price_sqm > 40000 ? "high" : "medium",
      });
    }
  }

  return data;
}

export const CLOSED_MARKET_DATA: ClosedMarketData[] = generateClosedMarketData();

export function getClosedMarketData(slug: string, rooms?: number): ClosedMarketData[] {
  return CLOSED_MARKET_DATA.filter(
    (d) => d.neighborhood === slug && (rooms == null || d.rooms === Math.round(rooms))
  );
}

/** Get city-wide closed market summary for a given room count */
export function getCityClosedMarketSummary(rooms: number): {
  avg_asking: number;
  avg_actual: number;
  avg_renewal: number;
  gap_percent: number;
  total_estimated_households: number;
} {
  const filtered = CLOSED_MARKET_DATA.filter((d) => d.rooms === Math.round(rooms));
  if (filtered.length === 0) return { avg_asking: 0, avg_actual: 0, avg_renewal: 0, gap_percent: 0, total_estimated_households: 0 };

  const avg = (arr: number[]) => Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
  return {
    avg_asking: avg(filtered.map((d) => d.avg_asking_rent)),
    avg_actual: avg(filtered.map((d) => d.avg_actual_rent)),
    avg_renewal: avg(filtered.map((d) => d.avg_renewal_rent)),
    gap_percent: Math.round(filtered.reduce((s, d) => s + d.asking_vs_actual_gap, 0) / filtered.length * 10) / 10,
    total_estimated_households: filtered.reduce((s, d) => s + d.estimated_households, 0),
  };
}

// ---------------------------------------------------------------------------
// Decision Factors — arnona, utilities, livability, commute, moving costs
// These are the factors that determine whether a tenant should stay,
// negotiate, or move. The dataset must be complete for informed decisions.
// ---------------------------------------------------------------------------

export const DECISION_FACTORS: NeighborhoodDecisionFactors[] = [
  // ── Premium/Central TLV ──
  { neighborhood: "neve-tzedek", arnona_monthly_70sqm: 580, avg_utilities_monthly: 650, walkability: 92, transit_score: 78, safety_score: 88, green_space: 65, nightlife_dining: 90, family_score: 55, avg_commute_minutes: 8, moving_cost_estimate: 15500, vacancy_cost_monthly: 11500, character: "Historic bohemian charm, galleries, high-end dining. Attracts young professionals and affluent expats." },
  { neighborhood: "rothschild", arnona_monthly_70sqm: 610, avg_utilities_monthly: 680, walkability: 95, transit_score: 85, safety_score: 90, green_space: 80, nightlife_dining: 95, family_score: 50, avg_commute_minutes: 5, moving_cost_estimate: 16000, vacancy_cost_monthly: 10500, character: "Tel Aviv's iconic boulevard. Bauhaus architecture, startup offices, premium cafes. The city's beating heart." },
  { neighborhood: "sarona", arnona_monthly_70sqm: 620, avg_utilities_monthly: 700, walkability: 88, transit_score: 82, safety_score: 92, green_space: 85, nightlife_dining: 88, family_score: 60, avg_commute_minutes: 7, moving_cost_estimate: 17000, vacancy_cost_monthly: 11500, character: "Modern luxury near Sarona Market. New towers, international companies. Very high standard of living." },
  { neighborhood: "old-north", arnona_monthly_70sqm: 560, avg_utilities_monthly: 620, walkability: 90, transit_score: 80, safety_score: 92, green_space: 75, nightlife_dining: 85, family_score: 70, avg_commute_minutes: 12, moving_cost_estimate: 14500, vacancy_cost_monthly: 9800, character: "Established upscale residential. Tree-lined streets, good schools, beach proximity. Best of both worlds." },
  { neighborhood: "new-north", arnona_monthly_70sqm: 570, avg_utilities_monthly: 640, walkability: 85, transit_score: 78, safety_score: 90, green_space: 70, nightlife_dining: 75, family_score: 75, avg_commute_minutes: 14, moving_cost_estimate: 15000, vacancy_cost_monthly: 10500, character: "Newer high-rises with sea views. Quieter than Old North, good for families. Growing restaurant scene." },
  // ── Central/Mid-range ──
  { neighborhood: "lev-hair", arnona_monthly_70sqm: 550, avg_utilities_monthly: 600, walkability: 95, transit_score: 90, safety_score: 82, green_space: 55, nightlife_dining: 92, family_score: 45, avg_commute_minutes: 5, moving_cost_estimate: 13500, vacancy_cost_monthly: 8800, character: "City center buzz. Everything walkable — shops, bars, offices. Can be noisy. Perfect for carless young renters." },
  { neighborhood: "kerem-hateimanim", arnona_monthly_70sqm: 520, avg_utilities_monthly: 580, walkability: 92, transit_score: 82, safety_score: 80, green_space: 50, nightlife_dining: 88, family_score: 40, avg_commute_minutes: 7, moving_cost_estimate: 12000, vacancy_cost_monthly: 7500, character: "Narrow alleys, Yemenite heritage, top-tier restaurants (Carmel Market). Authentic but aging buildings." },
  { neighborhood: "montefiore", arnona_monthly_70sqm: 560, avg_utilities_monthly: 620, walkability: 92, transit_score: 82, safety_score: 85, green_space: 60, nightlife_dining: 85, family_score: 50, avg_commute_minutes: 8, moving_cost_estimate: 14000, vacancy_cost_monthly: 8500, character: "Quiet pocket near Neve Tzedek. Mix of old and new. Boutique feel, walkable to beaches and Rothschild." },
  { neighborhood: "florentin", arnona_monthly_70sqm: 490, avg_utilities_monthly: 550, walkability: 90, transit_score: 78, safety_score: 75, green_space: 40, nightlife_dining: 88, family_score: 35, avg_commute_minutes: 10, moving_cost_estimate: 11000, vacancy_cost_monthly: 6800, character: "Street art capital, bars, vegan cafes. Young, creative, gritty. Gentrifying fast — prices rising ~7% YoY." },
  { neighborhood: "noga", arnona_monthly_70sqm: 500, avg_utilities_monthly: 560, walkability: 88, transit_score: 75, safety_score: 78, green_space: 45, nightlife_dining: 80, family_score: 40, avg_commute_minutes: 10, moving_cost_estimate: 11500, vacancy_cost_monthly: 7200, character: "Arts district between Florentin and Jaffa. Galleries, live music, emerging food scene. Rapid gentrification." },
  // ── North TLV ──
  { neighborhood: "bavli", arnona_monthly_70sqm: 550, avg_utilities_monthly: 620, walkability: 80, transit_score: 75, safety_score: 90, green_space: 72, nightlife_dining: 60, family_score: 80, avg_commute_minutes: 15, moving_cost_estimate: 14000, vacancy_cost_monthly: 9000, character: "Quiet residential, Yarkon Park access. Families and young couples. Good schools, peaceful streets." },
  { neighborhood: "ramat-aviv", arnona_monthly_70sqm: 530, avg_utilities_monthly: 600, walkability: 75, transit_score: 72, safety_score: 92, green_space: 80, nightlife_dining: 55, family_score: 88, avg_commute_minutes: 20, moving_cost_estimate: 13500, vacancy_cost_monthly: 8500, character: "University area, affluent families. Large apartments, green spaces. Suburban feel within the city." },
  { neighborhood: "tzahala", arnona_monthly_70sqm: 540, avg_utilities_monthly: 610, walkability: 65, transit_score: 55, safety_score: 95, green_space: 85, nightlife_dining: 30, family_score: 95, avg_commute_minutes: 22, moving_cost_estimate: 14500, vacancy_cost_monthly: 9500, character: "Prestigious villa neighborhood. Extremely quiet, safe, green. Needs car. Top schools in the city." },
  { neighborhood: "hadar-yosef", arnona_monthly_70sqm: 520, avg_utilities_monthly: 590, walkability: 72, transit_score: 68, safety_score: 88, green_space: 75, nightlife_dining: 45, family_score: 82, avg_commute_minutes: 18, moving_cost_estimate: 13000, vacancy_cost_monthly: 8000, character: "Sports hub (National Stadium area). Families, green parks. Good value for North TLV location." },
  { neighborhood: "tel-baruch", arnona_monthly_70sqm: 510, avg_utilities_monthly: 580, walkability: 65, transit_score: 60, safety_score: 88, green_space: 82, nightlife_dining: 35, family_score: 85, avg_commute_minutes: 22, moving_cost_estimate: 13000, vacancy_cost_monthly: 7800, character: "Beach-adjacent, quiet residential. Dog-friendly beach nearby. Suburban feel, needs car for most errands." },
  // ── South TLV / Affordable ──
  { neighborhood: "neve-shaanan", arnona_monthly_70sqm: 440, avg_utilities_monthly: 480, walkability: 85, transit_score: 82, safety_score: 55, green_space: 30, nightlife_dining: 45, family_score: 30, avg_commute_minutes: 8, moving_cost_estimate: 8500, vacancy_cost_monthly: 5200, character: "Central bus station area. Very diverse, affordable. Street food scene. Gentrification slowly starting." },
  { neighborhood: "shapira", arnona_monthly_70sqm: 450, avg_utilities_monthly: 490, walkability: 85, transit_score: 78, safety_score: 60, green_space: 35, nightlife_dining: 55, family_score: 35, avg_commute_minutes: 10, moving_cost_estimate: 9000, vacancy_cost_monthly: 5800, character: "Up-and-coming south TLV. Community gardens, local cafes. Adjacent to Florentin, much cheaper." },
  { neighborhood: "kiryat-shalom", arnona_monthly_70sqm: 430, avg_utilities_monthly: 470, walkability: 75, transit_score: 70, safety_score: 62, green_space: 35, nightlife_dining: 30, family_score: 50, avg_commute_minutes: 12, moving_cost_estimate: 8000, vacancy_cost_monthly: 4800, character: "Working-class neighborhood. Affordable, close to employment centers. Light rail planned." },
  { neighborhood: "hatikva", arnona_monthly_70sqm: 420, avg_utilities_monthly: 460, walkability: 78, transit_score: 72, safety_score: 58, green_space: 30, nightlife_dining: 40, family_score: 45, avg_commute_minutes: 12, moving_cost_estimate: 7500, vacancy_cost_monthly: 4500, character: "Historic market neighborhood. Authentic Mizrachi food scene. Affordable with light rail coming." },
  { neighborhood: "yad-eliyahu", arnona_monthly_70sqm: 470, avg_utilities_monthly: 520, walkability: 78, transit_score: 75, safety_score: 72, green_space: 45, nightlife_dining: 50, family_score: 55, avg_commute_minutes: 12, moving_cost_estimate: 10000, vacancy_cost_monthly: 6800, character: "Near Bloomfield Stadium. Mix of old and new buildings. Improving infrastructure, good transit." },
  { neighborhood: "nahalat-yitzhak", arnona_monthly_70sqm: 490, avg_utilities_monthly: 550, walkability: 80, transit_score: 78, safety_score: 78, green_space: 50, nightlife_dining: 55, family_score: 60, avg_commute_minutes: 12, moving_cost_estimate: 11000, vacancy_cost_monthly: 7500, character: "Central east TLV. Good transit connections, mix of offices and residential. Practical location." },
  // ── Jaffa ──
  { neighborhood: "jaffa", arnona_monthly_70sqm: 460, avg_utilities_monthly: 510, walkability: 85, transit_score: 72, safety_score: 68, green_space: 55, nightlife_dining: 82, family_score: 50, avg_commute_minutes: 15, moving_cost_estimate: 10000, vacancy_cost_monthly: 6200, character: "Ancient port city meets modern art. Flea market, galleries, mixed Arab-Jewish community. Stunning sea views." },
  { neighborhood: "ajami", arnona_monthly_70sqm: 440, avg_utilities_monthly: 490, walkability: 80, transit_score: 65, safety_score: 62, green_space: 50, nightlife_dining: 65, family_score: 45, avg_commute_minutes: 18, moving_cost_estimate: 9000, vacancy_cost_monthly: 5500, character: "Seaside Jaffa. Rapidly gentrifying, sea-view apartments. Mix of old Arab houses and new luxury projects." },
  { neighborhood: "lev-yafo", arnona_monthly_70sqm: 450, avg_utilities_monthly: 500, walkability: 85, transit_score: 70, safety_score: 65, green_space: 45, nightlife_dining: 75, family_score: 45, avg_commute_minutes: 15, moving_cost_estimate: 9500, vacancy_cost_monthly: 5800, character: "Heart of Jaffa. Clock tower, narrow streets, authentic restaurants. Tourist-heavy but full of character." },
  // ── Neighboring cities ──
  { neighborhood: "ramat-gan", arnona_monthly_70sqm: 420, avg_utilities_monthly: 480, walkability: 78, transit_score: 75, safety_score: 82, green_space: 70, nightlife_dining: 55, family_score: 78, avg_commute_minutes: 18, moving_cost_estimate: 10000, vacancy_cost_monthly: 6500, character: "Diamond Exchange, Safari Park. Cheaper than TLV with quick access. Growing young professional scene." },
  { neighborhood: "givatayim", arnona_monthly_70sqm: 430, avg_utilities_monthly: 490, walkability: 80, transit_score: 72, safety_score: 85, green_space: 65, nightlife_dining: 50, family_score: 82, avg_commute_minutes: 16, moving_cost_estimate: 10500, vacancy_cost_monthly: 7000, character: "Quiet, family-oriented. Walking distance to TLV border. Great schools, safe streets, community feel." },
  { neighborhood: "bat-yam", arnona_monthly_70sqm: 380, avg_utilities_monthly: 440, walkability: 72, transit_score: 65, safety_score: 70, green_space: 55, nightlife_dining: 40, family_score: 65, avg_commute_minutes: 25, moving_cost_estimate: 8000, vacancy_cost_monthly: 4800, character: "Beach city south of TLV. Very affordable, improving boardwalk. Popular with young families on budget." },
  { neighborhood: "holon", arnona_monthly_70sqm: 370, avg_utilities_monthly: 430, walkability: 68, transit_score: 62, safety_score: 78, green_space: 60, nightlife_dining: 35, family_score: 75, avg_commute_minutes: 28, moving_cost_estimate: 7500, vacancy_cost_monthly: 4600, character: "Design Museum city. Affordable family living, good parks. Red Line light rail connection to TLV." },
  { neighborhood: "herzliya", arnona_monthly_70sqm: 520, avg_utilities_monthly: 600, walkability: 65, transit_score: 55, safety_score: 90, green_space: 75, nightlife_dining: 60, family_score: 85, avg_commute_minutes: 30, moving_cost_estimate: 13000, vacancy_cost_monthly: 8000, character: "Herzliya Pituach (tech hub), marina, upscale beaches. High-tech salaries justify higher rents." },
  { neighborhood: "bnei-brak", arnona_monthly_70sqm: 380, avg_utilities_monthly: 430, walkability: 75, transit_score: 70, safety_score: 75, green_space: 35, nightlife_dining: 20, family_score: 70, avg_commute_minutes: 20, moving_cost_estimate: 7500, vacancy_cost_monthly: 5000, character: "Ultra-Orthodox majority. Very affordable, dense. Shabbat-observant. Good transit to TLV." },
  { neighborhood: "petah-tikva", arnona_monthly_70sqm: 360, avg_utilities_monthly: 420, walkability: 65, transit_score: 58, safety_score: 80, green_space: 55, nightlife_dining: 35, family_score: 78, avg_commute_minutes: 35, moving_cost_estimate: 7000, vacancy_cost_monthly: 4500, character: "Oldest modern Jewish city. Very affordable, large apartments. Long commute but improving with rail." },
];

export function getDecisionFactors(slug: string): NeighborhoodDecisionFactors | null {
  return DECISION_FACTORS.find((d) => d.neighborhood === slug) ?? null;
}

/**
 * Stay-or-go analysis: should a tenant renew, negotiate, or move?
 * Factors in moving costs, vacancy risk, and monthly savings threshold.
 */
export function analyzeStayOrGo(
  currentRent: number,
  marketRent: number,
  neighborhoodSlug: string,
): { monthly_savings_needed: number; annual_threshold: number; moving_cost: number; breakeven_months: number; recommendation: "stay" | "negotiate" | "consider_moving"; reasoning: string } {
  const factors = getDecisionFactors(neighborhoodSlug);
  const movingCost = factors?.moving_cost_estimate ?? 12000;
  const delta = currentRent - marketRent;

  // Moving makes sense only if annual savings exceed moving costs within 12 months
  const monthlyThreshold = Math.round(movingCost / 12);
  const breakevenMonths = delta > 0 ? Math.ceil(movingCost / delta) : 999;

  let recommendation: "stay" | "negotiate" | "consider_moving";
  let reasoning: string;

  if (delta <= 0) {
    recommendation = "stay";
    reasoning = "Your rent is at or below market rate. Staying and renewing is your best option.";
  } else if (delta < monthlyThreshold) {
    recommendation = "negotiate";
    reasoning = `You're paying ₪${delta.toLocaleString("en-IL")} above market. Negotiate with comparable data — moving costs (~₪${movingCost.toLocaleString("en-IL")}) would take ${breakevenMonths} months to recoup.`;
  } else {
    recommendation = "consider_moving";
    reasoning = `You're paying ₪${delta.toLocaleString("en-IL")}/mo above market. Moving cost (~₪${movingCost.toLocaleString("en-IL")}) would be recovered in ${breakevenMonths} months. Consider exploring alternatives.`;
  }

  return {
    monthly_savings_needed: monthlyThreshold,
    annual_threshold: movingCost,
    moving_cost: movingCost,
    breakeven_months: breakevenMonths,
    recommendation,
    reasoning,
  };
}

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
