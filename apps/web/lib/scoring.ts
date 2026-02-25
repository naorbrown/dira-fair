/**
 * Client-side rent scoring engine.
 *
 * Pure TypeScript port of:
 *   - apps/api/api/services/rent_scorer.py (score_rent)
 *   - apps/api/api/services/market_signals.py (get_signals, generate_tips)
 *
 * All computation happens locally using embedded static data.
 */

import type { RentCheckResponse, MarketSignals, ComparableListing } from "./types";
import {
  NEIGHBORHOODS,
  LISTINGS,
  TREND_DATA,
  SEASONAL_FAVORABILITY,
  CBS_RENT_STATS,
  getComparableListings,
  getNeighborhoodRent,
} from "./data";

// ---------------------------------------------------------------------------
// scoreRent — port of rent_scorer.py
// ---------------------------------------------------------------------------

interface ScoreResult {
  score: "below_market" | "at_market" | "above_market";
  percentile: number;
  market_avg: number;
  delta_pct: number;
}

function scoreRent(
  neighborhoodSlug: string,
  rooms: number,
  sqm: number,
  monthlyRent: number
): ScoreResult {
  // Find comparable listings: same neighborhood, similar room count (within 0.5)
  const comps = LISTINGS.filter(
    (l) =>
      l.neighborhood === neighborhoodSlug &&
      l.rooms >= rooms - 0.5 &&
      l.rooms <= rooms + 0.5
  );

  let marketAvg: number;
  let percentile: number;

  if (comps.length >= 5) {
    // Enough comparable listings
    const prices = comps.map((c) => c.monthly_rent).sort((a, b) => a - b);
    marketAvg = Math.round(
      prices.reduce((sum, p) => sum + p, 0) / prices.length
    );

    // Calculate percentile (matching Python logic)
    const belowCount = prices.filter((p) => p < monthlyRent).length;
    const equalCount = prices.filter((p) => p === monthlyRent).length;
    percentile = Math.round(
      ((belowCount + 0.5 * equalCount) / prices.length) * 100
    );
  } else {
    // Fallback to CBS city-level data (matching Python logic)
    const rounded = Math.round(rooms * 2) / 2;
    const cbsStat = CBS_RENT_STATS.find((s) => s.rooms === rounded);

    if (cbsStat) {
      marketAvg = cbsStat.avg_rent_all;
      // Rough percentile estimate from CBS average
      const ratio = monthlyRent / marketAvg;
      percentile = Math.min(99, Math.max(1, Math.round(ratio * 50)));
    } else {
      // Try neighborhood-level data
      const neighborhoodRent = getNeighborhoodRent(neighborhoodSlug, rooms);
      if (neighborhoodRent) {
        marketAvg = neighborhoodRent;
        const ratio = monthlyRent / marketAvg;
        percentile = Math.min(99, Math.max(1, Math.round(ratio * 50)));
      } else {
        marketAvg = 8000; // Hardcoded TLV fallback
        percentile = 50;
      }
    }
  }

  const deltaPct = Math.round(((monthlyRent - marketAvg) / marketAvg) * 1000) / 10;

  let score: "below_market" | "at_market" | "above_market";
  if (percentile < 40) {
    score = "below_market";
  } else if (percentile <= 60) {
    score = "at_market";
  } else {
    score = "above_market";
  }

  return {
    score,
    percentile,
    market_avg: marketAvg,
    delta_pct: deltaPct,
  };
}

// ---------------------------------------------------------------------------
// getSignals — port of market_signals.py get_signals()
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
  // internal fields for tip generation
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

  // Trend from rent index (matching Python logic)
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

  // Comparable listings
  const comps = getComparableListings(neighborhoodSlug, rooms, 5);
  const comparableListings: ComparableListing[] = comps.map((c) => ({
    address: c.address,
    rooms: c.rooms,
    sqm: c.sqm,
    monthly_rent: c.monthly_rent,
    price_per_sqm: c.price_per_sqm,
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
    // Internal fields for tip generation
    _active_supply: activeCount,
    _avg_days_on_market: avgDom,
    _renewal_discount: 2.8, // CBS average
    _comparable_listings: comparableListings,
  };
}

// ---------------------------------------------------------------------------
// generateTips — port of market_signals.py generate_tips()
// ---------------------------------------------------------------------------

function generateTips(
  score: string,
  signals: SignalsResult
): string[] {
  const tips: string[] = [];

  if (score === "above_market") {
    tips.push(
      "Your rent is above the market average for similar apartments in your neighborhood. " +
        "You have a strong case to negotiate a reduction at renewal time."
    );
  } else if (score === "at_market") {
    tips.push(
      "Your rent is in line with the market. While a significant reduction is unlikely, " +
        "you may be able to negotiate keeping the same price instead of an increase."
    );
  } else {
    tips.push(
      "Your rent is below the market average \u2014 you're getting a good deal. " +
        "Focus on maintaining your current rate rather than pushing for a reduction."
    );
  }

  // Seasonal tips
  const currentMonth = new Date().getMonth() + 1;
  const seasonFav = SEASONAL_FAVORABILITY[currentMonth] || "neutral";
  if (seasonFav === "good_to_negotiate") {
    tips.push(
      "Timing is in your favor \u2014 demand is lower this time of year. " +
        "Landlords are more motivated to keep existing tenants."
    );
  } else if (seasonFav === "bad_to_negotiate") {
    tips.push(
      "This is peak rental season (Jul-Sep). If possible, consider " +
        "negotiating a short extension and renegotiating in winter " +
        "when you'll have more leverage."
    );
  }

  // Supply tips
  if (signals._active_supply > 10) {
    tips.push(
      `There are ${signals._active_supply} active listings in your neighborhood \u2014 ` +
        "healthy supply gives you alternatives and strengthens your negotiation position."
    );
  } else if (signals._active_supply < 5) {
    tips.push(
      "Supply is tight in your neighborhood right now. " +
        "Your landlord knows apartments move fast, so focus on other negotiation angles."
    );
  }

  // Days on market
  if (
    signals._avg_days_on_market != null &&
    signals._avg_days_on_market > 14
  ) {
    tips.push(
      `Listings in your area sit for an average of ${Math.round(signals._avg_days_on_market)} ` +
        "days \u2014 landlords are having trouble finding tenants, " +
        "which is leverage for you."
    );
  }

  // Trend tips
  if (signals.trend === "Falling") {
    tips.push(
      "Rents in Tel Aviv are trending downward. " +
        "Point to this trend when negotiating \u2014 your landlord " +
        "should consider the broader market."
    );
  } else if (signals.trend === "Rising") {
    tips.push(
      "Rents are trending upward city-wide, but your specific " +
        "neighborhood and timing matter more. " +
        "Focus on comparable apartments nearby, not city-wide trends."
    );
  }

  // Renewal discount
  const discount = signals._renewal_discount;
  tips.push(
    `CBS data shows renewing tenants pay ~${discount}% less than ` +
      "new tenants. Remind your landlord that turnover costs them " +
      "\u2014 vacancy, cleaning, repairs, broker fees."
  );

  return tips;
}

// ---------------------------------------------------------------------------
// Public API: checkRent — combines scoring + signals + tips
// This is the main function called by the API client layer
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

  const scoreResult = scoreRent(slug, rooms, sqm, monthlyRent);
  const signals = getSignals(slug, rooms);
  const tips = generateTips(scoreResult.score, signals);

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
  };
}
