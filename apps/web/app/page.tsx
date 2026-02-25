import RentCheckerForm from "@/components/rent-checker-form";

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
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-navy via-[#1a4a6e] to-brand-teal">
        {/* Decorative background elements */}
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
              See how your rent compares to the market. Get data-driven
              negotiation tips backed by real listing data.
            </p>
          </div>

          {/* Inline rent checker form */}
          <div id="check" className="mx-auto mt-10 max-w-4xl">
            <div className="rounded-2xl bg-white/10 p-4 shadow-2xl backdrop-blur-md sm:p-6">
              <RentCheckerForm variant="inline" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="-mt-10 relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            value="₪10,700"
            label="Average Rent (2BR)"
            sublabel="Across all Tel Aviv neighborhoods"
          />
          <StatCard
            value="+4.2%"
            label="Year-over-Year Growth"
            sublabel="Rent index trend over 12 months"
          />
          <StatCard
            value="Feb"
            label="Good Time to Negotiate"
            sublabel="Lower demand before spring season"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <h2 className="mb-10 text-center text-2xl font-bold text-brand-navy sm:text-3xl">
          How It Works
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Enter Your Details",
              description:
                "Tell us your neighborhood, apartment size, and what you're paying.",
            },
            {
              step: "2",
              title: "Get Your Score",
              description:
                "We compare your rent against real market data from current listings.",
            },
            {
              step: "3",
              title: "Negotiate with Confidence",
              description:
                "Use our data-driven tips to have an informed conversation with your landlord.",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal/10 text-lg font-bold text-brand-teal">
                {item.step}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
