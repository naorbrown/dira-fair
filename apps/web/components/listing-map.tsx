"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
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
}

interface ListingMapProps {
  center: [number, number];
  comparables: MapListing[];
  userRent: number;
  /** Index of the currently hovered listing in the side panel (-1 = none). */
  hoveredIndex?: number;
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
      map.setView(center, 15);
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
        [minLat - 0.002, minLng - 0.002],
        [maxLat + 0.002, maxLng + 0.002],
      ],
      { padding: [20, 20], maxZoom: 16 }
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
    <MapContainer
      center={center}
      zoom={15}
      scrollWheelZoom={false}
      className="h-full w-full rounded-xl"
      style={{ minHeight: 350 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <FitBounds comparables={comparables} center={center} />

      {comparables.map((comp, i) => {
        const diff = userRent - comp.monthly_rent;
        const cheaper = diff > 0;
        const isHovered = i === hoveredIndex;
        return (
          <CircleMarker
            key={i}
            center={[comp.lat, comp.lng]}
            radius={isHovered ? 10 : 7}
            pathOptions={{
              color: isHovered ? "#1e293b" : "#fff",
              fillColor: cheaper ? "#16a34a" : diff === 0 ? "#ca8a04" : "#dc2626",
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
              <div className="min-w-[140px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold">{formatRent(comp.monthly_rent)}/mo</span>
                  {cheaper ? (
                    <span className="text-[10px] font-semibold text-green-600">{formatRent(diff)} less</span>
                  ) : diff < 0 ? (
                    <span className="text-[10px] font-semibold text-red-600">{formatRent(Math.abs(diff))} more</span>
                  ) : (
                    <span className="text-[10px] text-gray-400">Same</span>
                  )}
                </div>
                <p className="mt-0.5 text-[10px] text-gray-600">{comp.address}</p>
                <p className="text-[10px] text-gray-500">
                  {comp.rooms}r &middot; {comp.sqm}m&sup2;
                </p>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
