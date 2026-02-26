"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { formatRent } from "@/lib/format";
import type { ComparableListing } from "@/lib/types";
import { useEffect } from "react";

interface ListingMapProps {
  center: [number, number];
  comparables: (ComparableListing & { lat: number; lng: number })[];
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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds comparables={comparables} center={center} />

      {comparables.map((comp, i) => {
        const cheaper = comp.monthly_rent < userRent;
        const isHovered = i === hoveredIndex;
        return (
          <CircleMarker
            key={i}
            center={[comp.lat, comp.lng]}
            radius={isHovered ? 10 : 7}
            pathOptions={{
              color: cheaper ? "#16a34a" : "#dc2626",
              fillColor: cheaper ? "#22c55e" : "#ef4444",
              fillOpacity: isHovered ? 1 : 0.8,
              weight: isHovered ? 3 : 2,
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{comp.address}</p>
                <p className="mt-1">
                  <span className="font-bold">{formatRent(comp.monthly_rent)}</span>/mo
                  {" · "}{comp.rooms} rooms · {comp.sqm} sqm
                </p>
                {cheaper && (
                  <p className="mt-1 font-medium text-green-600">
                    {formatRent(userRent - comp.monthly_rent)}/mo cheaper
                  </p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
