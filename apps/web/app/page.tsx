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
  const sorted = [...NEIGHBORHOODS]
    .filter((n) => n.avg_rent_2br)
    .sort((a, b) => (a.avg_rent_2br ?? 0) - (b.avg_rent_2br ?? 0));
  const cheapest = sorted[0];
  const priciest = sorted[sorted.length - 1];

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
              See comparable apartments on a map, your exact percentile, and how much you could save — instantly.
            </p>
          </div>
          <div id="check" className="mx-auto mt-10 max-w-4xl">
            <div className="rounded-2xl bg-white/10 p-4 shadow-2xl backdrop-blur-md sm:p-6">
              <RentCheckerForm variant="inline" />
            </div>
            <p className="mt-3 text-center text-sm text-gray-400">
              5 seconds &middot; No sign-up &middot; {stats.total_listings} listings across {stats.neighborhoods_covered} neighborhoods
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="-mt-10 relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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

      {/* Quick neighborhood preview + explore CTA */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-brand-navy">Rent by Neighborhood</h2>
          <Link href="/dashboard" className="text-sm font-medium text-brand-teal hover:underline">
            View all {stats.neighborhoods_covered} &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[cheapest, priciest, sorted[Math.floor(sorted.length / 3)], sorted[Math.floor(sorted.length * 2 / 3)]].filter(Boolean).map((n) => (
            <Link
              key={n!.slug}
              href={`/neighborhood/${n!.slug}`}
              className="group rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-brand-teal/30 hover:shadow-md"
            >
              <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-teal">{n!.name_en}</p>
              <p className="mt-1 text-lg font-bold text-brand-navy">{n!.avg_rent_2br ? formatRent(n!.avg_rent_2br) : "N/A"}</p>
              <p className="text-xs text-gray-500">avg 2BR &middot; {n!.listing_count} listings</p>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-gray-400">
          Data: {DATA_META.sources.map((s) => s.name).join(", ")} | Updated {DATA_META.last_updated}
        </p>
      </section>
    </>
  );
}
