"use client";

import { formatRent } from "@/lib/format";

interface PriceDistributionProps {
  distribution: {
    prices: number[];
    user_rent: number;
    min: number;
    max: number;
    median: number;
    p25: number;
    p75: number;
  };
}

function getUserRentColor(userRent: number, median: number, p75: number) {
  if (userRent < median) return { bg: "bg-score-green", text: "text-score-green" };
  if (userRent <= p75) return { bg: "bg-score-yellow", text: "text-score-yellow" };
  return { bg: "bg-score-red", text: "text-score-red" };
}

export default function PriceDistribution({
  distribution,
}: PriceDistributionProps) {
  const { user_rent, min, max, median, p25, p75 } = distribution;
  const range = max - min;

  // Avoid division by zero
  if (range === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-gray-400">
        Not enough price variation to display
      </div>
    );
  }

  /** Convert an absolute price to a percentage position along the strip. */
  const toPercent = (value: number) =>
    Math.min(Math.max(((value - min) / range) * 100, 0), 100);

  const p25Pct = toPercent(p25);
  const p75Pct = toPercent(p75);
  const medianPct = toPercent(median);
  const userPct = toPercent(user_rent);

  const color = getUserRentColor(user_rent, median, p75);

  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          Price Distribution
        </h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${color.text} ${
            user_rent < median
              ? "bg-score-green-bg"
              : user_rent <= p75
                ? "bg-score-yellow-bg"
                : "bg-score-red-bg"
          }`}
        >
          Your rent: {formatRent(user_rent)}
        </span>
      </div>

      {/* Box-plot strip */}
      <div className="relative h-10">
        {/* Full range whisker line (min to max) */}
        <div
          className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-gray-300"
          style={{ left: "0%", right: "0%" }}
        />

        {/* Min whisker cap */}
        <div className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 bg-gray-400" />

        {/* Max whisker cap */}
        <div className="absolute right-0 top-1/2 h-4 w-0.5 -translate-y-1/2 bg-gray-400" />

        {/* IQR box (p25 to p75) */}
        <div
          className="absolute top-1/2 h-8 -translate-y-1/2 rounded border border-brand-teal/30 bg-brand-teal/10"
          style={{
            left: `${p25Pct}%`,
            width: `${p75Pct - p25Pct}%`,
          }}
        />

        {/* Median line */}
        <div
          className="absolute top-1/2 h-8 w-0.5 -translate-y-1/2 bg-brand-navy"
          style={{ left: `${medianPct}%` }}
        />

        {/* User rent marker */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${userPct}%` }}
        >
          <div
            className={`h-5 w-5 rounded-full border-2 border-white shadow-md ${color.bg}`}
          />
          {/* Arrow pointing down from marker */}
          <div
            className={`mx-auto h-0 w-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent ${
              user_rent < median
                ? "border-t-score-green"
                : user_rent <= p75
                  ? "border-t-score-yellow"
                  : "border-t-score-red"
            }`}
          />
        </div>
      </div>

      {/* Price labels */}
      <div className="relative h-10 text-xs text-gray-500">
        {/* Min label */}
        <div className="absolute left-0 top-0 text-left">
          <span className="block font-medium">Min</span>
          <span>{formatRent(min)}</span>
        </div>

        {/* P25 label */}
        <div
          className="absolute top-0 -translate-x-1/2 text-center"
          style={{ left: `${p25Pct}%` }}
        >
          <span className="block font-medium">P25</span>
          <span>{formatRent(p25)}</span>
        </div>

        {/* Median label */}
        <div
          className="absolute top-0 -translate-x-1/2 text-center"
          style={{ left: `${medianPct}%` }}
        >
          <span className="block font-medium text-brand-navy">Median</span>
          <span className="text-brand-navy">{formatRent(median)}</span>
        </div>

        {/* P75 label */}
        <div
          className="absolute top-0 -translate-x-1/2 text-center"
          style={{ left: `${p75Pct}%` }}
        >
          <span className="block font-medium">P75</span>
          <span>{formatRent(p75)}</span>
        </div>

        {/* Max label */}
        <div className="absolute right-0 top-0 text-right">
          <span className="block font-medium">Max</span>
          <span>{formatRent(max)}</span>
        </div>
      </div>
    </div>
  );
}
