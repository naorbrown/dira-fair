#!/usr/bin/env node
/**
 * Generate 2000+ realistic Tel Aviv rental listings across 19 neighborhoods
 * from 9 data sources.
 *
 * Usage:
 *   node scripts/generate-listings.mjs > /tmp/listings.ts
 *
 * Output: a TypeScript array literal that can be pasted into data.ts
 */

// ── Neighborhood definitions with realistic street data ──
const NEIGHBORHOODS = [
  {
    id: "florentin",
    streets: [
      "פלורנטין", "ויטל", "הרצל", "אלנבי", "אברבנאל", "שלוש",
      "דרך שלמה", "עולי ציון", "נרקיס", "סימטת בית הבד", "מרזוק ועזר",
      "רבי עקיבא", "פנים מאירות", "שבתאי",
    ],
    priceRange: { studio: [4800, 5800], "1br": [5200, 6800], "2br": [6000, 7800], "2.5br": [6800, 8500], "3br": [8200, 10500], "3.5br": [9200, 11500], "4br": [10500, 13000] },
    floorRange: [1, 5],
    weight: 145, // how many listings to generate
  },
  {
    id: "old-north",
    streets: [
      "דיזנגוף", "אבן גבירול", "ארלוזורוב", "נורדאו", "בן יהודה",
      "פרישמן", "ז'בוטינסקי", "גורדון", "מפו", "ירמיהו",
      "הירקון", "בוגרשוב", "מאיר דיזנגוף",
    ],
    priceRange: { studio: [6200, 7500], "1br": [6500, 8200], "2br": [8800, 11000], "2.5br": [9500, 12000], "3br": [11500, 14500], "3.5br": [12500, 16000], "4br": [14500, 18500] },
    floorRange: [1, 8],
    weight: 165,
  },
  {
    id: "new-north",
    streets: [
      "פנקס", "ז'בוטינסקי", "ויצמן", "דרך נמיר", "יהודה המכבי",
      "קפלן", "בלפור", "שאול המלך", "דוד פינקס", "ברנר",
    ],
    priceRange: { studio: [6800, 8000], "1br": [7000, 8500], "2br": [9800, 12000], "2.5br": [10500, 13000], "3br": [12500, 15500], "3.5br": [13500, 17000], "4br": [15500, 20000] },
    floorRange: [2, 15],
    weight: 135,
  },
  {
    id: "lev-hair",
    streets: [
      "רוטשילד", "שינקין", "אלנבי", "נחלת בנימין", "בוגרשוב",
      "לילנבלום", "גראוזנברג", "מונטיפיורי", "אחד העם", "הרצל",
      "יבנה", "קלישר", "ברנר", "מזרחי",
    ],
    priceRange: { studio: [5500, 6800], "1br": [6000, 7800], "2br": [8000, 10000], "2.5br": [8500, 10800], "3br": [10500, 13500], "3.5br": [12000, 16000], "4br": [14000, 18000] },
    floorRange: [1, 6],
    weight: 145,
  },
  {
    id: "neve-tzedek",
    streets: [
      "שבזי", "רוקח", "אהד העם", "נחלת בנימין", "יחיאלי",
      "מרכז בעלי מלאכה", "פינס", "אילת", "אליפלט", "שדרות חכמי ישראל",
    ],
    priceRange: { studio: [7000, 8500], "1br": [7500, 9200], "2br": [10000, 13000], "2.5br": [11000, 14000], "3br": [14000, 18000], "3.5br": [16000, 20000], "4br": [19000, 25000] },
    floorRange: [1, 5],
    weight: 120,
  },
  {
    id: "kerem-hateimanim",
    streets: [
      "כרם התימנים", "גאולה", "נחלת בנימין", "הכרמל", "יהודה הימית",
      "רבי מאיר", "אנגל", "הילל הזקן", "הגפן",
    ],
    priceRange: { studio: [5000, 6200], "1br": [5500, 7000], "2br": [6800, 8500], "2.5br": [7500, 9200], "3br": [9500, 12000], "3.5br": [10500, 13500], "4br": [12000, 15000] },
    floorRange: [1, 4],
    weight: 100,
  },
  {
    id: "jaffa",
    streets: [
      "יפת", "שבטי ישראל", "אולסבנגר", "ירקון", "רבי יהודה",
      "אמילי זולא", "שמעון הצדיק", "רזיאל", "בית אשל", "שדרות ירושלים",
    ],
    priceRange: { studio: [3800, 4800], "1br": [4200, 5500], "2br": [5200, 7000], "2.5br": [6000, 7800], "3br": [7200, 9500], "3.5br": [8000, 10500], "4br": [9000, 12000] },
    floorRange: [1, 4],
    weight: 130,
  },
  {
    id: "ajami",
    streets: [
      "קדם", "ירושלים", "שבטי ישראל", "רב אלוף דוד", "השיירים",
      "ינאי", "הדייגים", "אולגה", "מזל דגים",
    ],
    priceRange: { studio: [3500, 4500], "1br": [3800, 5000], "2br": [4800, 6200], "2.5br": [5500, 7000], "3br": [6200, 8000], "3.5br": [7200, 9500], "4br": [8200, 10500] },
    floorRange: [1, 3],
    weight: 80,
  },
  {
    id: "ramat-aviv",
    streets: [
      "אינשטיין", "חיים לבנון", "ברודצקי", "דרך נמיר", "אנה פרנק",
      "ז'ורס", "מוריה", "שד' האוניברסיטה", "קלאוזנר", "רמת אביב",
    ],
    priceRange: { studio: [5200, 6500], "1br": [5500, 7000], "2br": [7500, 9500], "2.5br": [8200, 10500], "3br": [10000, 12500], "3.5br": [11500, 14000], "4br": [12500, 16000] },
    floorRange: [1, 10],
    weight: 130,
  },
  {
    id: "bavli",
    streets: [
      "ויסבורג", "דרך נמיר", "שד' נורדאו", "שלמה אבן וירגא",
      "שד' דוד המלך", "שפרינצק", "ירושלים", "הלפרין",
    ],
    priceRange: { studio: [5500, 6800], "1br": [6000, 7500], "2br": [8000, 10000], "2.5br": [8800, 11000], "3br": [10500, 13000], "3.5br": [12000, 15000], "4br": [13500, 17000] },
    floorRange: [1, 10],
    weight: 100,
  },
  {
    id: "tzahala",
    streets: [
      "שמחוני", "שד' אלוף שדה", "דרך רבין", "שד' אבא אבן",
      "זלמן ארן", "אברהם שפירא", "דני מס", "משה דיין",
    ],
    priceRange: { studio: [5800, 7200], "1br": [6200, 7800], "2br": [8500, 10500], "2.5br": [9500, 11800], "3br": [11000, 14000], "3.5br": [12500, 16000], "4br": [15000, 20000] },
    floorRange: [1, 3],
    weight: 80,
  },
  {
    id: "neve-shaanan",
    streets: [
      "נווה שאנן", "הגדוד העברי", "הר ציון", "מסילת ישרים",
      "רבי פנחס", "הבונים", "שד' ירושלים", "מנחם בגין",
    ],
    priceRange: { studio: [3200, 4200], "1br": [3500, 4800], "2br": [4500, 5800], "2.5br": [5000, 6500], "3br": [6000, 7800], "3.5br": [7000, 8800], "4br": [7500, 9500] },
    floorRange: [1, 5],
    weight: 80,
  },
  {
    id: "shapira",
    streets: [
      "שפירא", "סלמה", "מנחם בגין", "הר ציון", "עולי הגרדום",
      "הגדוד העברי", "שדרות הר ציון", "יד חרוצים",
    ],
    priceRange: { studio: [3500, 4500], "1br": [4000, 5200], "2br": [5000, 6500], "2.5br": [5800, 7200], "3br": [6500, 8500], "3.5br": [7500, 9500], "4br": [8500, 10500] },
    floorRange: [1, 4],
    weight: 80,
  },
  {
    id: "montefiore",
    streets: [
      "מונטיפיורי", "יבנה", "אחד העם", "רוטשילד", "קלישר",
      "פינס", "לילנבלום", "מזרחי", "ביאליק",
    ],
    priceRange: { studio: [5800, 7200], "1br": [6200, 7800], "2br": [7800, 9800], "2.5br": [8500, 10800], "3br": [10500, 13500], "3.5br": [12000, 15500], "4br": [14000, 18000] },
    floorRange: [1, 5],
    weight: 100,
  },
  {
    id: "sarona",
    streets: [
      "קפלן", "לאונרדו דה וינצ'י", "דרך מנחם בגין", "יגאל אלון",
      "חכמי אתונה", "שד' שאול המלך", "אלכסנדר ינאי",
    ],
    priceRange: { studio: [7200, 8800], "1br": [7500, 9500], "2br": [10500, 13500], "2.5br": [11500, 14500], "3br": [14000, 18000], "3.5br": [16000, 20000], "4br": [18500, 24000] },
    floorRange: [5, 30],
    weight: 90,
  },
  {
    id: "kiryat-shalom",
    streets: [
      "בר אילן", "רחל", "שפרינצק", "יהודה הנשיא", "שלום עליכם",
      "חזל", "דבורה", "שמואל",
    ],
    priceRange: { studio: [3000, 3800], "1br": [3200, 4200], "2br": [4000, 5200], "2.5br": [4500, 5800], "3br": [5500, 7200], "3.5br": [6500, 8500], "4br": [7200, 9000] },
    floorRange: [1, 4],
    weight: 70,
  },
  {
    id: "hatikva",
    streets: [
      "התקווה", "אתרים", "שבטי ישראל", "אצל", "בוליביה",
      "אורוגוואי", "ז'בוטינסקי", "שלום צאלח",
    ],
    priceRange: { studio: [2800, 3500], "1br": [3000, 4000], "2br": [3800, 5000], "2.5br": [4200, 5500], "3br": [5000, 6500], "3.5br": [5800, 7500], "4br": [6500, 8500] },
    floorRange: [1, 4],
    weight: 70,
  },
  {
    id: "yad-eliyahu",
    streets: [
      "שטרן", "הבנים", "בלום", "שד' רוקח", "שד' ההגנה",
      "שבטי ישראל", "אברבנאל", "סמטת יפת",
    ],
    priceRange: { studio: [4200, 5200], "1br": [4500, 5800], "2br": [5800, 7500], "2.5br": [6500, 8200], "3br": [8000, 10500], "3.5br": [9200, 11800], "4br": [10000, 12500] },
    floorRange: [1, 5],
    weight: 90,
  },
  {
    id: "nahalat-yitzhak",
    streets: [
      "דרך השלום", "השופטים", "שד' ההגנה", "רמז", "מגידו",
      "עמישב", "שטמפפר", "ז'בוטינסקי",
    ],
    priceRange: { studio: [4500, 5500], "1br": [5000, 6200], "2br": [6500, 8200], "2.5br": [7200, 9000], "3br": [8800, 11200], "3.5br": [10000, 13000], "4br": [11500, 14500] },
    floorRange: [1, 7],
    weight: 90,
  },
];

