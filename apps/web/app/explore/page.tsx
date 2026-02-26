"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { LISTINGS, NEIGHBORHOODS, SOURCE_LABELS, getClosedMarketData, getCityClosedMarketSummary, DECISION_FACTORS } from "@/lib/data";
import { formatRent } from "@/lib/format";
import type { RentalListing, ClosedMarketData, NeighborhoodDecisionFactors } from "@/lib/types";
import { PriceLegend } from "@/components/explore-map";

const ExploreMap = dynamic(() => import("@/components/explore-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-100 text-sm text-gray-400">
      Loading map...
    </div>
  ),
});

// ── Constants ──
const ROOM_OPTIONS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

const SOURCE_OPTIONS: { id: string; label: string }[] = [
  { id: "yad2", label: "Yad2" },
  { id: "homeless", label: "Homeless TLV" },
  { id: "fbmarket", label: "FB Marketplace" },
  { id: "komo", label: "Komo" },
  { id: "winwin", label: "WinWin" },
  { id: "onmap", label: "OnMap" },
  { id: "agora", label: "Agora TLV" },
  { id: "madlan", label: "Madlan" },
  { id: "private", label: "Private" },
];

const SORT_OPTIONS = [
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
  { id: "newest", label: "Newest First" },
  { id: "sqm_desc", label: "Largest First" },
  { id: "quality", label: "Best Quality" },
  { id: "value", label: "Best Value (per sqm)" },
];

const CONDITION_OPTIONS = ["new", "renovated", "good", "fair", "needs_work"];

// ── Tabs for the sidebar ──
type SidebarTab = "listings" | "market" | "factors";

// ── Source badge colors ──
function sourceBadge(source: string): string {
  switch (source) {
    case "yad2": return "bg-blue-50 text-blue-600 ring-blue-100";
    case "homeless": return "bg-purple-50 text-purple-600 ring-purple-100";
    case "fbmarket": return "bg-indigo-50 text-indigo-600 ring-indigo-100";
    case "komo": return "bg-cyan-50 text-cyan-600 ring-cyan-100";
    case "winwin": return "bg-teal-50 text-teal-600 ring-teal-100";
    case "onmap": return "bg-emerald-50 text-emerald-600 ring-emerald-100";
    case "agora": return "bg-pink-50 text-pink-600 ring-pink-100";
    case "madlan": return "bg-amber-50 text-amber-600 ring-amber-100";
    case "private": return "bg-gray-50 text-gray-600 ring-gray-200";
    default: return "bg-gray-50 text-gray-600 ring-gray-200";
  }
}

