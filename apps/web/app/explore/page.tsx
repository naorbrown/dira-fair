"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { LISTINGS, NEIGHBORHOODS, SOURCE_LABELS } from "@/lib/data";
import { formatRent } from "@/lib/format";
import type { RentalListing } from "@/lib/types";
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

// ── Source badge colors ──
function sourceBadge(source: string): string {
  switch (source) {
    case "yad2": return "bg-blue-100 text-blue-700";
    case "homeless": return "bg-purple-100 text-purple-700";
    case "fbmarket": return "bg-indigo-100 text-indigo-700";
    case "komo": return "bg-cyan-100 text-cyan-700";
    case "winwin": return "bg-teal-100 text-teal-700";
    case "onmap": return "bg-emerald-100 text-emerald-700";
    case "agora": return "bg-pink-100 text-pink-700";
    case "madlan": return "bg-amber-100 text-amber-700";
    case "private": return "bg-gray-100 text-gray-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

// ── Quality pill ──
function QualityPill({ label, active }: { label: string; active: boolean }) {
  if (!active) return null;
  return (
    <span className="rounded bg-brand-teal/10 px-1.5 py-0.5 text-[10px] font-medium text-brand-teal">
      {label}
    </span>
  );
}

// ── Listing Card ──
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

  // Scroll into view when hovered from map
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
      className={`cursor-pointer rounded-xl border p-3 transition-all ${
        isSelected
          ? "border-brand-teal bg-brand-teal/5 shadow-md ring-1 ring-brand-teal/20"
          : isHovered
            ? "border-brand-teal/50 bg-white shadow-sm"
            : "border-gray-150 bg-white hover:border-gray-200 hover:shadow-sm"
      }`}
    >
      {/* Header: Price + Source */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-bold text-gray-900">{formatRent(listing.monthly_rent)}<span className="text-xs font-normal text-gray-400">/mo</span></p>
          <p className="text-sm text-gray-700">{listing.address}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${sourceBadge(listing.source)}`}>
            {SOURCE_LABELS[listing.source as keyof typeof SOURCE_LABELS] ?? listing.source}
          </span>
          <span className={`text-[10px] font-medium ${listing.quality_score >= 70 ? "text-green-600" : listing.quality_score >= 50 ? "text-amber-600" : "text-gray-400"}`}>
            {listing.quality_score}/100
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
        <span className="font-medium text-gray-700">{listing.rooms} rooms</span>
        <span>{listing.sqm} m&sup2;</span>
        {listing.floor != null && <span>Floor {listing.floor}{listing.total_floors ? `/${listing.total_floors}` : ""}</span>}
        <span>{listing.days_on_market}d listed</span>
      </div>

      {/* Neighborhood + per-sqm */}
      <div className="mt-1.5 flex items-center justify-between text-xs">
        <span className="text-gray-500">{neighborhood?.name_en ?? listing.neighborhood}</span>
        <span className="font-medium text-gray-600">{formatRent(Math.round(listing.monthly_rent / listing.sqm))}/m&sup2;</span>
      </div>

      {/* Feature badges */}
      <div className="mt-2 flex flex-wrap gap-1">
        {listing.condition && listing.condition !== "fair" && listing.condition !== "needs_work" && (
          <span className="rounded bg-brand-navy/10 px-1.5 py-0.5 text-[10px] font-medium capitalize text-brand-navy">
            {listing.condition}
          </span>
        )}
        <QualityPill label="Parking" active={listing.has_parking} />
        <QualityPill label="Elevator" active={listing.has_elevator} />
        <QualityPill label="Balcony" active={listing.has_balcony} />
        <QualityPill label="A/C" active={listing.has_ac} />
        <QualityPill label="Mamad" active={listing.has_mamad} />
        {listing.is_pet_friendly && <QualityPill label="Pet OK" active={true} />}
        {listing.furniture === "full" && <QualityPill label="Furnished" active={true} />}
      </div>

      {/* View link */}
      {isSelected && (
        <div className="mt-3 flex gap-2">
          <a
            href={listing.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-lg bg-brand-teal px-3 py-1.5 text-center text-xs font-semibold text-white hover:bg-brand-teal-light"
          >
            View on {SOURCE_LABELS[listing.source as keyof typeof SOURCE_LABELS] ?? listing.source}
          </a>
          <Link
            href={`/neighborhood/${listing.neighborhood}`}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            Area Info
          </Link>
        </div>
      )}
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
        <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wider">Price Range</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin || ""}
            onChange={(e) => setFilters({ ...filters, priceMin: e.target.value ? parseInt(e.target.value) : undefined })}
            className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax || ""}
            onChange={(e) => setFilters({ ...filters, priceMax: e.target.value ? parseInt(e.target.value) : undefined })}
            className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20"
          />
        </div>
      </div>

      {/* Rooms */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wider">Rooms</label>
        <div className="flex flex-wrap gap-1">
          {ROOM_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => {
                const rooms = new Set(filters.rooms);
                if (rooms.has(r)) rooms.delete(r); else rooms.add(r);
                setFilters({ ...filters, rooms: Array.from(rooms) });
              }}
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
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
        <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wider">Neighborhood</label>
        <select
          value={filters.neighborhood || ""}
          onChange={(e) => setFilters({ ...filters, neighborhood: e.target.value || undefined })}
          className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20"
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
        <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wider">Amenities</label>
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
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
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
            <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wider">Source</label>
            <div className="flex flex-wrap gap-1">
              {SOURCE_OPTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    const sources = new Set(filters.sources);
                    if (sources.has(s.id)) sources.delete(s.id); else sources.add(s.id);
                    setFilters({ ...filters, sources: Array.from(sources) });
                  }}
                  className={`rounded-lg border px-2 py-1 text-[10px] font-medium transition ${
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
            <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</label>
            <div className="flex flex-wrap gap-1">
              {CONDITION_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    const conds = new Set(filters.conditions);
                    if (conds.has(c)) conds.delete(c); else conds.add(c);
                    setFilters({ ...filters, conditions: Array.from(conds) });
                  }}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-medium capitalize transition ${
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
            <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wider">Size (sqm)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.sqmMin || ""}
                onChange={(e) => setFilters({ ...filters, sqmMin: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.sqmMax || ""}
                onChange={(e) => setFilters({ ...filters, sqmMax: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20"
              />
            </div>
          </div>

          {/* Furnished */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wider">Furniture</label>
            <select
              value={filters.furniture || ""}
              onChange={(e) => setFilters({ ...filters, furniture: e.target.value || undefined })}
              className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/20"
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
        {showMore ? "Show fewer filters" : "More filters..."}
      </button>

      {/* Result count + clear */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-2">
        <p className="text-xs text-gray-500">
          <span className="font-semibold text-gray-900">{filteredCount.toLocaleString()}</span> of {totalCount.toLocaleString()} listings
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
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-bold text-gray-900 sm:text-base">
            Tel Aviv Rentals
          </h1>
          <div className="hidden items-center gap-3 text-xs text-gray-500 sm:flex">
            <span><span className="font-semibold text-gray-700">{filtered.length.toLocaleString()}</span> listings</span>
            <span className="text-gray-300">|</span>
            <span>Avg {formatRent(avgPrice)}</span>
            <span className="text-gray-300">|</span>
            <span>Median {formatRent(medianPrice)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PriceLegend />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`ml-2 rounded-lg border px-3 py-1 text-xs font-medium transition sm:hidden ${
              showFilters ? "border-brand-teal bg-brand-teal text-white" : "border-gray-200 text-gray-600"
            }`}
          >
            Filters
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs outline-none focus:border-brand-teal"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Split layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Filters + Listing cards */}
        <div className={`flex flex-col border-r border-gray-200 bg-gray-50 ${showFilters ? "w-full sm:w-[420px]" : "w-full sm:w-[360px]"}`}>
          {/* Filters */}
          {showFilters && (
            <div className="border-b border-gray-200 bg-white p-3">
              <FilterPanel
                filters={filters}
                setFilters={(f) => { setFilters(f); setPage(1); }}
                totalCount={LISTINGS.length}
                filteredCount={filtered.length}
              />
            </div>
          )}

          {/* Listing cards */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-2">
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
              <div className="py-4 text-center">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg bg-brand-teal px-6 py-2 text-sm font-semibold text-white hover:bg-brand-teal-light"
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
