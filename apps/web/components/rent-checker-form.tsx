"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Neighborhood } from "@/lib/types";
import { fetchNeighborhoods } from "@/lib/api";

const ROOM_OPTIONS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

interface RentCheckerFormProps {
  /** Render in a compact inline style (for hero) vs standalone card */
  variant?: "inline" | "card";
}

export default function RentCheckerForm({
  variant = "card",
}: RentCheckerFormProps) {
  const router = useRouter();
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);

  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [rooms, setRooms] = useState("2");
  const [sqm, setSqm] = useState("");
  const [rent, setRent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNeighborhoods()
      .then((data) => {
        setNeighborhoods(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!neighborhoodId || !rooms || !sqm || !rent) return;
    setSubmitting(true);

    const params = new URLSearchParams({
      neighborhood: neighborhoodId,
      rooms,
      sqm,
      rent,
    });
    router.push(`/check?${params.toString()}`);
  }

  const isInline = variant === "inline";

  return (
    <form
      onSubmit={handleSubmit}
      className={
        isInline
          ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-2"
          : "space-y-4 rounded-2xl bg-white p-6 shadow-lg"
      }
    >
      {/* Neighborhood */}
      <div className={isInline ? "" : ""}>
        {!isInline && (
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Neighborhood
          </label>
        )}
        <select
          value={neighborhoodId}
          onChange={(e) => setNeighborhoodId(e.target.value)}
          required
          className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 ${
            isInline ? "bg-white/90 backdrop-blur" : ""
          }`}
        >
          <option value="">
            {loading ? "Loading..." : "Select neighborhood"}
          </option>
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name_en}
            </option>
          ))}
        </select>
      </div>

      {/* Rooms */}
      <div>
        {!isInline && (
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Rooms
          </label>
        )}
        <select
          value={rooms}
          onChange={(e) => setRooms(e.target.value)}
          required
          className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 ${
            isInline ? "bg-white/90 backdrop-blur" : ""
          }`}
        >
          {ROOM_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r} {r === 1 ? "room" : "rooms"}
            </option>
          ))}
        </select>
      </div>

      {/* Sqm */}
      <div>
        {!isInline && (
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Size (sqm)
          </label>
        )}
        <input
          type="number"
          placeholder="Size (sqm)"
          value={sqm}
          onChange={(e) => setSqm(e.target.value)}
          required
          min={10}
          max={500}
          className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 ${
            isInline ? "bg-white/90 backdrop-blur" : ""
          }`}
        />
      </div>

      {/* Monthly Rent */}
      <div>
        {!isInline && (
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Monthly Rent
          </label>
        )}
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            &#8362;
          </span>
          <input
            type="number"
            placeholder="Monthly rent"
            value={rent}
            onChange={(e) => setRent(e.target.value)}
            required
            min={500}
            max={100000}
            className={`w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-7 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 ${
              isInline ? "bg-white/90 backdrop-blur" : ""
            }`}
          />
        </div>
      </div>

      {/* Submit */}
      <div className={isInline ? "flex items-end" : ""}>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-brand-teal px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-teal-light hover:shadow-lg disabled:opacity-60"
        >
          {submitting ? "Checking..." : "Check My Rent"}
        </button>
      </div>
    </form>
  );
}
