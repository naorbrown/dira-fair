/**
 * Client-side rent scoring engine (v2).
 *
 * Upgraded from the original port of:
 *   - apps/api/api/services/rent_scorer.py (score_rent)
 *   - apps/api/api/services/market_signals.py (get_signals, generate_tips)
 *
 * Key improvements:
 *   1. Confidence scoring (high / medium / low) based on comparable count
 *   2. Price distribution with min, max, median, p25, p75
 *   3. Savings calculation when rent is above market
 *   4. Neighborhood vs city-wide CBS comparison
 *   5. Tiered percentile: comps-first, neighborhood fallback, then CBS
 *   6. More specific, actionable negotiation tips
 *
 * All computation happens locally using embedded static data.
 */

import type {
  RentCheckResponse,
  MarketSignals,
  ComparableListing,
  ConfidenceInfo,
  PriceDistribution,
  SavingsInfo,
} from "./types";

import {
  NEIGHBORHOODS,
  LISTINGS,
  TREND_DATA,
  SEASONAL_FAVORABILITY,
  CBS_RENT_STATS,
  getComparableListings,
  getQualityComparables,
  getNeighborhoodRent,
  getCBSRentForRooms,
  getYad2SearchUrl,
} from "./data";

// ---------------------------------------------------------------------------
// Statistical helpers
// ---------------------------------------------------------------------------

/** Return the value at a given percentile (0-100) from a sorted array. */
function quantile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];

  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  const frac = idx - lo;

  if (lo === hi) return sorted[lo];
  return Math.round(sorted[lo] * (1 - frac) + sorted[hi] * frac);
}

function median(sorted: number[]): number {
  return quantile(sorted, 50);
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((s, v) => s + v, 0) / values.length);
}

// ---------------------------------------------------------------------------
// scoreRent — tiered confidence scoring
// ---------------------------------------------------------------------------

interface ScoreResult {
  score: "below_market" | "at_market" | "above_market";
  percentile: number;
  market_avg: number;
  delta_pct: number;
  confidence: ConfidenceInfo;
  distribution: PriceDistribution;
  allPrices: number[];
}

