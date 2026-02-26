"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Neighborhood } from "@/lib/types";
import { fetchNeighborhoods } from "@/lib/api";

/**
 * Israeli room count: In Israel, "rooms" includes the living room (salon).
 * A "3-room apartment" = 2 bedrooms + 1 living room.
 * Half rooms (e.g., 2.5) mean a small room that can serve as a study/storage.
 */
const ROOM_OPTIONS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

const ROOM_LABELS: Record<number, string> = {
  1: "1 room (studio)",
  1.5: "1.5 rooms",
  2: "2 rooms (1 bed + salon)",
  2.5: "2.5 rooms",
  3: "3 rooms (2 bed + salon)",
  3.5: "3.5 rooms",
  4: "4 rooms (3 bed + salon)",
  4.5: "4.5 rooms",
  5: "5 rooms (4 bed + salon)",
};

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
  const [rooms, setRooms] = useState("3");
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
  const isCard = variant === "card";

  return (
    <form
      onSubmit={handleSubmit}
      className={
        isInline
          ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-2"
          : "space-y-4"
      }
    >
      {/* Neighborhood */}
      <div>
        {isCard && (
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Neighborhood
          </label>
        )}
        <select
          value={neighborhoodId}
          onChange={(e) => setNeighborhoodId(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
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
        {isCard && (
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Rooms{" "}
            <span
              className="cursor-help text-xs text-gray-400"
              title="Israeli room count: includes the living room (salon). A 3-room apartment = 2 bedrooms + salon."
            >
              (Israeli count *)
            </span>
          </label>
        )}
        <select
          value={rooms}
          onChange={(e) => setRooms(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
        >
          {ROOM_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {ROOM_LABELS[r]}
            </option>
          ))}
        </select>
      </div>

      {isCard && (
        <div className="grid grid-cols-2 gap-3">
          {/* Sqm */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Size (sqm)
            </label>
            <input
              type="number"
              placeholder="e.g. 60"
              value={sqm}
              onChange={(e) => setSqm(e.target.value)}
              required
              min={10}
              max={500}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
            />
          </div>

          {/* Monthly Rent */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Monthly Rent
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                &#8362;
              </span>
              <input
                type="number"
                placeholder="e.g. 7500"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                required
                min={500}
                max={100000}
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-7 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
              />
            </div>
          </div>
        </div>
      )}

      {isInline && (
        <>
          {/* Sqm (inline) */}
          <div>
            <input
              type="number"
              placeholder="Size (sqm)"
              value={sqm}
              onChange={(e) => setSqm(e.target.value)}
              required
              min={10}
              max={500}
              className="w-full rounded-lg border border-gray-200 bg-white/90 px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 backdrop-blur"
            />
          </div>

          {/* Rent (inline) */}
          <div>
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
                className="w-full rounded-lg border border-gray-200 bg-white/90 py-2.5 pl-7 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 backdrop-blur"
              />
            </div>
          </div>
        </>
      )}

      {/* Room count note (card variant only) */}
      {isCard && (
        <p className="text-xs text-gray-400">
          * In Israel, room count includes the living room (salon). A &ldquo;3-room&rdquo; apartment = 2 bedrooms + salon.
        </p>
      )}

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
