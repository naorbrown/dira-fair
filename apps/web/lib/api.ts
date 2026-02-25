import type {
  Neighborhood,
  NeighborhoodDetail,
  RentCheckRequest,
  RentCheckResponse,
  TrendEntry,
  SeasonalData,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function fetchNeighborhoods(): Promise<Neighborhood[]> {
  return apiFetch<Neighborhood[]>("/neighborhoods");
}

export async function fetchNeighborhood(
  slug: string
): Promise<NeighborhoodDetail> {
  return apiFetch<NeighborhoodDetail>(`/neighborhoods/${slug}`);
}

export async function checkRent(
  data: RentCheckRequest
): Promise<RentCheckResponse> {
  return apiFetch<RentCheckResponse>("/check", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchTrends(months: number = 24): Promise<TrendEntry[]> {
  return apiFetch<TrendEntry[]>(`/stats/trends?months=${months}`);
}

export async function fetchSeasonal(): Promise<SeasonalData[]> {
  return apiFetch<SeasonalData[]>("/stats/seasonal");
}
