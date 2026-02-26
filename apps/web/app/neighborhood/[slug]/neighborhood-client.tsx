"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchNeighborhood } from "@/lib/api";
import { formatRent, formatPricePerSqm } from "@/lib/format";
import { getRawNeighborhood, getCBSRentForRooms, NEIGHBORHOODS } from "@/lib/data";
import type { NeighborhoodDetail } from "@/lib/types";

function StatBadge({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 text-xl font-bold text-brand-navy">{value}</p>
      {sublabel && <p className="mt-0.5 text-xs text-gray-500">{sublabel}</p>}
    </div>
  );
}

function RentByRoomSize({ slug }: { slug: string }) {
  const raw = getRawNeighborhood(slug);
  if (!raw) return null;

  const rooms = [
    { label: "1 BR", value: raw.avg_rent_1br },
    { label: "2 BR", value: raw.avg_rent_2br },
    { label: "3 BR", value: raw.avg_rent_3br },
    { label: "4 BR", value: raw.avg_rent_4br },
  ];

  return (
    <div className="mb-10">
      <h2 className="mb-4 text-lg font-bold text-gray-900">Average Rent by Size</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {rooms.map((r) => (
          <div key={r.label} className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{r.label}</p>
            <p className="mt-1 text-lg font-bold text-brand-navy">
              {r.value ? formatRent(r.value) : "N/A"}
            </p>
            {r.value && (
              <p className="mt-0.5 text-xs text-gray-400">
                {(() => {
                  const roomNum = parseFloat(r.label);
                  const cbs = getCBSRentForRooms(roomNum);
                  if (!cbs) return "";
                  const diff = Math.round(((r.value - cbs.avg_rent_all) / cbs.avg_rent_all) * 100);
                  return diff > 0 ? `+${diff}% vs city` : `${diff}% vs city`;
                })()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NeighborhoodClient({ slug }: { slug: string }) {
  const [data, setData] = useState<NeighborhoodDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchNeighborhood(slug)
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load neighborhood");
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse space-y-6 px-4 py-12">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="h-20 rounded-xl bg-gray-200" />
          <div className="h-20 rounded-xl bg-gray-200" />
          <div className="h-20 rounded-xl bg-gray-200" />
          <div className="h-20 rounded-xl bg-gray-200" />
        </div>
        <div className="h-64 rounded-2xl bg-gray-200" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8">
          <p className="text-lg font-semibold text-red-700">Neighborhood not found</p>
          <p className="mt-2 text-sm text-red-600">{error || "We couldn\u2019t find this neighborhood."}</p>
          <Link href="/dashboard" className="mt-4 inline-block rounded-lg bg-brand-teal px-6 py-2 text-sm font-medium text-white hover:bg-brand-teal-light">
            Back to Market Explorer
          </Link>
        </div>
      </div>
    );
  }

  const neighborhoodData = NEIGHBORHOODS.find((n) => n.slug === slug);
  const avgDom = data.listings.length > 0
    ? Math.round(data.listings.reduce((s, l) => s + l.days_on_market, 0) / data.listings.length)
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Breadcrumb — clear wayfinding */}
      <nav className="mb-6 text-sm text-gray-400">
        <Link href="/" className="hover:text-brand-navy">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/dashboard" className="hover:text-brand-navy">Explore Market</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{data.name_en}</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">
            {data.name_en}
            <span className="ml-3 text-lg font-normal text-gray-400">{data.name_he}</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {data.listing_count} active listings &middot; {neighborhoodData?.avg_rent_2br ? `${formatRent(neighborhoodData.avg_rent_2br)} avg (2BR)` : ""}
          </p>
        </div>
        <Link
          href={`/#check`}
          className="inline-block rounded-lg bg-brand-teal px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-teal-light"
        >
          Check Your Rent in {data.name_en}
        </Link>
      </div>

      {/* Key Stats */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatBadge label="Avg Rent (2BR)" value={data.avg_rent_2br ? formatRent(data.avg_rent_2br) : "N/A"} />
        <StatBadge label="Rent / sqm" value={data.avg_price_per_sqm ? formatPricePerSqm(data.avg_price_per_sqm) : "N/A"} />
        <StatBadge label="Active Listings" value={data.listing_count.toString()} />
        <StatBadge
          label="Avg Days Listed"
          value={avgDom !== null ? `${avgDom} days` : "N/A"}
          sublabel={avgDom !== null ? (avgDom > 14 ? "Slower market" : avgDom < 7 ? "Fast-moving" : "Normal pace") : undefined}
        />
      </div>

      {/* Price Range */}
      {neighborhoodData?.price_range && (
        <div className="mb-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-gray-900">Price Range</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-500">{formatRent(neighborhoodData.price_range.min)}</span>
            <div className="relative h-3 flex-1 rounded-full bg-gradient-to-r from-score-green via-score-yellow to-score-red opacity-60">
              {neighborhoodData.median_rent_2br && (
                <div
                  className="absolute top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-brand-navy shadow"
                  style={{
                    left: `${Math.min(98, Math.max(2, ((neighborhoodData.median_rent_2br - neighborhoodData.price_range.min) / (neighborhoodData.price_range.max - neighborhoodData.price_range.min)) * 100))}%`,
                  }}
                />
              )}
            </div>
            <span className="text-sm font-medium text-gray-500">{formatRent(neighborhoodData.price_range.max)}</span>
          </div>
          {neighborhoodData.median_rent_2br && (
            <p className="mt-2 text-center text-xs text-gray-400">
              Median (2BR): {formatRent(neighborhoodData.median_rent_2br)}
            </p>
          )}
        </div>
      )}

      {/* Rent by room size */}
      <RentByRoomSize slug={slug} />

      {/* Active Listings */}
      {data.listings && data.listings.length > 0 && (
        <>
          <h2 className="mb-4 text-lg font-bold text-gray-900">Active Listings ({data.listings.length})</h2>
          <div className="mb-10 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-3">Address</th>
                    <th className="px-4 py-3">Rooms</th>
                    <th className="px-4 py-3">Sqm</th>
                    <th className="px-4 py-3">Rent</th>
                    <th className="px-4 py-3">Rent/sqm</th>
                    <th className="px-4 py-3">Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.listings.map((listing) => (
                    <tr key={listing.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{listing.address}</td>
                      <td className="px-4 py-3 text-gray-600">{listing.rooms}</td>
                      <td className="px-4 py-3 text-gray-600">{listing.sqm}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{formatRent(listing.monthly_rent)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatRent(listing.price_per_sqm)}</td>
                      <td className="px-4 py-3 text-gray-500">{listing.days_on_market}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {(!data.listings || data.listings.length === 0) && (
        <div className="rounded-2xl border border-gray-100 bg-white py-12 text-center shadow-sm">
          <p className="text-gray-400">No listing data available for this neighborhood yet.</p>
        </div>
      )}

      {/* CTA — check your rent in this neighborhood */}
      <div className="mt-6 rounded-2xl border border-brand-teal/20 bg-brand-teal/5 p-6 text-center">
        <p className="text-lg font-semibold text-brand-navy">
          Renting in {data.name_en}?
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Find out if you&apos;re paying a fair price compared to these {data.listing_count} listings.
        </p>
        <Link
          href="/#check"
          className="mt-4 inline-block rounded-lg bg-brand-teal px-8 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-teal-light hover:shadow-lg"
        >
          Check Your Rent
        </Link>
      </div>
    </div>
  );
}
