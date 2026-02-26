"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { checkRent } from "@/lib/api";
import { formatRent } from "@/lib/format";
import { NEIGHBORHOODS } from "@/lib/data";
import RentScoreCard from "@/components/rent-score-card";
import PriceDistribution from "@/components/price-distribution";
import ConfidenceBadge from "@/components/confidence-badge";
import SavingsCalculator from "@/components/savings-calculator";
import type { RentCheckResponse } from "@/lib/types";

/* ── Small helpers ────────────────────────────────────────────────── */

function SectionHeader({
  step,
  title,
  subtitle,
}: {
  step: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">
        {step}
      </span>
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

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
      <div className="h-6 w-64 rounded bg-gray-200" />
      <div className="h-20 rounded-2xl bg-gray-200" />
      <div className="h-48 rounded-2xl bg-gray-200" />
      <div className="grid grid-cols-2 gap-4">
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

/* ── Verdict — the plain-English summary at the very top ──────── */

function Verdict({
  result,
  neighborhoodName,
  rooms,
}: {
  result: RentCheckResponse;
  neighborhoodName: string;
  rooms: string;
}) {
  const { score, your_rent, market_avg, delta_percent } = result;
  const diff = Math.abs(your_rent - market_avg);

  let verdictText: string;
  let verdictColor: string;
  let verdictBg: string;

  if (score === "below_market") {
    verdictText = `Great news — you're paying ${formatRent(diff)} less than similar ${rooms}-room apartments in ${neighborhoodName}.`;
    verdictColor = "text-score-green";
    verdictBg = "bg-score-green-bg border-score-green/20";
  } else if (score === "at_market") {
    verdictText = `Your ${rooms}-room in ${neighborhoodName} at ${formatRent(your_rent)}/mo is in line with the market average.`;
    verdictColor = "text-score-yellow";
    verdictBg = "bg-score-yellow-bg border-score-yellow/20";
  } else {
    verdictText = `You're paying ${formatRent(diff)} more than similar ${rooms}-room apartments in ${neighborhoodName}.`;
    verdictColor = "text-score-red";
    verdictBg = "bg-score-red-bg border-score-red/20";
  }

  return (
    <div className={`rounded-2xl border p-5 ${verdictBg}`}>
      <p className={`text-center text-lg font-semibold leading-relaxed ${verdictColor}`}>
        {verdictText}
      </p>
      <p className="mt-2 text-center text-sm text-gray-500">
        Market average: {formatRent(market_avg)}/mo &middot; Your rent: {formatRent(your_rent)}/mo &middot; {Math.abs(delta_percent).toFixed(1)}% {delta_percent > 0 ? "above" : delta_percent < 0 ? "below" : "at"} market
      </p>
    </div>
  );
}

/* ── Next Steps — clear guidance on what to do now ────────────── */

function NextSteps({
  result,
  neighborhoodSlug,
  neighborhoodName,
}: {
  result: RentCheckResponse;
  neighborhoodSlug: string;
  neighborhoodName: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-brand-navy">What to do next</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          href={`/neighborhood/${neighborhoodSlug}`}
          className="group flex flex-col rounded-xl border border-gray-100 p-4 transition hover:border-brand-teal/30 hover:shadow-md"
        >
          <span className="mb-2 text-2xl">📍</span>
          <span className="text-sm font-semibold text-gray-900 group-hover:text-brand-teal">
            Explore {neighborhoodName}
          </span>
          <span className="mt-1 text-xs text-gray-500">
            See all listings, price ranges, and room-size breakdowns
          </span>
        </Link>
        <Link
          href="/dashboard"
          className="group flex flex-col rounded-xl border border-gray-100 p-4 transition hover:border-brand-teal/30 hover:shadow-md"
        >
          <span className="mb-2 text-2xl">📊</span>
          <span className="text-sm font-semibold text-gray-900 group-hover:text-brand-teal">
            Compare neighborhoods
          </span>
          <span className="mt-1 text-xs text-gray-500">
            See how {neighborhoodName} stacks up against other areas
          </span>
        </Link>
        <Link
          href="/#check"
          className="group flex flex-col rounded-xl border border-gray-100 p-4 transition hover:border-brand-teal/30 hover:shadow-md"
        >
          <span className="mb-2 text-2xl">🔄</span>
          <span className="text-sm font-semibold text-gray-900 group-hover:text-brand-teal">
            Check another apartment
          </span>
          <span className="mt-1 text-xs text-gray-500">
            Compare a different neighborhood, size, or price
          </span>
        </Link>
      </div>
    </div>
  );
}

/* ── Main content ─────────────────────────────────────────────── */

function CheckContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<RentCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const neighborhoodId = searchParams.get("neighborhood");
  const rooms = searchParams.get("rooms") || "2";
  const sqm = searchParams.get("sqm") || "";
  const rent = searchParams.get("rent") || "";

  // Look up neighborhood for display
  const neighborhood = NEIGHBORHOODS.find(
    (n) => n.id === parseInt(neighborhoodId || "0", 10)
  );
  const neighborhoodName = neighborhood?.name_en || "your area";
  const neighborhoodSlug = neighborhood?.slug || "";

  useEffect(() => {
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
  }, [searchParams, neighborhoodId, rooms, sqm, rent]);

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
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Breadcrumb — shows where you are */}
      <nav className="mb-6 text-sm text-gray-400">
        <Link href="/" className="hover:text-brand-navy">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Rent check for {neighborhoodName}</span>
      </nav>

      {/* ── VERDICT — plain-English summary ────────────────────── */}
      <Verdict result={result} neighborhoodName={neighborhoodName} rooms={rooms} />

      {/* Data confidence — how reliable is this? */}
      <div className="mt-4">
        <ConfidenceBadge confidence={result.confidence} />
      </div>

      {/* ── SECTION 1: Your Score ──────────────────────────────── */}
      <div className="mt-10">
        <SectionHeader
          step={1}
          title="Your Score"
          subtitle="How your rent compares to similar apartments nearby"
        />
        <RentScoreCard
          score={result.score}
          scoreLabel={result.score_label}
          yourRent={result.your_rent}
          marketAvg={result.market_avg}
          deltaPercent={result.delta_percent}
          percentile={result.percentile}
        />
      </div>

      {/* ── SECTION 2: The Evidence ────────────────────────────── */}
      <div className="mt-10">
        <SectionHeader
          step={2}
          title="The Evidence"
          subtitle="Market data that backs up your score"
        />

        {/* Price Distribution */}
        {result.distribution.prices.length > 0 && (
          <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <PriceDistribution distribution={result.distribution} />
          </div>
        )}

        {/* Neighborhood vs City */}
        {result.neighborhood_vs_city && (
          <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Neighborhood vs City</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{neighborhoodName}</p>
                <p className="mt-1 text-2xl font-bold text-brand-navy">{formatRent(result.neighborhood_vs_city.neighborhood_avg)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">City Average</p>
                <p className="mt-1 text-2xl font-bold text-gray-500">{formatRent(result.neighborhood_vs_city.city_avg)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Difference</p>
                <p className={`mt-1 text-2xl font-bold ${result.neighborhood_vs_city.delta_percent > 0 ? "text-score-red" : "text-score-green"}`}>
                  {result.neighborhood_vs_city.delta_percent > 0 ? "+" : ""}{result.neighborhood_vs_city.delta_percent.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Market Signals */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

        {/* Comparable Listings */}
        {result.comparables.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              Similar apartments ({result.comparables.length} listings)
            </h3>
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
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
          </div>
        )}
      </div>

      {/* ── SECTION 3: Your Action Plan ────────────────────────── */}
      <div className="mt-10">
        <SectionHeader
          step={3}
          title="Your Action Plan"
          subtitle={
            result.score === "above_market"
              ? "Use these strategies to negotiate a better rent"
              : result.score === "below_market"
                ? "How to protect and keep your great deal"
                : "Smart moves to stay ahead of the market"
          }
        />

        {/* Savings Calculator (only above market) */}
        {result.savings && (
          <div className="mb-6">
            <SavingsCalculator savings={result.savings} currentRent={result.your_rent} />
          </div>
        )}

        {/* Negotiation Tips */}
        {result.tips.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">
              {result.score === "above_market" ? "Negotiation Playbook" : "Smart Moves"}
            </h3>
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
        )}
      </div>

      {/* ── WHAT TO DO NEXT — clear pathways forward ───────────── */}
      <div className="mt-10">
        <NextSteps
          result={result}
          neighborhoodSlug={neighborhoodSlug}
          neighborhoodName={neighborhoodName}
        />
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
