"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchNeighborhood } from "@/lib/api";
import { formatRent, formatPricePerSqm } from "@/lib/format";
import type { NeighborhoodDetail } from "@/lib/types";

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-brand-navy">{value}</p>
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
        <div className="grid grid-cols-3 gap-4">
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
          <p className="text-lg font-semibold text-red-700">
            Neighborhood not found
          </p>
          <p className="mt-2 text-sm text-red-600">
            {error || "We couldn't find this neighborhood."}
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block rounded-lg bg-brand-teal px-6 py-2 text-sm font-medium text-white hover:bg-brand-teal-light"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-brand-navy">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{data.name_en}</span>
      </nav>

      {/* Header */}
      <h1 className="mb-6 text-2xl font-bold text-brand-navy sm:text-3xl">
        {data.name_en}
        <span className="ml-3 text-lg font-normal text-gray-400">
          {data.name_he}
        </span>
      </h1>

      {/* Stats */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatBadge
          label="Avg Rent (2BR)"
          value={data.avg_rent_2br ? formatRent(data.avg_rent_2br) : "N/A"}
        />
        <StatBadge
          label="Price / sqm"
          value={
            data.avg_price_per_sqm
              ? formatPricePerSqm(data.avg_price_per_sqm)
              : "N/A"
          }
        />
        <StatBadge
          label="Active Listings"
          value={data.listing_count.toString()}
        />
      </div>

      {/* Active Listings */}
      {data.listings && data.listings.length > 0 && (
        <>
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Active Listings
          </h2>
          <div className="mb-10 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-3">Address</th>
                    <th className="px-4 py-3">Rooms</th>
                    <th className="px-4 py-3">Sqm</th>
                    <th className="px-4 py-3">Rent</th>
                    <th className="px-4 py-3">Price/sqm</th>
                    <th className="px-4 py-3">Days Listed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.listings.map((listing) => (
                    <tr
                      key={listing.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {listing.address}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {listing.rooms}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {listing.sqm}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {formatRent(listing.monthly_rent)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatRent(listing.price_per_sqm)}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {listing.days_on_market}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Recent Transactions */}
      {data.recent_transactions && data.recent_transactions.length > 0 && (
        <>
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Recent Transactions
          </h2>
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-3">Address</th>
                    <th className="px-4 py-3">Rooms</th>
                    <th className="px-4 py-3">Sqm</th>
                    <th className="px-4 py-3">Rent</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recent_transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {tx.address}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{tx.rooms}</td>
                      <td className="px-4 py-3 text-gray-600">{tx.sqm}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {formatRent(tx.monthly_rent)}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(tx.posted_date).toLocaleDateString("en-IL")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {(!data.listings || data.listings.length === 0) &&
        (!data.recent_transactions ||
          data.recent_transactions.length === 0) && (
          <div className="rounded-2xl border border-gray-100 bg-white py-12 text-center shadow-sm">
            <p className="text-gray-400">
              No listing data available for this neighborhood yet.
            </p>
          </div>
        )}
    </div>
  );
}
