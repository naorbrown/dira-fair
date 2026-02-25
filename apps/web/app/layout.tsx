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
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-brand-navy"
        >
          dira-fair
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="transition-colors hover:text-brand-navy">
            Home
          </Link>
          <Link
            href="/dashboard"
            className="transition-colors hover:text-brand-navy"
          >
            Dashboard
          </Link>
          <Link
            href="/#check"
            className="rounded-lg bg-brand-teal px-4 py-2 text-white transition-colors hover:bg-brand-teal-light"
          >
            Check Your Rent
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-sm text-gray-500 sm:px-6">
        <p>dira-fair &mdash; Rental market intelligence for Tel Aviv</p>
        <a
          href="https://github.com/naorbrown/dira-fair"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-brand-navy"
        >
          Open source on GitHub
        </a>
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
      <body className="flex min-h-screen flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
