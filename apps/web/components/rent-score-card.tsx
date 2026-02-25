import { formatRent, formatPercent } from "@/lib/format";

interface RentScoreCardProps {
  score: "below_market" | "at_market" | "above_market";
  scoreLabel: string;
  yourRent: number;
  marketAvg: number;
  deltaPercent: number;
  percentile: number;
}

const SCORE_STYLES = {
  below_market: {
    bg: "bg-score-green-bg",
    border: "border-score-green/20",
    text: "text-score-green",
    bar: "bg-score-green",
    emoji: "Great Deal",
  },
  at_market: {
    bg: "bg-score-yellow-bg",
    border: "border-score-yellow/20",
    text: "text-score-yellow",
    bar: "bg-score-yellow",
    emoji: "Fair Price",
  },
  above_market: {
    bg: "bg-score-red-bg",
    border: "border-score-red/20",
    text: "text-score-red",
    bar: "bg-score-red",
    emoji: "Room to Negotiate",
  },
};

export default function RentScoreCard({
  score,
  scoreLabel,
  yourRent,
  marketAvg,
  deltaPercent,
  percentile,
}: RentScoreCardProps) {
  const style = SCORE_STYLES[score];
  const isBelow = deltaPercent < 0;

  return (
    <div
      className={`overflow-hidden rounded-2xl border ${style.border} ${style.bg} p-6 shadow-sm`}
    >
      {/* Score label */}
      <div className="mb-4 text-center">
        <span
          className={`inline-block rounded-full px-4 py-1.5 text-sm font-bold ${style.text} ${style.bg}`}
        >
          {scoreLabel || style.emoji}
        </span>
      </div>

      {/* Rent comparison */}
      <div className="mb-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Your Rent
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {formatRent(yourRent)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Market Avg
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {formatRent(marketAvg)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Difference
          </p>
          <p className={`mt-1 text-2xl font-bold ${style.text}`}>
            {formatPercent(deltaPercent)}
          </p>
        </div>
      </div>

      {/* Percentile bar */}
      <div>
        <div className="mb-1 flex justify-between text-xs text-gray-500">
          <span>Cheapest</span>
          <span>
            You pay {isBelow ? "less" : "more"} than {Math.round(percentile)}%
            of renters
          </span>
          <span>Most Expensive</span>
        </div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={`absolute left-0 top-0 h-full rounded-full ${style.bar} transition-all`}
            style={{ width: `${Math.min(Math.max(percentile, 2), 98)}%` }}
          />
          <div
            className="absolute top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-gray-900 shadow"
            style={{ left: `${Math.min(Math.max(percentile, 2), 98)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