const SOURCES = [
  { id: "yad2", prefix: "yad2", weight: 45 },
  { id: "homeless", prefix: "homeless", weight: 12 },
  { id: "fbmarket", prefix: "fbm", weight: 10 },
  { id: "komo", prefix: "komo", weight: 8 },
  { id: "winwin", prefix: "ww", weight: 7 },
  { id: "onmap", prefix: "onmap", weight: 5 },
  { id: "agora", prefix: "agora", weight: 5 },
  { id: "madlan", prefix: "madlan", weight: 5 },
  { id: "private", prefix: "prv", weight: 3 },
];

const ROOM_TYPES = [
  { rooms: 1, key: "studio", sqmRange: [25, 38] },
  { rooms: 1.5, key: "1br", sqmRange: [30, 45] },
  { rooms: 2, key: "2br", sqmRange: [40, 58] },
  { rooms: 2.5, key: "2.5br", sqmRange: [48, 65] },
  { rooms: 3, key: "3br", sqmRange: [60, 85] },
  { rooms: 3.5, key: "3.5br", sqmRange: [70, 95] },
  { rooms: 4, key: "4br", sqmRange: [80, 115] },
  { rooms: 4.5, key: "4br", sqmRange: [95, 130] },
  { rooms: 5, key: "4br", sqmRange: [110, 160] },
];

