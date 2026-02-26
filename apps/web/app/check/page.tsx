"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { checkRent } from "@/lib/api";
import { formatRent } from "@/lib/format";
import { NEIGHBORHOODS, getExpandedComparables, getNearbyNeighborhoods, getYad2SearchUrl, SOURCE_LABELS, getNeighborhoodName } from "@/lib/data";
import RentScoreCard from "@/components/rent-score-card";
import PriceDistribution from "@/components/price-distribution";
import type { RentCheckResponse, RentalListing } from "@/lib/types";

const ListingMap = dynamic(() => import("@/components/listing-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-400">
      Loading map...
    </div>
  ),
});

/* ── Helpers ───────────────────────────────────────────────────── */

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse space-y-6 px-4 py-12">
      <div className="h-16 rounded-2xl bg-gray-200" />
      <div className="h-48 rounded-2xl bg-gray-200" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-[400px] rounded-xl bg-gray-200" />
        <div className="space-y-3">
          <div className="h-16 rounded-xl bg-gray-200" />
          <div className="h-16 rounded-xl bg-gray-200" />
          <div className="h-16 rounded-xl bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

/* ── Quality badge ────────────────────────────────────── */

function QualityBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
        active
          ? "bg-brand-teal/10 text-brand-teal"
          : "bg-gray-100 text-gray-400"
      }`}
    >
      {label}
    </span>
  );
}

/* ── Comparable listing row ────────────────────────────────────── */

function CompRow({
  comp,
  userRent,
  isHovered,
  onHover,
  onLeave,
}: {
  comp: RentalListing & { similarity_score: number };
  userRent: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const diff = userRent - comp.monthly_rent;
  const cheaper = diff > 0;
  const nhoodName = getNeighborhoodName(comp.neighborhood);

  return (
    <a
      href={comp.source_url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`block rounded-lg border px-4 py-3 transition ${
        isHovered
          ? "border-brand-teal bg-brand-teal/5 shadow-sm"
          : "border-gray-100 bg-white hover:border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-gray-900">
              {comp.address}
            </p>
            <span className="shrink-0 rounded bg-brand-teal/10 px-1.5 py-0.5 text-[10px] font-medium text-brand-teal">
              {SOURCE_LABELS[comp.source as keyof typeof SOURCE_LABELS] ?? comp.source}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            {nhoodName} &middot; {comp.rooms} rooms &middot; {comp.sqm} sqm &middot; Floor {comp.floor ?? "–"}
            {comp.total_floors ? `/${comp.total_floors}` : ""}
            &middot; {comp.days_on_market}d listed
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            <QualityBadge label={comp.condition ?? "N/A"} active={comp.condition === "renovated" || comp.condition === "new"} />
            <QualityBadge label="Parking" active={comp.has_parking} />
            <QualityBadge label="Elevator" active={comp.has_elevator} />
            <QualityBadge label="Balcony" active={comp.has_balcony} />
            <QualityBadge label="A/C" active={comp.has_ac} />
            <QualityBadge label="Mamad" active={comp.has_mamad} />
          </div>
        </div>
        <div className="ml-4 text-right">
          <p className="text-sm font-bold text-gray-900">
            {formatRent(comp.monthly_rent)}
          </p>
          {cheaper ? (
            <p className="text-xs font-semibold text-score-green">
              {formatRent(diff)} cheaper
            </p>
          ) : diff < 0 ? (
            <p className="text-xs font-semibold text-score-red">
              {formatRent(Math.abs(diff))} more
            </p>
          ) : (
            <p className="text-xs text-gray-400">Same price</p>
          )}
          <p className="mt-1 text-[10px] text-gray-400">
            Match: {comp.similarity_score}%
          </p>
        </div>
      </div>
    </a>
  );
}

/* ── Main Content ──────────────────────────────────────────────── */

function CheckContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<RentCheckResponse | null>(null);
  const [compsWithCoords, setCompsWithCoords] = useState<(RentalListing & { similarity_score: number })[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredComp, setHoveredComp] = useState(-1);

  const neighborhoodId = searchParams.get("neighborhood");
  const rooms = searchParams.get("rooms") || "3";
  const sqm = searchParams.get("sqm") || "";
  const rent = searchParams.get("rent") || "";

  const neighborhood = NEIGHBORHOODS.find(
    (n) => n.id === parseInt(neighborhoodId || "0", 10)
  );
  const neighborhoodName = neighborhood?.name_en || "your area";
  const neighborhoodSlug = neighborhood?.slug || "";

  useEffect(() => {
    if (!neighborhoodId || !rooms || !sqm || !rent) {
      setError("Missing parameters. Please use the form on the home page.");
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
        // Get comparables from this + adjacent neighborhoods (1.5km radius)
        const fullComps = getExpandedComparables(
          neighborhoodSlug,
          parseFloat(rooms),
          parseInt(sqm, 10),
          null,
          20
        );
        setCompsWithCoords(fullComps);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Something went wrong.");
        setLoading(false);
      });
  }, [searchParams, neighborhoodId, rooms, sqm, rent, neighborhoodSlug]);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8">
          <p className="text-lg font-semibold text-red-700">{error}</p>
          <Link href="/" className="mt-4 inline-block rounded-lg bg-brand-teal px-6 py-2 text-sm font-medium text-white hover:bg-brand-teal-light">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const { score, your_rent, market_avg, delta_percent } = result;
  const diff = Math.abs(your_rent - market_avg);
  const cheaperCount = compsWithCoords.filter((c) => c.monthly_rent < your_rent).length;

  // Map data with neighborhood names
  const mapComps = compsWithCoords.map((c) => ({
    address: c.address,
    rooms: c.rooms,
    sqm: c.sqm,
    monthly_rent: c.monthly_rent,
    price_per_sqm: c.price_per_sqm,
    lat: c.lat,
    lng: c.lng,
    source_url: c.source_url,
    neighborhood: getNeighborhoodName(c.neighborhood),
  }));

  // Market context
  const signals = result.signals;
  const contextParts: string[] = [];
  if (signals.trend !== "Unknown") contextParts.push(`Trend: ${signals.trend}`);
  contextParts.push(`Season: ${signals.season}`);
  contextParts.push(`Supply: ${signals.supply} (${compsWithCoords.length} similar)`);
  if (signals.days_on_market > 0) contextParts.push(`Avg ${signals.days_on_market}d to rent`);

  const yad2SearchUrl = getYad2SearchUrl(neighborhoodSlug, parseFloat(rooms));

  // Which nearby neighborhoods are represented
  const nearbyNhoodSlugs = Array.from(new Set(compsWithCoords.map((c) => c.neighborhood)));
  const nearbyNhoodNames = nearbyNhoodSlugs
    .filter((s) => s !== neighborhoodSlug)
    .map(getNeighborhoodName);
  const nearbyAreaCount = nearbyNhoodSlugs.length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-gray-400">
        <Link href="/" className="hover:text-brand-navy">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">
          {rooms}-room in {neighborhoodName} at {formatRent(your_rent)}/mo
        </span>
      </nav>

      {/* ── VERDICT ── */}
      <div
        className={`rounded-2xl border p-5 ${
          score === "below_market"
            ? "border-score-green/20 bg-score-green-bg"
            : score === "at_market"
              ? "border-score-yellow/20 bg-score-yellow-bg"
              : "border-score-red/20 bg-score-red-bg"
        }`}
      >
        <p
          className={`text-center text-xl font-bold sm:text-2xl ${
            score === "below_market"
              ? "text-score-green"
              : score === "at_market"
                ? "text-score-yellow"
                : "text-score-red"
          }`}
        >
          {score === "below_market"
            ? `You're saving ${formatRent(diff)}/mo — ${Math.abs(delta_percent).toFixed(0)}% below market`
            : score === "at_market"
              ? `Fair price — within ${Math.abs(delta_percent).toFixed(0)}% of market average`
              : `You're overpaying ${formatRent(diff)}/mo — ${Math.abs(delta_percent).toFixed(0)}% above market`}
        </p>
        {score === "above_market" && cheaperCount > 0 && (
          <p className="mt-2 text-center text-sm text-gray-600">
            <a href={yad2SearchUrl} target="_blank" rel="noopener noreferrer" className="text-brand-teal underline hover:text-brand-teal-light">
              {cheaperCount} cheaper apartment{cheaperCount !== 1 ? "s" : ""}
            </a>{" "}
            nearby in {neighborhoodName}{nearbyNhoodNames.length > 0 ? ` + ${nearbyNhoodNames.join(", ")}` : ""}
          </p>
        )}
        {score === "below_market" && (
          <p className="mt-2 text-center text-sm text-gray-600">
            You&apos;re paying less than {Math.round(result.percentile)}% of renters in your area
          </p>
        )}
      </div>

      {/* ── SCORE CARD ── */}
      <div className="mt-6">
        <RentScoreCard
          score={result.score}
          scoreLabel={result.score_label}
          yourRent={result.your_rent}
          marketAvg={result.market_avg}
          deltaPercent={result.delta_percent}
          percentile={result.percentile}
        />
      </div>

      {/* ── MAP + COMPARABLE LISTINGS ── */}
      {compsWithCoords.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Nearby Listings
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                {compsWithCoords.length} in {neighborhoodName}{nearbyNhoodNames.length > 0 ? ` + ${nearbyNhoodNames.length} nearby` : ""}
              </span>
              <a
                href={yad2SearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-brand-teal/10 px-3 py-1 text-xs font-medium text-brand-teal hover:bg-brand-teal/20"
              >
                Search on Yad2
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Map */}
            <div className="h-[450px] overflow-hidden rounded-xl border border-gray-200 lg:h-auto lg:min-h-[500px]">
              <ListingMap
                center={[neighborhood?.lat ?? 32.07, neighborhood?.lng ?? 34.78]}
                comparables={mapComps}
                userRent={your_rent}
                hoveredIndex={hoveredComp}
              />
            </div>

            {/* Listing cards */}
            <div className="max-h-[550px] space-y-2 overflow-y-auto pr-1">
              {compsWithCoords.map((comp, i) => (
                <CompRow
                  key={comp.id}
                  comp={comp}
                  userRent={your_rent}
                  isHovered={hoveredComp === i}
                  onHover={() => setHoveredComp(i)}
                  onLeave={() => setHoveredComp(-1)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PRICE DISTRIBUTION ── */}
      {result.distribution.prices.length > 1 && (
        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <PriceDistribution distribution={result.distribution} />
        </div>
      )}

      {/* ── MARKET CONTEXT ── */}
      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm shadow-sm">
        {contextParts.map((part, i) => (
          <span key={i} className="flex items-center gap-1.5 text-gray-600">
            {i > 0 && <span className="text-gray-300">|</span>}
            {part}
          </span>
        ))}
      </div>

      {/* ── ACTIONABLE TIPS ── */}
      {result.tips.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-bold text-gray-900">
            {score === "above_market" ? "How to Lower Your Rent" : "What to Do Next"}
          </h2>
          <div className="space-y-3">
            {result.tips.slice(0, 3).map((tip, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm leading-relaxed text-gray-700 shadow-sm"
              >
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-teal/10 text-xs font-bold text-brand-teal">
                  {i + 1}
                </span>
                {tip}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FOOTER CTA ── */}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          href={yad2SearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-brand-navy px-6 py-2.5 text-center text-sm font-semibold text-brand-navy transition hover:bg-brand-navy hover:text-white"
        >
          Browse on Yad2
        </a>
        <Link
          href="/explore"
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
        >
          Explore All Listings
        </Link>
        <Link
          href="/#check"
          className="rounded-lg bg-brand-teal px-6 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-teal-light"
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
