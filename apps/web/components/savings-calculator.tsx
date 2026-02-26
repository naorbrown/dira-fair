"use client";

import { formatRent } from "@/lib/format";

interface SavingsCalculatorProps {
  savings: {
    potential_monthly: number;
    potential_annual: number;
    negotiation_target: number;
  } | null;
  currentRent: number;
}

export default function SavingsCalculator({
  savings,
  currentRent,
}: SavingsCalculatorProps) {
  if (!savings) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-score-green/20 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-100 bg-score-green-bg px-6 py-4">
        <h3 className="text-lg font-bold text-gray-900">Potential Savings</h3>
        <p className="mt-0.5 text-sm text-gray-500">
          Based on market data for your area
        </p>
      </div>

      <div className="px-6 py-5">
        {/* Current rent vs negotiation target */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Current Rent
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {formatRent(currentRent)}
            </p>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-score-green"
            >
              <path
                d="M5 12H19M19 12L13 6M19 12L13 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Target Rent
            </p>
            <p className="mt-1 text-xl font-bold text-score-green">
              {formatRent(savings.negotiation_target)}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mb-5 border-t border-gray-100" />

        {/* Monthly savings - prominent */}
        <div className="mb-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Monthly Savings
          </p>
          <p className="mt-1 text-3xl font-bold text-score-green">
            {formatRent(savings.potential_monthly)}
          </p>
        </div>

        {/* Annual savings */}
        <div className="mb-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Annual Savings
          </p>
          <p className="mt-1 text-xl font-semibold text-gray-900">
            {formatRent(savings.potential_annual)}
          </p>
        </div>

        {/* Motivational line */}
        <div className="rounded-lg bg-score-green-bg px-4 py-3 text-center">
          <p className="text-sm font-medium text-score-green">
            That&apos;s {formatRent(savings.potential_annual)} back in your
            pocket each year
          </p>
        </div>
      </div>
    </div>
  );
}