function scoreRent(
  neighborhoodSlug: string,
  rooms: number,
  _sqm: number,
  monthlyRent: number
): ScoreResult {
  // Gather comparable listings (same neighborhood, rooms within 0.5)
  const comps = LISTINGS.filter(
    (l) =>
      l.neighborhood === neighborhoodSlug &&
      l.rooms >= rooms - 0.5 &&
      l.rooms <= rooms + 0.5
  );

  const compPrices = comps
    .map((c) => c.monthly_rent)
    .sort((a, b) => a - b);

  let marketAvg: number;
  let percentile: number;
  let confidence: ConfidenceInfo;
  let allPrices: number[];

  if (compPrices.length >= 5) {
    // ── HIGH confidence: 5+ comparable listings ──
    marketAvg = mean(compPrices);
    percentile = computePercentile(compPrices, monthlyRent);
    allPrices = compPrices;

    confidence = {
      level: "high",
      label: "High Confidence",
      description:
        `Score is based on ${compPrices.length} comparable listings in your neighborhood ` +
        `with a similar room count. This gives us a reliable picture of the local market.`,
      comparable_count: compPrices.length,
      data_source: "Yad2 comparable listings",
    };
  } else if (compPrices.length >= 3) {
    // ── MEDIUM confidence: 3-4 comps, supplement with neighborhood avg ──
    const neighborhoodRent = getNeighborhoodRent(neighborhoodSlug, rooms);

    // Blend: use comp prices + inject the neighborhood average as an extra data point
    // to stabilise the estimate without overwhelming real data.
    allPrices = [...compPrices];
    if (neighborhoodRent !== null) {
      allPrices.push(neighborhoodRent);
      allPrices.sort((a, b) => a - b);
    }

    marketAvg = mean(allPrices);
    percentile = computePercentile(allPrices, monthlyRent);

    confidence = {
      level: "medium",
      label: "Medium Confidence",
      description:
        `Score is based on ${compPrices.length} comparable listings supplemented ` +
        `with neighborhood-level rent data. More listings would improve accuracy.`,
      comparable_count: compPrices.length,
      data_source: "Yad2 listings + neighborhood averages",
    };
  } else {
    // ── LOW confidence: <3 comps — use neighborhood data first, then CBS ──
    const neighborhoodRent = getNeighborhoodRent(neighborhoodSlug, rooms);
    const cbsStat = getCBSRentForRooms(rooms);

    if (neighborhoodRent !== null) {
      // Prefer neighborhood-level data over raw CBS
      allPrices = [...compPrices, neighborhoodRent].sort((a, b) => a - b);
      marketAvg = neighborhoodRent;

      // Use neighborhood rent as the anchor for percentile
      const ratio = monthlyRent / marketAvg;
      percentile = ratioToPercentile(ratio);

      confidence = {
        level: "low",
        label: "Limited Data",
        description:
          compPrices.length > 0
            ? `Only ${compPrices.length} comparable listing${compPrices.length === 1 ? "" : "s"} found. ` +
              `Score uses neighborhood-level average rents as the primary benchmark. ` +
              `Results may be less precise for your specific apartment.`
            : `No directly comparable listings found. Score uses neighborhood-level average ` +
              `rents as the benchmark. Consider this an estimate rather than a precise score.`,
        comparable_count: compPrices.length,
        data_source: "Neighborhood averages" + (cbsStat ? " + CBS survey" : ""),
      };
    } else if (cbsStat) {
      // Pure CBS fallback — city-wide averages
      marketAvg = cbsStat.avg_rent_all;
      allPrices =
        compPrices.length > 0
          ? [...compPrices, cbsStat.avg_rent_all].sort((a, b) => a - b)
          : [cbsStat.avg_rent_all];

      const ratio = monthlyRent / marketAvg;
      percentile = ratioToPercentile(ratio);

      confidence = {
        level: "low",
        label: "Limited Data",
        description:
          `No comparable listings or neighborhood data available. Score is based on ` +
          `CBS city-wide rent survey averages for ${rooms}-room apartments. ` +
          `This is a rough estimate — actual neighborhood prices may differ significantly.`,
        comparable_count: compPrices.length,
        data_source: "CBS rent survey (city-wide)",
      };
    } else {
      // Absolute last resort: estimate from any neighborhood data we can find
      // Never use a hardcoded 8000 fallback.
      const allNeighborhoodRents = LISTINGS.filter(
        (l) => l.rooms >= rooms - 0.5 && l.rooms <= rooms + 0.5
      )
        .map((l) => l.monthly_rent)
        .sort((a, b) => a - b);

      if (allNeighborhoodRents.length > 0) {
        marketAvg = mean(allNeighborhoodRents);
        allPrices = allNeighborhoodRents;
        percentile = computePercentile(allNeighborhoodRents, monthlyRent);
      } else {
        // Truly nothing — use city-wide median of all listings
        const allRents = LISTINGS.map((l) => l.monthly_rent).sort(
          (a, b) => a - b
        );
        marketAvg = mean(allRents);
        allPrices = allRents;
        percentile = computePercentile(allRents, monthlyRent);
      }

      confidence = {
        level: "low",
        label: "Limited Data",
        description:
          `Very limited data for this room count. Score uses city-wide listings ` +
          `as a rough benchmark. Treat this as a general indication only.`,
        comparable_count: compPrices.length,
        data_source: "City-wide listing data",
      };
    }
  }

  const deltaPct =
    marketAvg > 0
      ? Math.round(((monthlyRent - marketAvg) / marketAvg) * 1000) / 10
      : 0;

  let score: "below_market" | "at_market" | "above_market";
  if (percentile < 40) {
    score = "below_market";
  } else if (percentile <= 60) {
    score = "at_market";
  } else {
    score = "above_market";
  }

  // Build distribution from all available prices
  const sortedPrices = [...allPrices].sort((a, b) => a - b);
  const distribution: PriceDistribution = {
    prices: sortedPrices,
    user_rent: monthlyRent,
    min: sortedPrices.length > 0 ? sortedPrices[0] : monthlyRent,
    max:
      sortedPrices.length > 0
        ? sortedPrices[sortedPrices.length - 1]
        : monthlyRent,
    median: sortedPrices.length > 0 ? median(sortedPrices) : monthlyRent,
    p25: sortedPrices.length > 0 ? quantile(sortedPrices, 25) : monthlyRent,
    p75: sortedPrices.length > 0 ? quantile(sortedPrices, 75) : monthlyRent,
  };

  return {
    score,
    percentile,
    market_avg: marketAvg,
    delta_pct: deltaPct,
    confidence,
    distribution,
    allPrices: sortedPrices,
  };
}

