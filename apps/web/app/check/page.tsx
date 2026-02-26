"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { checkRent } from "@/lib/api";
import { formatRent } from "@/lib/format";
import RentScoreCard from "@/components/rent-score-card";
import PriceDistribution from "@/components/price-distribution";
import ConfidenceBadge from "@/components/confidence-badge";
import SavingsCalculator from "@/components/savings-calculator";
import type { RentCheckResponse } from "@/lib/types";

function SignalCard({
  label,
  value,
  description,
  variant,
}: {
  label: string;
  value: string;
  description: string;
  variant?: "positive" | "negative" | "neutral";
}) {
  const borderColor =
    variant === "positive"
      ? "border-l-score-green"
      : variant === "negative"
        ? "border-l-score-red"
        : "border-l-brand-teal";

  return (
    <div className={`rounded-xl border border-gray-100 border-l-4 ${borderColor} bg-white p-4 shadow-sm`}>
      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-brand-navy">{value}</p>
      <p className="mt-1 text-sm leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse space-y-6 px-4 py-12">
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

function getSignalVariant(label: string, value: string): "positive" | "negative" | "neutral" {
  if (label === "Trend") return value === "Falling" ? "positive" : value === "Rising" ? "negative" : "neutral";
  if (label === "Season") return value === "Good to Negotiate" ? "positive" : value === "Hard to Negotiate" ? "negative" : "neutral";
  if (label === "Supply") return value === "High" ? "positive" : value === "Low" ? "negative" : "neutral";
  return "neutral";
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
          <p className="text-lg font-semibold text-red-700">Something went wrong</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <Link href="/" className="mt-4 inline-block rounded-lg bg-brand-teal px-6 py-2 text-sm font-medium text-white hover:bg-brand-teal-light">
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const signals = [
    { label: "Trend", value: result.signals.trend, description: result.signals.trend_description },
    { label: "Season", value: result.signals.season, description: result.signals.season_description },
    { label: "Supply", value: result.signals.supply, description: result.signals.supply_description },
    { label: "Days on Market", value: `${result.signals.days_on_market} days`, description: result.signals.days_on_market_description },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Header + Confidence */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-brand-navy sm:text-3xl">
          Your Rent Check Results
        </h1>
        <ConfidenceBadge confidence={result.confidence} />
      </div>

      {/* Score Card */}
      <RentScoreCard
        score={result.score}
        scoreLabel={result.score_label}
        yourRent={result.your_rent}
        marketAvg={result.market_avg}
        deltaPercent={result.delta_percent}
        percentile={result.percentile}
      />

      {/* Price Distribution */}
      {result.distribution.prices.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Price Distribution
          </h2>
          <PriceDistribution distribution={result.distribution} />
        </div>
      )}

      {/* Savings Calculator */}
      <div className="mt-8">
        <SavingsCalculator savings={result.savings} currentRent={result.your_rent} />
      </div>

      {/* Neighborhood vs City */}
      {result.neighborhood_vs_city && (
        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Neighborhood Context</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">This Neighborhood</p>
              <p className="mt-1 text-2xl font-bold text-brand-navy">{formatRent(result.neighborhood_vs_city.neighborhood_avg)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">City Average</p>
              <p className="mt-1 text-2xl font-bold text-gray-600">{formatRent(result.neighborhood_vs_city.city_avg)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">vs City</p>
              <p className={`mt-1 text-2xl font-bold ${result.neighborhood_vs_city.delta_percent > 0 ? "text-score-red" : "text-score-green"}`}>
                {result.neighborhood_vs_city.delta_percent > 0 ? "+" : ""}{result.neighborhood_vs_city.delta_percent.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Market Signals */}
      <h2 className="mb-4 mt-10 text-lg font-bold text-gray-900">Market Signals</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {signals.map((s) => (
          <SignalCard
            key={s.label}
            label={s.label}
            value={s.value}
            description={s.description}
            variant={getSignalVariant(s.label, s.value)}
          />
        ))}
      </div>

      {/* Negotiation Tips */}
      {result.tips.length > 0 && (
        <>
          <h2 className="mb-4 mt-10 text-lg font-bold text-gray-900">Negotiation Playbook</h2>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <ol className="space-y-4">
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
            Comparable Listings ({result.comparables.length})
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
                  {result.comparables.map((comp, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{comp.address}</td>
                      <td className="px-4 py-3 text-gray-600">{comp.rooms}</td>
                      <td className="px-4 py-3 text-gray-600">{comp.sqm}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{formatRent(comp.monthly_rent)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatRent(comp.price_per_sqm)}</td>
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