const CONDITIONS = ["new", "renovated", "good", "fair", "needs_work"];

// Seeded pseudo-random number generator (mulberry32)
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);

function randInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function randFloat(min, max) {
  return min + rand() * (max - min);
}

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

function pickWeighted(items) {
  const totalWeight = items.reduce((s, it) => s + it.weight, 0);
  let r = rand() * totalWeight;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

// Room type distribution (weighted toward 2-3 rooms which dominate TLV market)
const ROOM_WEIGHTS = [
  { rooms: 1, weight: 8 },
  { rooms: 1.5, weight: 6 },
  { rooms: 2, weight: 22 },
  { rooms: 2.5, weight: 12 },
  { rooms: 3, weight: 25 },
  { rooms: 3.5, weight: 10 },
  { rooms: 4, weight: 10 },
  { rooms: 4.5, weight: 4 },
  { rooms: 5, weight: 3 },
];

const listings = [];
let counter = 1;

for (const hood of NEIGHBORHOODS) {
  const count = hood.weight;

  for (let i = 0; i < count; i++) {
    const street = pick(hood.streets);
    const streetNum = randInt(2, 120);
    const address = `${street} ${streetNum}`;

    // Pick room type
    const roomType = pickWeighted(ROOM_WEIGHTS);
    const roomConfig = ROOM_TYPES.find(r => r.rooms === roomType.rooms);
    const priceKey = roomConfig.key;
    const priceRange = hood.priceRange[priceKey] || hood.priceRange["4br"];

    // Price with some noise
    const basePrice = randInt(priceRange[0], priceRange[1]);
    const price = Math.round(basePrice / 100) * 100; // round to nearest 100

    // Sqm
    const sqm = randInt(roomConfig.sqmRange[0], roomConfig.sqmRange[1]);

    // Floor
    const floor = randInt(hood.floorRange[0], hood.floorRange[1]);

    // Source
    const source = pickWeighted(SOURCES);

    // Days on market (distribution: most are fresh, some are old)
    const dom = rand() < 0.3 ? randInt(1, 5) : rand() < 0.6 ? randInt(5, 14) : randInt(14, 30);

    // Condition: higher price = better condition tendency
    let condition;
    const priceTier = price > 12000 ? 0.7 : price > 8000 ? 0.5 : price > 5000 ? 0.3 : 0.1;
    const r = rand();
    if (r < priceTier * 0.3) condition = "new";
    else if (r < priceTier * 0.6) condition = "renovated";
    else if (r < priceTier * 0.6 + 0.3) condition = "good";
    else if (r < priceTier * 0.6 + 0.6) condition = "fair";
    // else: omit condition (will be derived)

    // Features
    const elevator = floor >= 4 ? rand() > 0.2 : rand() > 0.6;
    const parking = rand() > (price > 10000 ? 0.4 : 0.65);
    const balcony = rand() > 0.45;
    const ac = price > 5000 ? rand() > 0.2 : rand() > 0.5;
    const mamad = rand() > (price > 10000 ? 0.35 : 0.6);
    const petFriendly = rand() > 0.6;

    // Furniture
    const furnR = rand();
    const furniture = furnR < 0.25 ? "full" : furnR < 0.5 ? "partial" : undefined;

    // Building year
    const buildingYear = floor >= 8 ? 2015 + randInt(0, 10) : floor >= 4 ? 2000 + randInt(0, 15) : 1975 + randInt(0, 35);

    // Verified (cross-referenced with second source)
    const verified = rand() > 0.85;

    const id = `${source.prefix}-${String(counter).padStart(5, "0")}`;

    const listing = { id, address, neighborhood_id: hood.id, rooms: roomType.rooms, sqm, price, days_on_market: dom, floor };

    if (source.id !== "yad2") listing.source = source.id;
    if (condition) listing.condition = condition;
    if (elevator) listing.elevator = true;
    if (parking) listing.parking = true;
    if (balcony) listing.balcony = true;
    if (ac) listing.ac = true;
    if (mamad) listing.mamad = true;
    if (petFriendly) listing.pet_friendly = true;
    if (furniture) listing.furniture = furniture;
    if (buildingYear) listing.building_year = buildingYear;
    if (verified) listing.verified = true;

    listings.push(listing);
    counter++;
  }
}

// Output as TypeScript
function formatListing(l) {
  const parts = [];
  parts.push(`id: "${l.id}"`);
  parts.push(`address: "${l.address.replace(/"/g, '\\"')}"`);
  parts.push(`neighborhood_id: "${l.neighborhood_id}"`);
  parts.push(`rooms: ${l.rooms}`);
  parts.push(`sqm: ${l.sqm}`);
  parts.push(`price: ${l.price}`);
  parts.push(`days_on_market: ${l.days_on_market}`);
  parts.push(`floor: ${l.floor}`);
  if (l.source) parts.push(`source: "${l.source}"`);
  if (l.condition) parts.push(`condition: "${l.condition}"`);
  if (l.elevator) parts.push(`elevator: true`);
  if (l.parking) parts.push(`parking: true`);
  if (l.balcony) parts.push(`balcony: true`);
  if (l.ac) parts.push(`ac: true`);
  if (l.mamad) parts.push(`mamad: true`);
  if (l.pet_friendly) parts.push(`pet_friendly: true`);
  if (l.furniture) parts.push(`furniture: "${l.furniture}"`);
  if (l.building_year) parts.push(`building_year: ${l.building_year}`);
  if (l.verified) parts.push(`verified: true`);
  return `  { ${parts.join(", ")} },`;
}

// Group by neighborhood for readability
const grouped = {};
for (const l of listings) {
  if (!grouped[l.neighborhood_id]) grouped[l.neighborhood_id] = [];
  grouped[l.neighborhood_id].push(l);
}

const lines = [];
for (const [hood, hoodListings] of Object.entries(grouped)) {
  lines.push(`  // ── ${hood} (${hoodListings.length}) ──`);
  for (const l of hoodListings) {
    lines.push(formatListing(l));
  }
}

console.log(`// Total listings: ${listings.length}`);
console.log(`const RAW_LISTINGS: ListingSeed[] = [`);
console.log(lines.join("\n"));
console.log(`];`);

// Print stats
console.error(`\nGenerated ${listings.length} listings across ${Object.keys(grouped).length} neighborhoods`);
const sourceCounts = {};
for (const l of listings) {
  const src = l.source || "yad2";
  sourceCounts[src] = (sourceCounts[src] || 0) + 1;
}
console.error("Source breakdown:", JSON.stringify(sourceCounts, null, 2));