/** Compute percentile rank of `value` within a sorted price array. */
function computePercentile(sortedPrices: number[], value: number): number {
  if (sortedPrices.length === 0) return 50;

  const belowCount = sortedPrices.filter((p) => p < value).length;
  const equalCount = sortedPrices.filter((p) => p === value).length;

  const raw = ((belowCount + 0.5 * equalCount) / sortedPrices.length) * 100;
  return Math.min(99, Math.max(1, Math.round(raw)));
}

/** Convert a rent/market ratio to a rough percentile (for CBS/neighborhood fallback). */
function ratioToPercentile(ratio: number): number {
  // Map ratio to percentile using a simple linear model:
  // ratio 0.8 => ~15th, 0.9 => ~30th, 1.0 => ~50th, 1.1 => ~70th, 1.2 => ~85th
  const raw = 50 + (ratio - 1) * 200;
  return Math.min(99, Math.max(1, Math.round(raw)));
}

// ---------------------------------------------------------------------------
// getSignals — market signals
// ---------------------------------------------------------------------------

interface SignalsResult {
  trend: string;
  trend_description: string;
  season: string;
  season_description: string;
  supply: string;
  supply_description: string;
  days_on_market: number;
  days_on_market_description: string;
  _active_supply: number;
  _avg_days_on_market: number | null;
  _renewal_discount: number;
  _comparable_listings: ComparableListing[];
}

