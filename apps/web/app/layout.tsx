import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "DiraFair | Is Your Tel Aviv Rent Fair?",
  description:
    "See how your Tel Aviv rent compares to the market. Get data-driven negotiation tips and rental market intelligence.",
};

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <svg className="h-7 w-7 text-brand-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
          </svg>
          <span className="text-lg font-semibold tracking-tight text-gray-900">
            Dira<span className="text-brand-teal">Fair</span>
          </span>
        </Link>
        <div className="flex items-center gap-1 text-sm font-medium sm:gap-4">
          <Link href="/" className="rounded-md px-3 py-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-brand-navy">
            Home
          </Link>
          <Link href="/explore" className="rounded-md px-3 py-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-brand-navy">
            Browse Listings
          </Link>
          <Link href="/dashboard" className="hidden rounded-md px-3 py-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-brand-navy sm:inline-block">
            Market Stats
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
            <p className="text-sm font-medium text-gray-900">DiraFair</p>
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
