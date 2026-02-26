import Link from "next/link";
import RentCheckerForm from "@/components/rent-checker-form";
import { getCityStats, DATA_META, NEIGHBORHOODS, SUCCESS_STORIES, USEFUL_LINKS } from "@/lib/data";
import { formatRent, formatPercent } from "@/lib/format";

export default function HomePage() {
  const stats = getCityStats();
  const sorted = [...NEIGHBORHOODS]
    .filter((n) => n.avg_rent_2br)
    .sort((a, b) => (a.avg_rent_2br ?? 0) - (b.avg_rent_2br ?? 0));
  const cheapest = sorted[0];
  const priciest = sorted[sorted.length - 1];

  return (
    <>
      {/* ── HERO: Google-like simplicity ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-navy via-[#1a4a6e] to-brand-teal">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-brand-teal/30 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-24 sm:px-6 sm:pb-24 sm:pt-32">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Is Your Rent{" "}
              <span className="bg-gradient-to-r from-teal-200 to-emerald-200 bg-clip-text text-transparent">
                Fair?
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-gray-300">
              Enter your apartment details. See exactly how your rent compares.
            </p>
          </div>

          {/* The form — clean, centered, 3 inputs + submit */}
          <div id="check" className="mx-auto mt-10 max-w-2xl">
            <div className="rounded-2xl bg-white p-5 shadow-2xl sm:p-8">
              <RentCheckerForm variant="card" />
            </div>
            <p className="mt-3 text-center text-sm text-gray-400">
              {stats.total_listings} listings from {DATA_META.sources.length} sources across {stats.neighborhoods_covered} neighborhoods &middot; Updated {DATA_META.last_updated}
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h2 className="mb-8 text-center text-xl font-bold text-brand-navy">How It Works</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal/10 text-lg font-bold text-brand-teal">
              1
            </div>
            <h3 className="mt-3 text-sm font-semibold text-gray-900">Enter your details</h3>
            <p className="mt-1 text-xs text-gray-500">
              Neighborhood, rooms (Israeli count), size, and what you pay
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal/10 text-lg font-bold text-brand-teal">
              2
            </div>
            <h3 className="mt-3 text-sm font-semibold text-gray-900">See your position</h3>
            <p className="mt-1 text-xs text-gray-500">
              Instant percentile, comparable apartments with links, and quality comparison
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal/10 text-lg font-bold text-brand-teal">
              3
            </div>
            <h3 className="mt-3 text-sm font-semibold text-gray-900">Take action</h3>
            <p className="mt-1 text-xs text-gray-500">
              Negotiation strategies backed by data, alternatives you can move to today
            </p>
          </div>
        </div>
      </section>

      {/* ── MARKET SNAPSHOT ── */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="text-xl font-bold text-brand-navy">Tel Aviv Market Snapshot</h2>
            <Link href="/dashboard" className="text-sm font-medium text-brand-teal hover:underline">
              Full market data &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-2xl font-bold text-brand-navy">{formatRent(stats.avg_rent_2br)}</p>
              <p className="text-sm text-gray-600">Avg Rent (2BR)</p>
            </div>
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-2xl font-bold text-brand-navy">{formatPercent(stats.yoy_change)}</p>
              <p className="text-sm text-gray-600">Year-over-Year</p>
            </div>
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-2xl font-bold text-brand-navy">{stats.total_listings}</p>
              <p className="text-sm text-gray-600">Active Listings</p>
            </div>
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-2xl font-bold text-score-green">Feb</p>
              <p className="text-sm text-gray-600">Good to Negotiate</p>
            </div>
          </div>

          {/* Neighborhood quick links */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[cheapest, priciest, sorted[Math.floor(sorted.length / 3)], sorted[Math.floor(sorted.length * 2 / 3)]].filter(Boolean).map((n) => (
              <Link
                key={n!.slug}
                href={`/neighborhood/${n!.slug}`}
                className="group rounded-xl border border-gray-100 p-3 transition hover:border-brand-teal/30 hover:shadow-md"
              >
                <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-teal">{n!.name_en}</p>
                <p className="text-lg font-bold text-brand-navy">{n!.avg_rent_2br ? formatRent(n!.avg_rent_2br) : "N/A"}</p>
                <p className="text-xs text-gray-500">avg 2BR &middot; {n!.listing_count} listings</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUCCESS STORIES ── */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h2 className="mb-6 text-xl font-bold text-brand-navy">Tenants Who Negotiated &amp; Won</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SUCCESS_STORIES.map((story, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {story.rooms}-room in {story.neighborhood}
                </span>
                <span className="rounded-full bg-score-green-bg px-2.5 py-0.5 text-xs font-bold text-score-green">
                  Saved {formatRent(story.savings_annual)}/yr
                </span>
              </div>
              <div className="mb-3 flex items-center gap-3 text-sm">
                <span className="text-gray-500 line-through">{formatRent(story.before_rent)}/mo</span>
                <span className="text-lg font-bold text-score-green">{formatRent(story.after_rent)}/mo</span>
              </div>
              <p className="text-sm text-gray-600">{story.strategy}</p>
              <p className="mt-2 text-xs italic text-gray-400">&ldquo;{story.quote}&rdquo;</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DATA SOURCES ── */}
      <section className="border-t border-gray-100 bg-gray-50 py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="mb-4 text-lg font-bold text-brand-navy">Our Data Sources</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {DATA_META.sources.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-brand-teal/30 hover:shadow-md"
              >
                <p className="text-sm font-semibold text-brand-navy">{s.name}</p>
                <p className="mt-1 text-xs text-gray-500">{s.type} &middot; {s.period}</p>
                <p className="mt-2 text-xs text-brand-teal">Visit source &rarr;</p>
              </a>
            ))}
          </div>

          <h3 className="mb-3 mt-8 text-sm font-bold text-gray-700">Useful Resources for Tenants</h3>
          <div className="flex flex-wrap gap-3">
            {USEFUL_LINKS.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 transition hover:border-brand-teal/30 hover:text-brand-teal"
                title={link.description}
              >
                {link.label} &rarr;
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