function getSignals(neighborhoodSlug: string, rooms: number): SignalsResult {
  // Active supply count
  const activeListings = LISTINGS.filter(
    (l) => l.neighborhood === neighborhoodSlug
  );
  const activeCount = activeListings.length;

  // Average days on market
  const doms = activeListings
    .filter((l) => l.days_on_market != null)
    .map((l) => l.days_on_market);
  const avgDom =
    doms.length > 0
      ? Math.round((doms.reduce((s, d) => s + d, 0) / doms.length) * 10) / 10
      : null;

  // Trend from rent index
  const recentIndices = [...TREND_DATA]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  let trend: string;
  if (recentIndices.length >= 2) {
    const latest = recentIndices[0].index;
    const threeMonthsAgo =
      recentIndices[Math.min(2, recentIndices.length - 1)].index;
    if (latest > threeMonthsAgo * 1.005) {
      trend = "rising";
    } else if (latest < threeMonthsAgo * 0.995) {
      trend = "falling";
    } else {
      trend = "stable";
    }
  } else {
    trend = "unknown";
  }

  // Seasonal
  const currentMonth = new Date().getMonth() + 1;
  const season = SEASONAL_FAVORABILITY[currentMonth] || "neutral";

  // Comparable listings (up to 10 for display) with quality data
  const comps = getComparableListings(neighborhoodSlug, rooms, 10);
  const comparableListings: ComparableListing[] = comps.map((c) => ({
    address: c.address,
    rooms: c.rooms,
    sqm: c.sqm,
    monthly_rent: c.monthly_rent,
    price_per_sqm: c.price_per_sqm,
    source_url: c.source_url,
    quality_score: c.quality_score,
    similarity_score: 0,
    condition: c.condition,
    has_parking: c.has_parking,
    has_elevator: c.has_elevator,
    has_balcony: c.has_balcony,
    has_ac: c.has_ac,
    has_mamad: c.has_mamad,
    floor: c.floor,
  }));

  // Build descriptions
  const trendDescription =
    trend === "rising"
      ? "Rents in Tel Aviv have been trending upward over the past quarter."
      : trend === "falling"
        ? "Rents in Tel Aviv have been trending downward over the past quarter."
        : trend === "stable"
          ? "Rents in Tel Aviv have remained stable over the past quarter."
          : "Not enough data to determine trend direction.";

  const seasonDescription =
    season === "good_to_negotiate"
      ? "This is a good time to negotiate. Demand is lower and landlords are more motivated."
      : season === "bad_to_negotiate"
        ? "Peak rental season (Jul-Sep). Landlords have more leverage right now."
        : "Average market conditions. Standard negotiation dynamics apply.";

  const supplyLabel =
    activeCount > 10 ? "High" : activeCount >= 5 ? "Moderate" : "Low";
  const supplyDescription =
    activeCount > 10
      ? `${activeCount} active listings in this neighborhood. Healthy supply gives you options.`
      : activeCount >= 5
        ? `${activeCount} active listings in this neighborhood. Average supply levels.`
        : `Only ${activeCount} active listing${activeCount === 1 ? "" : "s"} in this neighborhood. Tight supply market.`;

  const domLabel = avgDom != null ? Math.round(avgDom) : 0;
  const domDescription =
    avgDom != null
      ? avgDom > 14
        ? `Listings sit for ~${Math.round(avgDom)} days on average. Landlords may be more willing to negotiate.`
        : avgDom > 7
          ? `Listings move within ~${Math.round(avgDom)} days. Moderate pace.`
          : `Listings move fast (~${Math.round(avgDom)} days). High demand in this area.`
      : "No days-on-market data available.";

  return {
    trend:
      trend === "rising"
        ? "Rising"
        : trend === "falling"
          ? "Falling"
          : trend === "stable"
            ? "Stable"
            : "Unknown",
    trend_description: trendDescription,
    season:
      season === "good_to_negotiate"
        ? "Good to Negotiate"
        : season === "bad_to_negotiate"
          ? "Hard to Negotiate"
          : "Neutral",
    season_description: seasonDescription,
    supply: supplyLabel,
    supply_description: supplyDescription,
    days_on_market: domLabel,
    days_on_market_description: domDescription,
    _active_supply: activeCount,
    _avg_days_on_market: avgDom,
    _renewal_discount: 2.8,
    _comparable_listings: comparableListings,
  };
}

// ---------------------------------------------------------------------------
// generateTips — upgraded with more specific, actionable advice
// ---------------------------------------------------------------------------

