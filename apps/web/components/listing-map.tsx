"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip, ZoomControl, useMap } from "react-leaflet";
import { formatRent } from "@/lib/format";
import { useEffect } from "react";

interface MapListing {
  address: string;
  rooms: number;
  sqm: number;
  monthly_rent: number;
  price_per_sqm: number;
  lat: number;
  lng: number;
  source_url: string;
  neighborhood?: string;
}

interface ListingMapProps {
  center: [number, number];
  comparables: MapListing[];
  userRent: number;
  hoveredIndex?: number;
}

function priceColor(rent: number): string {
  if (rent <= 5000) return "#16a34a";
  if (rent <= 7000) return "#65a30d";
  if (rent <= 9000) return "#ca8a04";
  if (rent <= 12000) return "#ea580c";
  return "#dc2626";
}

function FitBounds({
  comparables,
  center,
}: {
  comparables: { lat: number; lng: number }[];
  center: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    if (comparables.length === 0) {
      map.setView(center, 14);
      return;
    }
    const lats = [center[0], ...comparables.map((c) => c.lat)];
    const lngs = [center[1], ...comparables.map((c) => c.lng)];
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    map.fitBounds(
      [
        [minLat - 0.005, minLng - 0.005],
        [maxLat + 0.005, maxLng + 0.005],
      ],
      { padding: [30, 30], maxZoom: 15 }
    );
  }, [comparables, center, map]);

  return null;
}

export default function ListingMap({
  center,
  comparables,
  userRent,
  hoveredIndex = -1,
}: ListingMapProps) {
  return (
    <div role="region" aria-label="Map showing comparable rental listings">
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        zoomControl={false}
        className="h-full w-full rounded-xl"
        style={{ minHeight: 400 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="bottomright" />
        <FitBounds comparables={comparables} center={center} />

        {comparables.map((comp, i) => {
          const isHovered = i === hoveredIndex;
          const color = priceColor(comp.monthly_rent);
          return (
            <CircleMarker
              key={i}
              center={[comp.lat, comp.lng]}
              radius={isHovered ? 11 : 7}
              pathOptions={{
                color: isHovered ? "#1e293b" : "#fff",
                fillColor: color,
                fillOpacity: isHovered ? 1 : 0.85,
                weight: isHovered ? 2.5 : 1.5,
              }}
              eventHandlers={{
                click: () => {
                  window.open(comp.source_url, "_blank", "noopener,noreferrer");
                },
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -10]}
                opacity={0.95}
              >
                <div className="min-w-[160px]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold">{formatRent(comp.monthly_rent)}/mo</span>
                    {comp.monthly_rent < userRent ? (
                      <span className="text-[10px] font-semibold text-green-600">
                        {formatRent(userRent - comp.monthly_rent)} less
                      </span>
                    ) : comp.monthly_rent > userRent ? (
                      <span className="text-[10px] font-semibold text-red-600">
                        {formatRent(comp.monthly_rent - userRent)} more
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400">Same</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-600">{comp.address}</p>
                  <p className="text-[10px] text-gray-500">
                    {comp.rooms}r &middot; {comp.sqm}m&sup2;
                    {comp.neighborhood && ` &middot; ${comp.neighborhood}`}
                  </p>
                  <p className="mt-0.5 text-[10px] text-brand-teal">Click to view listing</p>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center gap-3 px-1 text-[11px] text-gray-500" aria-label="Price legend">
        {[
          { label: "< ₪5K", color: "#16a34a" },
          { label: "₪5-7K", color: "#65a30d" },
          { label: "₪7-9K", color: "#ca8a04" },
          { label: "₪9-12K", color: "#ea580c" },
          { label: "> ₪12K", color: "#dc2626" },
        ].map((b) => (
          <span key={b.label} className="flex items-center gap-1">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: b.color }}
            />
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}
