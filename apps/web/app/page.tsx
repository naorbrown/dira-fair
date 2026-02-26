import RentCheckerForm from "@/components/rent-checker-form";
import { getCityStats, DATA_META } from "@/lib/data";

export default function HomePage() {
  const stats = getCityStats();

  return (
    <section className="relative flex min-h-[calc(100vh-57px)] items-center overflow-hidden bg-gradient-to-br from-brand-navy via-[#1a4a6e] to-brand-teal">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-brand-teal/30 blur-3xl" />
      </div>
      <div className="relative mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Is Your Rent{" "}
            <span className="bg-gradient-to-r from-teal-200 to-emerald-200 bg-clip-text text-transparent">
              Fair?
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-300">
            Compare your rent to {stats.total_listings.toLocaleString()} real listings across Tel Aviv and surrounding areas.
          </p>
        </div>

        <div id="check" className="mx-auto mt-10 max-w-2xl">
          <div className="rounded-2xl bg-white p-5 shadow-2xl sm:p-8">
            <RentCheckerForm variant="card" />
          </div>
          <p className="mt-3 text-center text-sm text-gray-400">
            {stats.total_listings.toLocaleString()} listings &middot; {DATA_META.sources.length} sources &middot; {stats.neighborhoods_covered} neighborhoods &middot; Updated {DATA_META.last_updated}
          </p>
        </div>
      </div>
    </section>
  );
}