function generateTips(
  scoreResult: ScoreResult,
  signals: SignalsResult,
  monthlyRent: number
): string[] {
  const tips: string[] = [];
  const { score, market_avg, delta_pct, distribution } = scoreResult;

  // ── Primary score-based tip ──
  if (score === "above_market") {
    const overpayAmount = monthlyRent - market_avg;
    tips.push(
      `Your rent is ${Math.abs(delta_pct)}% above the market average (${formatILS(market_avg)}/mo) ` +
        `for similar apartments in your neighborhood. ` +
        `That's ${formatILS(overpayAmount)} extra per month, or ${formatILS(overpayAmount * 12)} per year. ` +
        `You have a strong case for a rent reduction.`
    );
  } else if (score === "at_market") {
    tips.push(
      `Your rent is in line with the market average (${formatILS(market_avg)}/mo). ` +
        `While a large reduction is unlikely, you can negotiate to keep the same rate ` +
        `rather than accept an increase at renewal time.`
    );
  } else {
    tips.push(
      `Your rent is ${Math.abs(delta_pct)}% below the market average (${formatILS(market_avg)}/mo) ` +
        `\u2014 you're getting a good deal. Focus on locking in your current rate ` +
        `for a longer lease to protect against increases.`
    );
  }

  // ── Negotiation target tip (above market) ──
  if (score === "above_market" && distribution.median > 0) {
    tips.push(
      `Aim for ${formatILS(distribution.median)}/mo as your negotiation target \u2014 ` +
        `that's the median rent for comparable apartments. Come prepared with ` +
        `2\u20133 specific listings at that price to show your landlord.`
    );
  }

  // ── Seasonal tips ──
  const currentMonth = new Date().getMonth() + 1;
  const seasonFav = SEASONAL_FAVORABILITY[currentMonth] || "neutral";
  if (seasonFav === "good_to_negotiate") {
    tips.push(
      "Timing is in your favor \u2014 winter months (Nov-Feb) see lower demand. " +
        "Landlords are more motivated to keep existing tenants rather than " +
        "risk a vacant apartment during the slow season."
    );
  } else if (seasonFav === "bad_to_negotiate") {
    tips.push(
      "This is peak rental season (Jul-Sep) when demand is highest. " +
        "If your lease isn't expiring now, consider negotiating a short 3-month " +
        "extension and renegotiating in winter when you'll have significantly more leverage."
    );
  }

  // ── Supply tips ──
  if (signals._active_supply > 10) {
    tips.push(
      `There are ${signals._active_supply} active listings in your neighborhood right now. ` +
        "Mention specific alternatives you've seen \u2014 showing your landlord that " +
        "you have real options is the strongest negotiation tactic."
    );
  } else if (signals._active_supply < 5) {
    tips.push(
      "Supply is tight in your neighborhood. Instead of threatening to leave, " +
        "emphasize your reliability as a tenant \u2014 on-time payments, taking care " +
        "of the apartment, and the cost your landlord would incur from turnover."
    );
  }

  // ── Days on market ──
  if (
    signals._avg_days_on_market != null &&
    signals._avg_days_on_market > 14
  ) {
    tips.push(
      `Listings in your area take an average of ${Math.round(signals._avg_days_on_market)} ` +
        "days to rent \u2014 landlords are struggling to find tenants. " +
        "Remind your landlord that vacancy costs them a full month's rent or more."
    );
  } else if (
    signals._avg_days_on_market != null &&
    signals._avg_days_on_market <= 5
  ) {
    tips.push(
      `Apartments move very quickly here (~${Math.round(signals._avg_days_on_market)} days). ` +
        "Act fast if you see a better deal, and focus negotiations on your " +
        "track record as a reliable tenant."
    );
  }

  // ── Trend tips ──
  if (signals.trend === "Falling") {
    tips.push(
      "City-wide rent trends are moving downward. Print or screenshot the trend " +
        "chart from this report and present it to your landlord \u2014 hard data " +
        "is more persuasive than verbal arguments."
    );
  } else if (signals.trend === "Rising" && score === "above_market") {
    tips.push(
      "Although city-wide rents are rising, your rent is already above your " +
        "neighborhood average. Your landlord may try to cite the city trend, but " +
        "your local comparables tell a different story \u2014 stick to neighborhood data."
    );
  }

  // ── Renewal discount tip ──
  const discount = signals._renewal_discount;
  tips.push(
    `According to CBS data, renewing tenants pay ~${discount}% less than new tenants. ` +
      "Remind your landlord that finding a new tenant costs 1\u20132 months of vacancy, " +
      "broker fees (one month's rent), cleaning, and repairs. Keeping you is cheaper."
  );

  // ── Long lease tip ──
  if (score === "below_market" || score === "at_market") {
    tips.push(
      "Consider proposing a 2-year lease in exchange for a rent freeze or a " +
        "cap on annual increases (e.g., max 3%). Landlords value stability and " +
        "may accept a lower effective rent to avoid annual negotiations."
    );
  }

  // Return only the 3 most relevant tips — keep it actionable, not overwhelming
  return tips.slice(0, 3);
}