// ── Compact Listing Card ──
function ListingCard({
  listing,
  isHovered,
  isSelected,
  onHover,
  onSelect,
}: {
  listing: RentalListing;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (id: number | null) => void;
  onSelect: (id: number) => void;
}) {
  const neighborhood = NEIGHBORHOODS.find((n) => n.slug === listing.neighborhood);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHovered && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isHovered]);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => onHover(listing.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(listing.id)}
      className={`cursor-pointer rounded-lg border transition-all ${
        isSelected
          ? "border-brand-teal bg-brand-teal/5 shadow-md ring-1 ring-brand-teal/20"
          : isHovered
            ? "border-brand-teal/40 bg-white shadow-sm"
            : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
      } ${isSelected ? "p-3" : "px-3 py-2"}`}
    >
      {/* Row 1: Price + Address + Source */}
      <div className="flex items-center gap-2">
        <span className="text-base font-bold text-gray-900 tabular-nums">{formatRent(listing.monthly_rent)}</span>
        <span className="text-[10px] text-gray-400">/mo</span>
        <span className="flex-1 truncate text-xs text-gray-500">{listing.address}</span>
        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ring-1 ${sourceBadge(listing.source)}`}>
          {SOURCE_LABELS[listing.source as keyof typeof SOURCE_LABELS] ?? listing.source}
        </span>
      </div>

      {/* Row 2: Details */}
      <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
        <span className="font-medium text-gray-700">{listing.rooms}r</span>
        <span className="text-gray-300">&middot;</span>
        <span>{listing.sqm}m&sup2;</span>
        {listing.floor != null && (
          <>
            <span className="text-gray-300">&middot;</span>
            <span>F{listing.floor}{listing.total_floors ? `/${listing.total_floors}` : ""}</span>
          </>
        )}
        <span className="text-gray-300">&middot;</span>
        <span>{formatRent(Math.round(listing.monthly_rent / listing.sqm))}/m&sup2;</span>
        <span className="flex-1" />
        <span className="text-gray-400">{listing.days_on_market}d</span>
        <span className={`text-[10px] font-medium ${listing.quality_score >= 70 ? "text-green-600" : listing.quality_score >= 50 ? "text-amber-600" : "text-gray-400"}`}>
          Q{listing.quality_score}
        </span>
      </div>

      {/* Row 3: Feature chips (compact) */}
      <div className="mt-1 flex items-center gap-1 overflow-hidden">
        <span className="rounded bg-gray-50 px-1 py-0.5 text-[9px] text-gray-500">
          {neighborhood?.name_en ?? listing.neighborhood}
        </span>
        {listing.condition && listing.condition !== "fair" && listing.condition !== "needs_work" && (
          <span className="rounded bg-brand-navy/10 px-1 py-0.5 text-[9px] font-medium capitalize text-brand-navy">
            {listing.condition}
          </span>
        )}
        {listing.has_parking && <span className="rounded bg-teal-50 px-1 py-0.5 text-[9px] text-teal-600">P</span>}
        {listing.has_elevator && <span className="rounded bg-teal-50 px-1 py-0.5 text-[9px] text-teal-600">Elv</span>}
        {listing.has_balcony && <span className="rounded bg-teal-50 px-1 py-0.5 text-[9px] text-teal-600">Bal</span>}
        {listing.has_ac && <span className="rounded bg-teal-50 px-1 py-0.5 text-[9px] text-teal-600">AC</span>}
        {listing.has_mamad && <span className="rounded bg-teal-50 px-1 py-0.5 text-[9px] text-teal-600">Mamad</span>}
        {listing.is_pet_friendly && <span className="rounded bg-teal-50 px-1 py-0.5 text-[9px] text-teal-600">Pet</span>}
        {listing.furniture === "full" && <span className="rounded bg-teal-50 px-1 py-0.5 text-[9px] text-teal-600">Furn</span>}
      </div>

      {/* Expanded when selected */}
      {isSelected && (
        <div className="mt-2 flex gap-2 border-t border-gray-100 pt-2">
          <a
            href={listing.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-md bg-brand-teal px-3 py-1.5 text-center text-xs font-semibold text-white hover:bg-brand-teal-light"
          >
            View on {SOURCE_LABELS[listing.source as keyof typeof SOURCE_LABELS] ?? listing.source}
          </a>
          <Link
            href={`/neighborhood/${listing.neighborhood}`}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Area Info
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Closed Market Insights Panel ──
function MarketInsightsPanel({
  neighborhoodSlug,
  rooms,
}: {
  neighborhoodSlug?: string;
  rooms: number[];
}) {
  const roomTarget = rooms.length === 1 ? rooms[0] : 2;
  const citySummary = useMemo(() => getCityClosedMarketSummary(roomTarget), [roomTarget]);
  const neighborhoodData = useMemo(
    () => neighborhoodSlug ? getClosedMarketData(neighborhoodSlug, roomTarget) : [],
    [neighborhoodSlug, roomTarget]
  );
  const nhoodEntry = neighborhoodData[0] ?? null;

  return (
    <div className="space-y-3 p-3">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">What People Actually Pay</h3>
        <p className="mt-0.5 text-[11px] text-gray-500">
          Listed prices vs. closed deals — what tenants negotiate down to. Based on CBS surveys, community data, and lease renewal records.
        </p>
      </div>

      {/* City-wide summary */}
      <div className="rounded-lg border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Tel Aviv &middot; {roomTarget}-Room Apartments</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <div>
            <p className="text-[10px] text-gray-400">Listed (Asking)</p>
            <p className="text-sm font-bold text-gray-900">{formatRent(citySummary.avg_asking)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">Actual Paid</p>
            <p className="text-sm font-bold text-green-600">{formatRent(citySummary.avg_actual)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">Renewal Price</p>
            <p className="text-sm font-bold text-brand-teal">{formatRent(citySummary.avg_renewal)}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[10px]">
          <span className="rounded bg-green-50 px-1.5 py-0.5 font-medium text-green-700">
            Asking → Actual: -{citySummary.gap_percent}%
          </span>
          <span className="text-gray-400">
            ~{citySummary.total_estimated_households.toLocaleString()} households
          </span>
        </div>
      </div>

      {/* Neighborhood-specific */}
      {nhoodEntry && (
        <div className="rounded-lg border border-brand-teal/20 bg-brand-teal/5 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-brand-teal">
            {NEIGHBORHOODS.find((n) => n.slug === neighborhoodSlug)?.name_en} &middot; {roomTarget} Rooms
          </p>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Open market (asking)</span>
              <span className="text-xs font-semibold text-gray-900">{formatRent(nhoodEntry.avg_asking_rent)}/mo</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Actual closed deals</span>
              <span className="text-xs font-semibold text-green-600">{formatRent(nhoodEntry.avg_actual_rent)}/mo</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Renewal tenants</span>
              <span className="text-xs font-semibold text-brand-teal">{formatRent(nhoodEntry.avg_renewal_rent)}/mo</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">New tenants (CBS)</span>
              <span className="text-xs font-semibold text-gray-700">{formatRent(nhoodEntry.avg_new_tenant_rent)}/mo</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-1.5">
              <span className="text-xs text-gray-500">Renewal rate</span>
              <span className="text-xs font-medium text-gray-600">{nhoodEntry.renewal_rate}% of tenants renew</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Confidence</span>
              <span className={`rounded px-1 text-[10px] font-medium ${
                nhoodEntry.confidence === "high" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
              }`}>{nhoodEntry.confidence}</span>
            </div>
          </div>
        </div>
      )}

      {!nhoodEntry && !neighborhoodSlug && (
        <p className="rounded-lg border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400">
          Select a neighborhood to see closed market data for that area.
        </p>
      )}

      {/* Insight callout */}
      <div className="rounded-lg bg-amber-50 p-2.5">
        <p className="text-[11px] font-medium text-amber-800">Why this matters</p>
        <p className="mt-0.5 text-[10px] text-amber-700">
          Only ~15-20% of apartments are listed at any time. The other 80% are occupied tenants renewing leases —
          paying on average 3-6% less than listed prices. Use this data to negotiate: you shouldn&apos;t pay asking price.
        </p>
      </div>
    </div>
  );
}

// ── Score bar component ──
function ScoreBar({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-[10px] text-gray-500">{label}</span>
      <div className="flex-1 rounded-full bg-gray-100 h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-6 text-right text-[10px] font-medium text-gray-600">{value}</span>
    </div>
  );
}

// ── Decision Factors Panel ──
function DecisionFactorsPanel({ neighborhoodSlug }: { neighborhoodSlug?: string }) {
  const factors = useMemo(
    () => neighborhoodSlug ? DECISION_FACTORS.find((d) => d.neighborhood === neighborhoodSlug) ?? null : null,
    [neighborhoodSlug]
  );

  if (!factors && !neighborhoodSlug) {
    return (
      <div className="p-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Stay or Go Factors</h3>
        <p className="mt-1 text-[11px] text-gray-500">
          Select a neighborhood filter to see livability scores, costs, and factors that influence your decision to renew or move.
        </p>
        {/* City-wide overview */}
        <div className="mt-3 space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Quick Cost Comparison</p>
          <div className="grid grid-cols-2 gap-2">
            {DECISION_FACTORS.filter((d) => ["florentin", "old-north", "lev-hair", "ramat-aviv", "jaffa", "neve-tzedek", "bavli", "shapira"].includes(d.neighborhood)).map((d) => {
              const nhood = NEIGHBORHOODS.find((n) => n.slug === d.neighborhood);
              return (
                <div key={d.neighborhood} className="rounded-md border border-gray-100 p-2">
                  <p className="text-[10px] font-medium text-gray-700">{nhood?.name_en}</p>
                  <div className="mt-0.5 flex items-baseline gap-1">
                    <span className="text-xs font-bold text-gray-900">{formatRent(d.arnona_monthly_70sqm)}</span>
                    <span className="text-[9px] text-gray-400">arnona</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[10px] text-gray-600">{d.avg_commute_minutes}min</span>
                    <span className="text-[9px] text-gray-400">commute</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (!factors) {
    return (
      <div className="p-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Stay or Go Factors</h3>
        <p className="mt-2 text-xs text-gray-400">No data available for this neighborhood.</p>
      </div>
    );
  }

  const nhood = NEIGHBORHOODS.find((n) => n.slug === neighborhoodSlug);

  return (
    <div className="space-y-3 p-3">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          {nhood?.name_en} — Decision Factors
        </h3>
        <p className="mt-1 text-[11px] text-gray-600 leading-relaxed">{factors.character}</p>
      </div>

      {/* Monthly costs */}
      <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Monthly Costs (beyond rent)</p>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Arnona (70m&sup2;)</span>
            <span className="text-xs font-semibold text-gray-900">{formatRent(factors.arnona_monthly_70sqm)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Utilities avg</span>
            <span className="text-xs font-semibold text-gray-900">{formatRent(factors.avg_utilities_monthly)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Total extra/mo</span>
            <span className="text-xs font-bold text-brand-teal">{formatRent(factors.arnona_monthly_70sqm + factors.avg_utilities_monthly)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Commute</span>
            <span className="text-xs font-semibold text-gray-900">{factors.avg_commute_minutes} min</span>
          </div>
        </div>
      </div>

      {/* Livability scores */}
      <div className="rounded-lg border border-gray-100 p-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Livability Scores</p>
        <div className="mt-2 space-y-1.5">
          <ScoreBar value={factors.walkability} label="Walkable" color="bg-green-400" />
          <ScoreBar value={factors.transit_score} label="Transit" color="bg-blue-400" />
          <ScoreBar value={factors.safety_score} label="Safety" color="bg-emerald-400" />
          <ScoreBar value={factors.green_space} label="Green" color="bg-lime-400" />
          <ScoreBar value={factors.nightlife_dining} label="Nightlife" color="bg-purple-400" />
          <ScoreBar value={factors.family_score} label="Family" color="bg-pink-400" />
        </div>
      </div>

      {/* Moving cost analysis */}
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-orange-600">Moving Cost Analysis</p>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-orange-800">Est. moving cost</span>
            <span className="text-xs font-bold text-orange-900">{formatRent(factors.moving_cost_estimate)}</span>
          </div>
          <p className="text-[10px] text-orange-700">
            Includes: movers, 2-month deposit, agent fee, connection fees
          </p>
          <div className="flex items-center justify-between border-t border-orange-200 pt-1">
            <span className="text-xs text-orange-800">Landlord vacancy cost</span>
            <span className="text-xs font-bold text-orange-900">{formatRent(factors.vacancy_cost_monthly)}/mo</span>
          </div>
          <p className="text-[10px] text-orange-700">
            What your landlord loses per empty month — use this in negotiation.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Filter Panel ──
function FilterPanel({
  filters,
  setFilters,
  totalCount,
  filteredCount,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  totalCount: number;
  filteredCount: number;
}) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="space-y-3">
      {/* Price Range */}
      <div>
        <label className="mb-1 block text-[10px] font-medium text-gray-400 uppercase tracking-wider">Price Range</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin || ""}
            onChange={(e) => setFilters({ ...filters, priceMin: e.target.value ? parseInt(e.target.value) : undefined })}
            className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20"
          />
          <span className="text-gray-300">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax || ""}
            onChange={(e) => setFilters({ ...filters, priceMax: e.target.value ? parseInt(e.target.value) : undefined })}
            className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20"
          />
        </div>
      </div>

      {/* Rooms */}
      <div>
        <label className="mb-1 block text-[10px] font-medium text-gray-400 uppercase tracking-wider">Rooms</label>
        <div className="flex flex-wrap gap-1">
          {ROOM_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => {
                const rooms = new Set(filters.rooms);
                if (rooms.has(r)) rooms.delete(r); else rooms.add(r);
                setFilters({ ...filters, rooms: Array.from(rooms) });
              }}
              className={`rounded-md border px-2 py-0.5 text-xs font-medium transition ${
                filters.rooms.includes(r)
                  ? "border-brand-teal bg-brand-teal text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Neighborhoods */}
      <div>
        <label className="mb-1 block text-[10px] font-medium text-gray-400 uppercase tracking-wider">Neighborhood</label>
        <select
          value={filters.neighborhood || ""}
          onChange={(e) => setFilters({ ...filters, neighborhood: e.target.value || undefined })}
          className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20"
        >
          <option value="">All Neighborhoods</option>
          {NEIGHBORHOODS.filter((n) => n.listing_count > 0).sort((a, b) => a.name_en.localeCompare(b.name_en)).map((n) => (
            <option key={n.slug} value={n.slug}>
              {n.name_en} ({n.listing_count})
            </option>
          ))}
        </select>
      </div>

      {/* Amenities */}
      <div>
        <label className="mb-1 block text-[10px] font-medium text-gray-400 uppercase tracking-wider">Amenities</label>
        <div className="flex flex-wrap gap-1">
          {([
            { key: "parking", label: "Parking" },
            { key: "elevator", label: "Elevator" },
            { key: "balcony", label: "Balcony" },
            { key: "ac", label: "A/C" },
            { key: "mamad", label: "Mamad" },
            { key: "petFriendly", label: "Pet OK" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => {
                const amenities = new Set(filters.amenities);
                if (amenities.has(key)) amenities.delete(key); else amenities.add(key);
                setFilters({ ...filters, amenities: Array.from(amenities) });
              }}
              className={`rounded-md border px-2 py-0.5 text-xs font-medium transition ${
                filters.amenities.includes(key)
                  ? "border-brand-teal bg-brand-teal text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* More filters */}
      {showMore && (
        <>
          {/* Source */}
          <div>
            <label className="mb-1 block text-[10px] font-medium text-gray-400 uppercase tracking-wider">Source</label>
            <div className="flex flex-wrap gap-1">
              {SOURCE_OPTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    const sources = new Set(filters.sources);
                    if (sources.has(s.id)) sources.delete(s.id); else sources.add(s.id);
                    setFilters({ ...filters, sources: Array.from(sources) });
                  }}
                  className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium transition ${
                    filters.sources.includes(s.id)
                      ? "border-brand-teal bg-brand-teal text-white"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="mb-1 block text-[10px] font-medium text-gray-400 uppercase tracking-wider">Condition</label>
            <div className="flex flex-wrap gap-1">
              {CONDITION_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    const conds = new Set(filters.conditions);
                    if (conds.has(c)) conds.delete(c); else conds.add(c);
                    setFilters({ ...filters, conditions: Array.from(conds) });
                  }}
                  className={`rounded-md border px-2 py-0.5 text-xs font-medium capitalize transition ${
                    filters.conditions.includes(c)
                      ? "border-brand-teal bg-brand-teal text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {c.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Sqm Range */}
          <div>
            <label className="mb-1 block text-[10px] font-medium text-gray-400 uppercase tracking-wider">Size (sqm)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.sqmMin || ""}
                onChange={(e) => setFilters({ ...filters, sqmMin: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20"
              />
              <span className="text-gray-300">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.sqmMax || ""}
                onChange={(e) => setFilters({ ...filters, sqmMax: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20"
              />
            </div>
          </div>

          {/* Furnished */}
          <div>
            <label className="mb-1 block text-[10px] font-medium text-gray-400 uppercase tracking-wider">Furniture</label>
            <select
              value={filters.furniture || ""}
              onChange={(e) => setFilters({ ...filters, furniture: e.target.value || undefined })}
              className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20"
            >
              <option value="">Any</option>
              <option value="full">Fully Furnished</option>
              <option value="partial">Partially Furnished</option>
              <option value="none">Unfurnished</option>
            </select>
          </div>
        </>
      )}

      <button
        onClick={() => setShowMore(!showMore)}
        className="w-full text-center text-xs font-medium text-brand-teal hover:underline"
      >
        {showMore ? "Fewer filters" : "More filters..."}
      </button>

      {/* Result count + clear */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-2">
        <p className="text-xs text-gray-500">
          <span className="font-semibold text-gray-900">{filteredCount.toLocaleString()}</span> of {totalCount.toLocaleString()}
        </p>
        <button
          onClick={() =>
            setFilters({
              priceMin: undefined,
              priceMax: undefined,
              rooms: [],
              neighborhood: undefined,
              amenities: [],
              sources: [],
              conditions: [],
              sqmMin: undefined,
              sqmMax: undefined,
              furniture: undefined,
            })
          }
          className="text-xs text-gray-400 hover:text-brand-teal"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}

// ── Filter types ──
interface Filters {
  priceMin?: number;
  priceMax?: number;
  rooms: number[];
  neighborhood?: string;
  amenities: string[];
  sources: string[];
  conditions: string[];
  sqmMin?: number;
  sqmMax?: number;
  furniture?: string;
}

function applyFilters(listings: RentalListing[], filters: Filters): RentalListing[] {
  return listings.filter((l) => {
    if (filters.priceMin && l.monthly_rent < filters.priceMin) return false;
    if (filters.priceMax && l.monthly_rent > filters.priceMax) return false;
    if (filters.rooms.length > 0 && !filters.rooms.includes(l.rooms)) return false;
    if (filters.neighborhood && l.neighborhood !== filters.neighborhood) return false;
    if (filters.sqmMin && l.sqm < filters.sqmMin) return false;
    if (filters.sqmMax && l.sqm > filters.sqmMax) return false;
    if (filters.furniture && l.furniture !== filters.furniture) return false;
    if (filters.conditions.length > 0 && l.condition && !filters.conditions.includes(l.condition)) return false;
    if (filters.sources.length > 0 && !filters.sources.includes(l.source)) return false;

    // Amenities
    for (const a of filters.amenities) {
      if (a === "parking" && !l.has_parking) return false;
      if (a === "elevator" && !l.has_elevator) return false;
      if (a === "balcony" && !l.has_balcony) return false;
      if (a === "ac" && !l.has_ac) return false;
      if (a === "mamad" && !l.has_mamad) return false;
      if (a === "petFriendly" && !l.is_pet_friendly) return false;
    }

    return true;
  });
}

function sortListings(listings: RentalListing[], sortBy: string): RentalListing[] {
  const sorted = [...listings];
  switch (sortBy) {
    case "price_asc": return sorted.sort((a, b) => a.monthly_rent - b.monthly_rent);
    case "price_desc": return sorted.sort((a, b) => b.monthly_rent - a.monthly_rent);
    case "newest": return sorted.sort((a, b) => a.days_on_market - b.days_on_market);
    case "sqm_desc": return sorted.sort((a, b) => b.sqm - a.sqm);
    case "quality": return sorted.sort((a, b) => b.quality_score - a.quality_score);
    case "value": return sorted.sort((a, b) => a.price_per_sqm - b.price_per_sqm);
    default: return sorted;
  }
}

// ── Main Page ──
export default function ExplorePage() {
  const [filters, setFilters] = useState<Filters>({
    rooms: [],
    amenities: [],
    sources: [],
    conditions: [],
  });
  const [sortBy, setSortBy] = useState("price_asc");
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<SidebarTab>("listings");
  const PAGE_SIZE = 50;

  const filtered = useMemo(() => applyFilters(LISTINGS, filters), [filters]);
  const sorted = useMemo(() => sortListings(filtered, sortBy), [filtered, sortBy]);
  const paginated = useMemo(() => sorted.slice(0, page * PAGE_SIZE), [sorted, page]);

  const handleSelect = useCallback((id: number | null) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const handleHover = useCallback((id: number | null) => {
    setHoveredId(id);
  }, []);

  // Stats
  const avgPrice = filtered.length > 0
    ? Math.round(filtered.reduce((s, l) => s + l.monthly_rent, 0) / filtered.length)
    : 0;
  const medianPrice = (() => {
    if (filtered.length === 0) return 0;
    const prices = filtered.map((l) => l.monthly_rent).sort((a, b) => a - b);
    const mid = Math.floor(prices.length / 2);
    return prices.length % 2 === 0 ? Math.round((prices[mid - 1] + prices[mid]) / 2) : prices[mid];
  })();

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-1.5">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold text-gray-900">
            Tel Aviv Rentals
          </h1>
          <div className="hidden items-center gap-2 text-[11px] text-gray-500 sm:flex">
            <span><span className="font-semibold text-gray-700">{filtered.length.toLocaleString()}</span> listings</span>
            <span className="text-gray-300">|</span>
            <span>Avg {formatRent(avgPrice)}</span>
            <span className="text-gray-300">|</span>
            <span>Med {formatRent(medianPrice)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PriceLegend />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`ml-2 rounded-md border px-2.5 py-1 text-xs font-medium transition sm:hidden ${
              showFilters ? "border-brand-teal bg-brand-teal text-white" : "border-gray-200 text-gray-600"
            }`}
          >
            Filters
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs outline-none focus:border-brand-teal"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Split layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Tabs + Content */}
        <div className={`flex flex-col border-r border-gray-200 bg-gray-50 ${showFilters ? "w-full sm:w-[400px]" : "w-full sm:w-[380px]"}`}>
          {/* Tab bar */}
          <div className="flex border-b border-gray-200 bg-white">
            {([
              { id: "listings" as const, label: "Listings" },
              { id: "market" as const, label: "Market Data" },
              { id: "factors" as const, label: "Decision Factors" },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 text-xs font-medium transition ${
                  activeTab === tab.id
                    ? "border-b-2 border-brand-teal text-brand-teal"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filters (shown above listings tab) */}
          {showFilters && activeTab === "listings" && (
            <div className="border-b border-gray-200 bg-white p-3">
              <FilterPanel
                filters={filters}
                setFilters={(f) => { setFilters(f); setPage(1); }}
                totalCount={LISTINGS.length}
                filteredCount={filtered.length}
              />
            </div>
          )}

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "listings" && (
              <div className="p-2">
                <div className="space-y-1">
                  {paginated.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      isHovered={hoveredId === listing.id}
                      isSelected={selectedId === listing.id}
                      onHover={handleHover}
                      onSelect={() => handleSelect(listing.id)}
                    />
                  ))}
                </div>

                {/* Load more */}
                {paginated.length < sorted.length && (
                  <div className="py-3 text-center">
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-md bg-brand-teal px-5 py-1.5 text-xs font-semibold text-white hover:bg-brand-teal-light"
                    >
                      Load More ({sorted.length - paginated.length} remaining)
                    </button>
                  </div>
                )}

                {filtered.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-sm text-gray-400">No listings match your filters.</p>
                    <button
                      onClick={() => setFilters({ rooms: [], amenities: [], sources: [], conditions: [] })}
                      className="mt-2 text-sm text-brand-teal hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "market" && (
              <MarketInsightsPanel
                neighborhoodSlug={filters.neighborhood}
                rooms={filters.rooms}
              />
            )}

            {activeTab === "factors" && (
              <DecisionFactorsPanel neighborhoodSlug={filters.neighborhood} />
            )}
          </div>
        </div>

        {/* Right: Map */}
        <div className="hidden flex-1 sm:block">
          <ExploreMap
            listings={filtered}
            hoveredId={hoveredId}
            selectedId={selectedId}
            onHover={handleHover}
            onSelect={handleSelect}
          />
        </div>
      </div>
    </div>
  );
}
