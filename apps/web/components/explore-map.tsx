"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, useMapEvents } from "react-leaflet";
import { formatRent } from "@/lib/format";
import { useEffect, useCallback, useRef } from "react";
import type { RentalListing } from "@/lib/types";

// ── Price color scale ──
function priceColor(rent: number): string {
  if (rent <= 5000) return "#16a34a"; // green
  if (rent <= 7000) return "#65a30d"; // lime
  if (rent <= 9000) return "#ca8a04"; // amber
  if (rent <= 12000) return "#ea580c"; // orange
  return "#dc2626"; // red
}

function priceColorBg(rent: number): string {
  if (rent <= 5000) return "bg-green-500";
  if (rent <= 7000) return "bg-lime-500";
  if (rent <= 9000) return "bg-amber-500";
  if (rent <= 12000) return "bg-orange-500";
  return "bg-red-500";
}

// ── Map controller for external interactions ──
function MapController({
  listings,
  hoveredId,
  selectedId,
  onBoundsChange,
}: {
  listings: { lat: number; lng: number }[];
  hoveredId: number | null;
  selectedId: number | null;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
}) {
  const map = useMap();
  const isInitializedRef = useRef(false);

  // Fit bounds on initial load
  useEffect(() => {
    if (isInitializedRef.current || listings.length === 0) return;
    isInitializedRef.current = true;

    const lats = listings.map((l) => l.lat);
    const lngs = listings.map((l) => l.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    map.fitBounds(
      [[minLat - 0.003, minLng - 0.003], [maxLat + 0.003, maxLng + 0.003]],
      { padding: [30, 30], maxZoom: 15 }
    );
  }, [listings, map]);

  // Report bounds changes for virtual filtering
  useMapEvents({
    moveend: () => {
      if (!onBoundsChange) return;
      const b = map.getBounds();
      onBoundsChange({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
    },
    zoomend: () => {
      if (!onBoundsChange) return;
      const b = map.getBounds();
      onBoundsChange({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
    },
  });

  return null;
}

// ── Source badge colors ──
function sourceBadgeColor(source: string): string {
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

export interface ExploreMapProps {
  listings: RentalListing[];
  hoveredId: number | null;
  selectedId: number | null;
  onHover: (id: number | null) => void;
  onSelect: (id: number | null) => void;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
}

export default function ExploreMap({
  listings,
  hoveredId,
  selectedId,
  onHover,
  onSelect,
  onBoundsChange,
}: ExploreMapProps) {
  // Cluster nearby listings when many are visible
  // For performance, we render individual markers up to ~500 and simplify beyond
  const visibleListings = listings.slice(0, 500);

  return (
    <MapContainer
      center={[32.075, 34.78]}
      zoom={13}
      scrollWheelZoom={true}
      zoomControl={false}
      className="h-full w-full"
      style={{ minHeight: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <MapController
        listings={listings}
        hoveredId={hoveredId}
        selectedId={selectedId}
        onBoundsChange={onBoundsChange}
      />

      {visibleListings.map((listing) => {
        const isHovered = listing.id === hoveredId;
        const isSelected = listing.id === selectedId;
        const color = priceColor(listing.monthly_rent);
        const active = isHovered || isSelected;

        return (
          <CircleMarker
            key={listing.id}
            center={[listing.lat, listing.lng]}
            radius={active ? 10 : 6}
            pathOptions={{
              color: active ? "#1e293b" : "#fff",
              fillColor: color,
              fillOpacity: active ? 1 : 0.8,
              weight: active ? 2.5 : 1.5,
            }}
            eventHandlers={{
              click: () => onSelect(listing.id === selectedId ? null : listing.id),
              mouseover: () => onHover(listing.id),
              mouseout: () => onHover(null),
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
              <div className="min-w-[160px] p-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold">{formatRent(listing.monthly_rent)}/mo</span>
                  <span className={`rounded px-1 py-0.5 text-[10px] font-medium ${sourceBadgeColor(listing.source)}`}>
                    {listing.source}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-600">{listing.address}</p>
                <p className="text-xs text-gray-500">
                  {listing.rooms}r &middot; {listing.sqm}m&sup2;
                  {listing.floor ? ` &middot; Floor ${listing.floor}` : ""}
                </p>
                <div className="mt-1 flex gap-1">
                  {listing.has_elevator && <span className="rounded bg-gray-100 px-1 text-[9px]">Elevator</span>}
                  {listing.has_parking && <span className="rounded bg-gray-100 px-1 text-[9px]">Parking</span>}
                  {listing.has_balcony && <span className="rounded bg-gray-100 px-1 text-[9px]">Balcony</span>}
                  {listing.has_ac && <span className="rounded bg-gray-100 px-1 text-[9px]">A/C</span>}
                  {listing.has_mamad && <span className="rounded bg-gray-100 px-1 text-[9px]">Mamad</span>}
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

// ── Price Legend ──
export function PriceLegend() {
  const bands = [
    { label: "< 5K", color: "bg-green-500" },
    { label: "5-7K", color: "bg-lime-500" },
    { label: "7-9K", color: "bg-amber-500" },
    { label: "9-12K", color: "bg-orange-500" },
    { label: "> 12K", color: "bg-red-500" },
  ];
  return (
    <div className="flex items-center gap-2 text-[10px] text-gray-500">
      {bands.map((b) => (
        <div key={b.label} className="flex items-center gap-0.5">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${b.color}`} />
          <span>{b.label}</span>
        </div>
      ))}
    </div>
  );
}
