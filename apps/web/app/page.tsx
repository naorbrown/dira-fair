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
              Compare your rent against {stats.total_listings} active listings
              across {stats.neighborhoods_covered} neighborhoods. Get data-driven
              negotiation tips.
            </p>
          </div>
          <div id="check" className="mx-auto mt-10 max-w-4xl">
            <div className="rounded-2xl bg-white/10 p-4 shadow-2xl backdrop-blur-md sm:p-6">
              <RentCheckerForm variant="inline" />
            </div>
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

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <h2 className="mb-12 text-center text-2xl font-bold text-brand-navy sm:text-3xl">
          How It Works
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            { step: "1", title: "Enter Your Details", description: "Tell us your neighborhood, apartment size, and what you\u2019re paying." },
            { step: "2", title: "Get Your Score", description: "We compare your rent against real market data and show where you stand." },
            { step: "3", title: "Negotiate with Data", description: "Use price distributions, market signals, and savings estimates to negotiate." },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal/10 text-lg font-bold text-brand-teal">
                {item.step}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rent landscape */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="mb-8 text-center text-2xl font-bold text-brand-navy sm:text-3xl">
            Tel Aviv Rent Landscape
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Most Affordable (2BR)</p>
              <p className="mt-2 text-2xl font-bold text-brand-navy">{cheapest?.name_en}</p>
              <p className="mt-1 text-lg text-gray-600">{cheapest?.avg_rent_2br ? formatRent(cheapest.avg_rent_2br) : "N/A"} avg</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Most Premium (2BR)</p>
              <p className="mt-2 text-2xl font-bold text-brand-navy">{priciest?.name_en}</p>
              <p className="mt-1 text-lg text-gray-600">{priciest?.avg_rent_2br ? formatRent(priciest.avg_rent_2br) : "N/A"} avg</p>
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
