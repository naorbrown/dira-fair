"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchNeighborhoods, fetchTrends, fetchSeasonal } from "@/lib/api";
import { formatRent, formatPricePerSqm } from "@/lib/format";
import { getCityStats, DATA_META } from "@/lib/data";
import TrendChart from "@/components/trend-chart";
import NeighborhoodComparison from "@/components/neighborhood-comparison";
import type { Neighborhood, TrendEntry, SeasonalData } from "@/lib/types";

type SortKey = "name_en" | "avg_rent_2br" | "avg_price_per_sqm" | "listing_count";
type SortDir = "asc" | "desc";

function MetricCard({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-brand-navy">{value}</p>
      {sublabel && <p className="mt-0.5 text-xs text-gray-500">{sublabel}</p>}
    </div>
  );
}

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
      <h3 className="text-sm font-medium uppercase tracking-wider text-gray-400">Seasonal Indicator</h3>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-brand-navy">{current.month_name}</span>
        <span className={`text-sm font-semibold ${demandColor}`}>{current.demand_level} demand</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{current.recommendation}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [trends, setTrends] = useState<TrendEntry[]>([]);
  const [seasonal, setSeasonal] = useState<SeasonalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("avg_rent_2br");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const stats = getCityStats();

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
      setSortDir(key === "name_en" ? "asc" : "desc");
    }
  }

  const sorted = [...neighborhoods].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "name_en") return dir * a.name_en.localeCompare(b.name_en);
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;
    return dir * (aVal - bVal);
  });

  function SortArrow({ column }: { column: SortKey }) {
    if (sortKey !== column) return <span className="ml-1 text-gray-300">&#8597;</span>;
    return <span className="ml-1 text-brand-teal">{sortDir === "asc" ? "\u25B2" : "\u25BC"}</span>;
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse space-y-6 px-4 py-12">
        <div className="h-8 w-64 rounded bg-gray-200" />
        <div className="grid grid-cols-4 gap-4">
          <div className="h-20 rounded-xl bg-gray-200" />
          <div className="h-20 rounded-xl bg-gray-200" />
          <div className="h-20 rounded-xl bg-gray-200" />
          <div className="h-20 rounded-xl bg-gray-200" />
        </div>
        <div className="h-80 rounded-2xl bg-gray-200" />
        <div className="h-64 rounded-2xl bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-400">
        <Link href="/" className="hover:text-brand-navy">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Explore Market</span>
      </nav>

      {/* Page header — explains purpose */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">Explore the Market</h1>
          <p className="mt-1 text-sm text-gray-500">
            Browse neighborhoods, compare rents, and spot trends — then check your own rent when you&apos;re ready.
          </p>
        </div>
        <Link href="/#check" className="hidden rounded-lg bg-brand-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-teal-light sm:block">
          Check Your Rent
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Avg Rent (2BR)" value={formatRent(stats.avg_rent_2br)} sublabel="City-wide average" />
        <MetricCard label="Median Rent" value={formatRent(stats.median_rent)} sublabel="All listing types" />
        <MetricCard label="Active Listings" value={stats.total_listings.toString()} sublabel={`${stats.neighborhoods_covered} neighborhoods`} />
        <MetricCard label="YoY Change" value={`${stats.yoy_change > 0 ? "+" : ""}${stats.yoy_change}%`} sublabel="Rent index trend" />
      </div>

      {/* Trend chart + Seasonal */}
      <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-400">Rent Index Trend (24 months)</h2>
          <TrendChart data={trends} />
        </div>
        {seasonal.length > 0 && <SeasonalCard data={seasonal} />}
      </div>

      {/* Neighborhood Comparison Chart */}
      <div className="mb-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-400">Neighborhood Rent Comparison (2BR)</h2>
        <NeighborhoodComparison neighborhoods={neighborhoods} />
      </div>

      {/* Neighborhood Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">All Neighborhoods</h2>
          <p className="text-sm text-gray-500">Click a neighborhood to see listings and details. Click headers to sort.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="cursor-pointer px-6 py-3 hover:text-brand-navy" onClick={() => toggleSort("name_en")}>
                  Neighborhood<SortArrow column="name_en" />
                </th>
                <th className="cursor-pointer px-6 py-3 hover:text-brand-navy" onClick={() => toggleSort("avg_rent_2br")}>
                  Avg Rent (2BR)<SortArrow column="avg_rent_2br" />
                </th>
                <th className="cursor-pointer px-6 py-3 hover:text-brand-navy" onClick={() => toggleSort("avg_price_per_sqm")}>
                  Rent / sqm<SortArrow column="avg_price_per_sqm" />
                </th>
                <th className="cursor-pointer px-6 py-3 hover:text-brand-navy" onClick={() => toggleSort("listing_count")}>
                  Listings<SortArrow column="listing_count" />
                </th>
                <th className="px-6 py-3">Price Range</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map((n) => (
                <tr key={n.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <Link href={`/neighborhood/${n.slug}`} className="font-medium text-brand-navy hover:underline">
                      {n.name_en}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-gray-700">{n.avg_rent_2br ? formatRent(n.avg_rent_2br) : "-"}</td>
                  <td className="px-6 py-3 text-gray-700">{n.avg_price_per_sqm ? formatPricePerSqm(n.avg_price_per_sqm) : "-"}</td>
                  <td className="px-6 py-3 text-gray-500">{n.listing_count}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {n.price_range ? `${formatRent(n.price_range.min)} – ${formatRent(n.price_range.max)}` : "-"}
                  </td>
                  <td className="px-6 py-3">
                    <Link
                      href={`/neighborhood/${n.slug}`}
                      className="text-xs font-medium text-brand-teal hover:underline"
                    >
                      View &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA to check rent */}
      <div className="mt-10 rounded-2xl border border-brand-teal/20 bg-brand-teal/5 p-6 text-center">
        <p className="text-lg font-semibold text-brand-navy">Ready to check your own rent?</p>
        <p className="mt-1 text-sm text-gray-500">
          Now that you&apos;ve explored the market, see exactly where your apartment stands.
        </p>
        <Link
          href="/#check"
          className="mt-4 inline-block rounded-lg bg-brand-teal px-8 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-teal-light hover:shadow-lg"
        >
          Check Your Rent
        </Link>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400">
        Data from {DATA_META.sources.map((s) => s.name).join(", ")} | Updated {DATA_META.last_updated}
      </p>
    </div>
  );
}
