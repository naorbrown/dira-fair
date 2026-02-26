export interface Neighborhood {
  id: number;
  slug: string;
  name_en: string;
  name_he: string;
  avg_rent_2br: number | null;
  avg_price_per_sqm: number | null;
  listing_count: number;
  price_range?: { min: number; max: number } | null;
  median_rent_2br?: number | null;
}

export interface RentalListing {
  id: number;
  address: string;
  neighborhood: string;
  rooms: number;
  sqm: number;
  monthly_rent: number;
  price_per_sqm: number;
  days_on_market: number;
  source: string;
  posted_date: string;
  floor?: number | null;
}

export interface RentCheckRequest {
  neighborhood_id: number;
  rooms: number;
  sqm: number;
  monthly_rent: number;
}

export interface MarketSignals {
  trend: string;
  trend_description: string;
  season: string;
  season_description: string;
  supply: string;
  supply_description: string;
  days_on_market: number;
  days_on_market_description: string;
}

export interface ComparableListing {
  address: string;
  rooms: number;
  sqm: number;
  monthly_rent: number;
  price_per_sqm: number;
}

export interface ConfidenceInfo {
  level: "high" | "medium" | "low";
  label: string;
  description: string;
  comparable_count: number;
  data_source: string;
}

export interface PriceDistribution {
  prices: number[];
  user_rent: number;
  min: number;
  max: number;
  median: number;
  p25: number;
  p75: number;
}

export interface SavingsInfo {
  potential_monthly: number;
  potential_annual: number;
  negotiation_target: number;
}

export interface RentCheckResponse {
  score: "below_market" | "at_market" | "above_market";
  score_label: string;
  your_rent: number;
  market_avg: number;
  delta_percent: number;
  percentile: number;
  signals: MarketSignals;
  tips: string[];
  comparables: ComparableListing[];
  confidence: ConfidenceInfo;
  distribution: PriceDistribution;
  savings: SavingsInfo | null;
  neighborhood_vs_city: {
    neighborhood_avg: number;
    city_avg: number;
    delta_percent: number;
  } | null;
}

export interface NeighborhoodDetail extends Neighborhood {
  listings: RentalListing[];
  recent_transactions: RentalListing[];
}

export interface TrendEntry {
  date: string;
  index: number;
  avg_rent: number;
  sample_size: number;
}

export interface SeasonalData {
  month: number;
  month_name: string;
  demand_level: string;
  avg_rent_index: number;
  recommendation: string;
}
