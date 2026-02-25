"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchNeighborhoods, fetchTrends, fetchSeasonal } from "@/lib/api";
import { formatRent, formatPricePerSqm } from "@/lib/format";
import TrendChart from "@/components/trend-chart";
import type { Neighborhood, TrendEntry, SeasonalData } from "@/lib/types";

type SortKey = "name_en" | "avg_rent_2br" | "avg_price_per_sqm";
type SortDir = "asc" | "desc";

function SeasonalCard({ data }: { data: SeasonalData[] }) {
  const currentMonth = new Date().getMonth() + 1;
  const current = data.find((d) => d.month === currentMonth);

  if (!current) return null;

  const demandColor =
    current.demand_level === "high"
      ? "text-score-red"
      : current.demand_level === "low"
        ? "text-score-green"
        : "text-score-yellow";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-medium uppercase tracking-wider text-gray-400">
        Seasonal Indicator
      </h3>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-brand-navy">
          {current.month_name}
        </span>
        <span className={`text-sm font-semibold ${demandColor}`}>
          {current.demand_level} demand
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        {current.recommendation}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [trends, setTrends] = useState<TrendEntry[]>([]);
  const [seasonal, setSeasonal] = useState<SeasonalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("name_en");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  useEffect(() => {
    Promise.all([fetchNeighborhoods(), fetchTrends(24), fetchSeasonal()])
      .then(([n, t, s]) => {
        setNeighborhoods(n);
        setTrends(t);
        setSeasonal(s);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = [...neighborhoods].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "name_en") {
      return dir * a.name_en.localeCompare(b.name_en);
    }
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;
    return dir * (aVal - bVal);
  });

  function SortArrow({ column }: { column: SortKey }) {
    if (sortKey !== column) return <span className="ml-1 text-gray-300">&#8597;</span>;
    return (
      <span className="ml-1 text-brand-teal">
        {sortDir === "asc" ? "&#9650;" : "&#9660;"}
      </span>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse space-y-6 px-4 py-12">
        <div className="h-8 w-64 rounded bg-gray-200" />
        <div className="h-80 rounded-2xl bg-gray-200" />
        <div className="h-64 rounded-2xl bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-brand-navy sm:text-3xl">
        Tel Aviv Rental Market
      </h1>

      {/* Top row: Trend chart + Seasonal card */}
      <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-400">
            Rent Index Trend (24 months)
          </h2>
          <TrendChart data={trends} />
        </div>
        {seasonal.length > 0 && <SeasonalCard data={seasonal} />}
      </div>

      {/* Neighborhood table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            Neighborhoods
          </h2>
          <p className="text-sm text-gray-500">
            Click a column header to sort. Click a neighborhood to see details.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th
                  className="cursor-pointer px-6 py-3 hover:text-brand-navy"
                  onClick={() => toggleSort("name_en")}
                >
                  Neighborhood
                  <SortArrow column="name_en" />
                </th>
                <th
                  className="cursor-pointer px-6 py-3 hover:text-brand-navy"
                  onClick={() => toggleSort("avg_rent_2br")}
                >
                  Avg Rent (2BR)
                  <SortArrow column="avg_rent_2br" />
                </th>
                <th
                  className="cursor-pointer px-6 py-3 hover:text-brand-navy"
                  onClick={() => toggleSort("avg_price_per_sqm")}
                >
                  Price / sqm
                  <SortArrow column="avg_price_per_sqm" />
                </th>
                <th className="px-6 py-3">Listings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map((n) => (
                <tr key={n.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <Link
                      href={`/neighborhood/${n.slug}`}
                      className="font-medium text-brand-navy hover:underline"
                    >
                      {n.name_en}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-gray-700">
                    {n.avg_rent_2br ? formatRent(n.avg_rent_2br) : "-"}
                  </td>
                  <td className="px-6 py-3 text-gray-700">
                    {n.avg_price_per_sqm
                      ? formatPricePerSqm(n.avg_price_per_sqm)
                      : "-"}
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {n.listing_count}
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No neighborhoods found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
