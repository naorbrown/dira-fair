import Link from "next/link";
import RentCheckerForm from "@/components/rent-checker-form";
import { getCityStats, DATA_META, NEIGHBORHOODS } from "@/lib/data";
import { formatRent, formatPercent } from "@/lib/format";

function StatCard({
  value,
  label,
  sublabel,
}: {
  value: string;
  label: string;
  sublabel: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md transition hover:shadow-lg">
      <p className="text-3xl font-bold text-brand-navy">{value}</p>
      <p className="mt-1 text-sm font-medium text-gray-900">{label}</p>
      <p className="mt-0.5 text-xs text-gray-500">{sublabel}</p>
    </div>
  );
}

export default function HomePage() {
  const stats = getCityStats();
  const cheapest = [...NEIGHBORHOODS]
    .filter((n) => n.avg_rent_2br)
    .sort((a, b) => (a.avg_rent_2br ?? 0) - (b.avg_rent_2br ?? 0))[0];
  const priciest = [...NEIGHBORHOODS]
    .filter((n) => n.avg_rent_2br)
    .sort((a, b) => (b.avg_rent_2br ?? 0) - (a.avg_rent_2br ?? 0))[0];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-navy via-[#1a4a6e] to-brand-teal">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-brand-teal/30 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Is Your Tel Aviv Rent{" "}
              <span className="bg-gradient-to-r from-teal-200 to-emerald-200 bg-clip-text text-transparent">
                Fair?
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300 sm:text-xl">
              Enter your apartment details below and get an instant analysis — your percentile rank, savings potential, and negotiation strategies.
            </p>
          </div>
          <div id="check" className="mx-auto mt-10 max-w-4xl">
            <div className="rounded-2xl bg-white/10 p-4 shadow-2xl backdrop-blur-md sm:p-6">
              <RentCheckerForm variant="inline" />
            </div>
            <p className="mt-3 text-center text-sm text-gray-400">
              Takes 5 seconds &middot; No sign-up required &middot; Based on {stats.total_listings} active listings
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="-mt-10 relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            value={formatRent(stats.avg_rent_2br)}
            label="Avg Rent (2BR)"
            sublabel={`Across ${stats.neighborhoods_covered} neighborhoods`}
          />
          <StatCard
            value={formatPercent(stats.yoy_change)}
            label="Year-over-Year"
            sublabel="Rent index trend over 12 months"
          />
          <StatCard
            value={stats.total_listings.toString()}
            label="Active Listings"
            sublabel={`Updated ${DATA_META.last_updated}`}
          />
          <StatCard
            value="Feb"
            label="Good to Negotiate"
            sublabel="Low demand season (Nov-Feb)"
          />
        </div>
      </section>

      {/* What You'll Get — concrete preview of results */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <h2 className="mb-3 text-center text-2xl font-bold text-brand-navy sm:text-3xl">
          What You&apos;ll Get
        </h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-sm text-gray-500">
          In seconds, you&apos;ll see exactly where your rent stands and what to do about it.
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/10">
              <span className="text-lg font-bold text-brand-navy">1</span>
            </div>
            <h3 className="text-base font-semibold text-gray-900">Your Score</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              See your percentile rank — are you paying more or less than other tenants in your neighborhood?
            </p>
            <div className="mt-4 flex gap-1">
              <span className="rounded-full bg-score-green-bg px-2.5 py-0.5 text-xs font-medium text-score-green">Below Market</span>
              <span className="rounded-full bg-score-yellow-bg px-2.5 py-0.5 text-xs font-medium text-score-yellow">At Market</span>
              <span className="rounded-full bg-score-red-bg px-2.5 py-0.5 text-xs font-medium text-score-red">Above</span>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/10">
              <span className="text-lg font-bold text-brand-navy">2</span>
            </div>
            <h3 className="text-base font-semibold text-gray-900">The Evidence</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Price distribution charts, comparable listings, market signals, and neighborhood context — all the data you need.
            </p>
            <div className="mt-4 flex gap-1">
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">Distribution</span>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">Comps</span>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">Trends</span>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy/10">
              <span className="text-lg font-bold text-brand-navy">3</span>
            </div>
            <h3 className="text-base font-semibold text-gray-900">Your Action Plan</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Specific negotiation strategies, savings targets, and timing advice tailored to your situation.
            </p>
            <div className="mt-4 flex gap-1">
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">Tips</span>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">Savings</span>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">Timing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Or explore first */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <h2 className="text-xl font-bold text-brand-navy sm:text-2xl">
                Not ready to check yet?
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Explore the market first — compare neighborhoods, view trends, and see where prices are heading.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="shrink-0 rounded-lg border border-brand-navy px-6 py-2.5 text-sm font-semibold text-brand-navy transition hover:bg-brand-navy hover:text-white"
            >
              Explore the Market
            </Link>
          </div>

          {/* Quick neighborhood preview */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Most Affordable (2BR)</p>
              <p className="mt-2 text-xl font-bold text-brand-navy">{cheapest?.name_en}</p>
              <p className="mt-1 text-gray-600">{cheapest?.avg_rent_2br ? formatRent(cheapest.avg_rent_2br) : "N/A"} avg</p>
              <Link href={`/neighborhood/${cheapest?.slug}`} className="mt-2 inline-block text-xs font-medium text-brand-teal hover:underline">
                View details &rarr;
              </Link>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Most Premium (2BR)</p>
              <p className="mt-2 text-xl font-bold text-brand-navy">{priciest?.name_en}</p>
              <p className="mt-1 text-gray-600">{priciest?.avg_rent_2br ? formatRent(priciest.avg_rent_2br) : "N/A"} avg</p>
              <Link href={`/neighborhood/${priciest?.slug}`} className="mt-2 inline-block text-xs font-medium text-brand-teal hover:underline">
                View details &rarr;
              </Link>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-gray-400">
            Data from {DATA_META.sources.map((s) => s.name).join(", ")} | Last updated {DATA_META.last_updated}
          </p>
        </div>
      </section>
    </>
  );
}
