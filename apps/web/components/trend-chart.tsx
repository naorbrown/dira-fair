"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { TrendEntry } from "@/lib/types";

interface TrendChartProps {
  data: TrendEntry[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

interface TooltipPayload {
  value: number;
  payload: TrendEntry;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-md">
      <p className="text-xs text-gray-500">
        {formatDate(entry.payload.date)}
      </p>
      <p className="text-sm font-semibold text-brand-navy">
        Index: {entry.value.toFixed(1)}
      </p>
    </div>
  );
}

export default function TrendChart({ data }: TrendChartProps) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        No trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 12, fill: "#9ca3af" }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#9ca3af" }}
          axisLine={false}
          tickLine={false}
          domain={["dataMin - 2", "dataMax + 2"]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="index"
          stroke="#1e3a5f"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, fill: "#0d9488" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
