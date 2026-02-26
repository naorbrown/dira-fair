"use client";

import { useState } from "react";

interface ConfidenceBadgeProps {
  confidence: {
    level: "high" | "medium" | "low";
    label: string;
    description: string;
    comparable_count: number;
    data_source: string;
  };
}

const LEVEL_CONFIG = {
  high: {
    dot: "bg-score-green",
    dotRing: "ring-score-green/20",
    label: "High Confidence",
    labelColor: "text-score-green",
    bg: "bg-score-green-bg",
    border: "border-score-green/20",
  },
  medium: {
    dot: "bg-score-yellow",
    dotRing: "ring-score-yellow/20",
    label: "Medium Confidence",
    labelColor: "text-score-yellow",
    bg: "bg-score-yellow-bg",
    border: "border-score-yellow/20",
  },
  low: {
    dot: "bg-orange-500",
    dotRing: "ring-orange-500/20",
    label: "Limited Data",
    labelColor: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
};

export default function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const [expanded, setExpanded] = useState(false);
  const config = LEVEL_CONFIG[confidence.level];

  return (
    <div
      className={`overflow-hidden rounded-xl border ${config.border} ${config.bg} transition-all`}
    >
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        {/* Colored dot indicator */}
        <span className="flex-shrink-0">
          <span
            className={`block h-3 w-3 rounded-full ${config.dot} ring-4 ${config.dotRing}`}
          />
        </span>

        {/* Label and source */}
        <div className="min-w-0 flex-1">
          <span className={`text-sm font-semibold ${config.labelColor}`}>
            {confidence.label || config.label}
          </span>
          <span className="ml-2 text-xs text-gray-500">
            Based on {confidence.comparable_count} comparable{" "}
            {confidence.comparable_count === 1 ? "listing" : "listings"}
          </span>
        </div>

        {/* Expand/collapse chevron */}
        <span
          className={`flex-shrink-0 text-gray-400 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {/* Expandable description section */}
      {expanded && (
        <div className="border-t border-gray-200/60 px-4 py-3">
          <p className="text-sm leading-relaxed text-gray-600">
            {confidence.description}
          </p>
          {confidence.data_source && (
            <p className="mt-2 text-xs text-gray-400">
              Source: {confidence.data_source}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
