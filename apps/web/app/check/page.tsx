"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { checkRent } from "@/lib/api";
import { formatRent } from "@/lib/format";
import RentScoreCard from "@/components/rent-score-card";
import type { RentCheckResponse } from "@/lib/types";

function SignalCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-brand-navy">{value}</p>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-6 px-4 py-12">
      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="h-48 rounded-2xl bg-gray-200" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 rounded-xl bg-gray-200" />
        <div className="h-24 rounded-xl bg-gray-200" />
        <div className="h-24 rounded-xl bg-gray-200" />
        <div className="h-24 rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}

function CheckContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<RentCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const neighborhoodId = searchParams.get("neighborhood");
    const rooms = searchParams.get("rooms");
    const sqm = searchParams.get("sqm");
    const rent = searchParams.get("rent");

    if (!neighborhoodId || !rooms || !sqm || !rent) {
      setError("Missing required parameters. Please use the rent checker form.");
      setLoading(false);
      return;
    }

    checkRent({
      neighborhood_id: parseInt(neighborhoodId, 10),
      rooms: parseFloat(rooms),
      sqm: parseInt(sqm, 10),
      monthly_rent: parseInt(rent, 10),
    })
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to check rent. Please try again.");
        setLoading(false);
      });
  }, [searchParams]);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8">
          <p className="text-lg font-semibold text-red-700">
            Something went wrong
          </p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-brand-teal px-6 py-2 text-sm font-medium text-white hover:bg-brand-teal-light"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Header */}
      <h1 className="mb-8 text-2xl font-bold text-brand-navy sm:text-3xl">
        Your Rent Check Results
      </h1>

      {/* Score Card */}
      <RentScoreCard
        score={result.score}
        scoreLabel={result.score_label}
        yourRent={result.your_rent}
        marketAvg={result.market_avg}
        deltaPercent={result.delta_percent}
        percentile={result.percentile}
      />

      {/* Market Signals */}
      <h2 className="mb-4 mt-10 text-lg font-bold text-gray-900">
        Market Signals
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SignalCard
          label="Trend"
          value={result.signals.trend}
          description={result.signals.trend_description}
        />
        <SignalCard
          label="Season"
          value={result.signals.season}
          description={result.signals.season_description}
        />
        <SignalCard
          label="Supply"
          value={result.signals.supply}
          description={result.signals.supply_description}
        />
        <SignalCard
          label="Days on Market"
          value={`${result.signals.days_on_market} days`}
          description={result.signals.days_on_market_description}
        />
      </div>

      {/* Negotiation Tips */}
      {result.tips.length > 0 && (
        <>
          <h2 className="mb-4 mt-10 text-lg font-bold text-gray-900">
            Negotiation Tips
          </h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <ol className="space-y-3">
              {result.tips.map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-teal/10 text-xs font-bold text-brand-teal">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}

      {/* Comparable Listings */}
      {result.comparables.length > 0 && (
        <>
          <h2 className="mb-4 mt-10 text-lg font-bold text-gray-900">
            Comparable Listings
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
                    <th className="px-4 py-3">Price/sqm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {result.comparables.slice(0, 5).map((comp, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {comp.address}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{comp.rooms}</td>
                      <td className="px-4 py-3 text-gray-600">{comp.sqm}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {formatRent(comp.monthly_rent)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatRent(comp.price_per_sqm)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Action */}
      <div className="mt-10 text-center">
        <Link
          href="/#check"
          className="inline-block rounded-lg bg-brand-teal px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-brand-teal-light hover:shadow-lg"
        >
          Check Another Apartment
        </Link>
      </div>
    </div>
  );
}

export default function CheckPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CheckContent />
    </Suspense>
  );
}
