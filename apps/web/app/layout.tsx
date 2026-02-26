import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "dira-fair | Is Your Tel Aviv Rent Fair?",
  description:
    "See how your Tel Aviv rent compares to the market. Get data-driven negotiation tips and rental market intelligence.",
};

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy text-sm font-bold text-white">
            df
          </div>
          <span className="text-lg font-bold tracking-tight text-brand-navy">
            dira-fair
          </span>
        </Link>
        <div className="flex items-center gap-1 text-sm font-medium sm:gap-4">
          <Link href="/" className="rounded-md px-3 py-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-brand-navy">
            Home
          </Link>
          <Link href="/dashboard" className="rounded-md px-3 py-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-brand-navy">
            Explore Market
          </Link>
          <Link
            href="/#check"
            className="ml-1 rounded-lg bg-brand-teal px-4 py-1.5 text-white transition-colors hover:bg-brand-teal-light sm:ml-2"
          >
            Check Rent
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <p className="text-sm font-medium text-gray-900">dira-fair</p>
            <p className="text-xs text-gray-500">Rental market intelligence for Tel Aviv tenants</p>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <span>Data: Yad2, CBS, nadlan.gov.il</span>
            <a
              href="https://github.com/naorbrown/dira-fair"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 transition-colors hover:text-brand-navy"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-gray-50 antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