/** Minimal ILS formatter for use inside tip strings. */
function formatILS(amount: number): string {
  return `\u20AA${amount.toLocaleString("en-IL")}`;
}

// ---------------------------------------------------------------------------
// computeSavings — only when above market
// ---------------------------------------------------------------------------

function computeSavings(
  score: "below_market" | "at_market" | "above_market",
  monthlyRent: number,
  distribution: PriceDistribution
): SavingsInfo | null {
  if (score !== "above_market") return null;

  const target = distribution.median;
  if (target >= monthlyRent) return null;

  const monthlySaving = monthlyRent - target;
  return {
    potential_monthly: monthlySaving,
    potential_annual: monthlySaving * 12,
    negotiation_target: target,
  };
}

// ---------------------------------------------------------------------------
// computeNeighborhoodVsCity
// ---------------------------------------------------------------------------

function computeNeighborhoodVsCity(
  neighborhoodSlug: string,
  rooms: number
): { neighborhood_avg: number; city_avg: number; delta_percent: number } | null {
  const neighborhoodRent = getNeighborhoodRent(neighborhoodSlug, rooms);
  const cbsStat = getCBSRentForRooms(rooms);

  if (neighborhoodRent === null || cbsStat === null) return null;

  const cityAvg = cbsStat.avg_rent_all;
  if (cityAvg === 0) return null;

  const deltaPct =
    Math.round(((neighborhoodRent - cityAvg) / cityAvg) * 1000) / 10;

  return {
    neighborhood_avg: neighborhoodRent,
    city_avg: cityAvg,
    delta_percent: deltaPct,
  };
}

// ---------------------------------------------------------------------------
// Public API: checkRentLocal
// ---------------------------------------------------------------------------

const SCORE_LABELS: Record<string, string> = {
  below_market: "Below Market",
  at_market: "At Market",
  above_market: "Above Market",
};

export function checkRentLocal(
  neighborhoodId: number,
  rooms: number,
  sqm: number,
  monthlyRent: number
): RentCheckResponse {
  // Map numeric ID to slug
  const neighborhood = NEIGHBORHOODS.find((n) => n.id === neighborhoodId);
  const slug = neighborhood?.slug ?? "";

  // Core scoring with confidence + distribution
  const scoreResult = scoreRent(slug, rooms, sqm, monthlyRent);

  // Market signals
  const signals = getSignals(slug, rooms);

  // Upgraded tips
  const tips = generateTips(scoreResult, signals, monthlyRent);

  // Savings (only above market)
  const savings = computeSavings(
    scoreResult.score,
    monthlyRent,
    scoreResult.distribution
  );

  // Neighborhood vs city comparison
  const neighborhoodVsCity = computeNeighborhoodVsCity(slug, rooms);

  const marketSignals: MarketSignals = {
    trend: signals.trend,
    trend_description: signals.trend_description,
    season: signals.season,
    season_description: signals.season_description,
    supply: signals.supply,
    supply_description: signals.supply_description,
    days_on_market: signals.days_on_market,
    days_on_market_description: signals.days_on_market_description,
  };

  return {
    score: scoreResult.score,
    score_label: SCORE_LABELS[scoreResult.score] || scoreResult.score,
    your_rent: monthlyRent,
    market_avg: scoreResult.market_avg,
    delta_percent: scoreResult.delta_pct,
    percentile: scoreResult.percentile,
    signals: marketSignals,
    tips,
    comparables: signals._comparable_listings,
    confidence: scoreResult.confidence,
    distribution: scoreResult.distribution,
    savings,
    neighborhood_vs_city: neighborhoodVsCity,
  };
}
