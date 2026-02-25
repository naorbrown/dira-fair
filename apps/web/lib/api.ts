/**
 * API client — static/local data version.
 *
 * Instead of fetching from a FastAPI backend, all functions return data
 * from the embedded static datasets in data.ts and scoring.ts.
 * The function signatures remain identical so consumers don't need changes.
 */

import type {
  Neighborhood,
  NeighborhoodDetail,
  RentCheckRequest,
  RentCheckResponse,
  TrendEntry,
  SeasonalData,
} from "./types";

import {
  NEIGHBORHOODS,
  LISTINGS,
  TREND_DATA,
  SEASONAL_DATA,
  getListingsForNeighborhood,
} from "./data";

import { checkRentLocal } from "./scoring";

export async function fetchNeighborhoods(): Promise<Neighborhood[]> {
  // Return all neighborhoods sorted by name
  return [...NEIGHBORHOODS].sort((a, b) =>
    a.name_en.localeCompare(b.name_en)
  );
}

export async function fetchNeighborhood(
  slug: string
): Promise<NeighborhoodDetail> {
  const neighborhood = NEIGHBORHOODS.find((n) => n.slug === slug);
  if (!neighborhood) {
    throw new Error("Neighborhood not found");
  }

  const listings = getListingsForNeighborhood(slug);

  // We don't have sale transactions in the static data, so provide an empty array.
  // The neighborhood page already handles the empty state gracefully.
  return {
    ...neighborhood,
    listings,
    recent_transactions: [],
  };
}

export async function checkRent(
  data: RentCheckRequest
): Promise<RentCheckResponse> {
  return checkRentLocal(
    data.neighborhood_id,
    data.rooms,
    data.sqm,
    data.monthly_rent
  );
}

export async function fetchTrends(
  months: number = 24
): Promise<TrendEntry[]> {
  // Return the last N months of trend data
  return TREND_DATA.slice(-months);
}

export async function fetchSeasonal(): Promise<SeasonalData[]> {
  return SEASONAL_DATA;
}
