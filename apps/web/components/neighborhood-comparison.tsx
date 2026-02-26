"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { formatRent } from "@/lib/format";

interface NeighborhoodComparisonProps {
  neighborhoods: Array<{
    slug: string;
    name_en: string;
    avg_rent_2br: number | null;
  }>;
  highlightSlug?: string;
}

const COLOR_NORMAL = "#0d9488"; // brand-teal
const COLOR_HIGHLIGHT = "#1e3a5f"; // brand-navy

interface TooltipPayloadEntry {
  payload: {
    slug: string;
    name_en: string;
    avg_rent_2br: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-md">
      <p className="text-sm font-semibold text-brand-navy">{entry.name_en}</p>
      <p className="text-xs text-gray-600">
        Avg 2BR rent: {formatRent(entry.avg_rent_2br)}
      </p>
    </div>
  );
}

export default function NeighborhoodComparison({
  neighborhoods,
  highlightSlug,
}: NeighborhoodComparisonProps) {
  // Filter out neighborhoods without rent data and sort by price ascending
  const data = neighborhoods
    .filter(
      (n): n is typeof n & { avg_rent_2br: number } => n.avg_rent_2br != null
    )
    .sort((a, b) => a.avg_rent_2br - b.avg_rent_2br);

  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        No neighborhood data available
      </div>
    );
  }

  const chartHeight = Math.max(data.length * 36, 200);

  return (
    <div className="w-full">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        Average 2BR Rent by Neighborhood
      </h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 40, left: 0, bottom: 4 }}
        >
          <XAxis
            type="number"
            tickFormatter={(v: number) => formatRent(v)}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name_en"
            width={120}
            tick={{ fontSize: 12, fill: "#4b5563" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
          />
          <Bar dataKey="avg_rent_2br" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry) => (
              <Cell
                key={entry.slug}
                fill={
                  entry.slug === highlightSlug ? COLOR_HIGHLIGHT : COLOR_NORMAL
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
