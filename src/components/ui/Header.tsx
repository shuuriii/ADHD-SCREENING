"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-border">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-semibold text-primary-700 tracking-tight"
        >
          fayth.life
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-muted hover:text-primary-700 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/assessment/intake"
            className="text-sm text-muted hover:text-primary-700 transition-colors"
          >
            Start Screening
          </Link>
          <Link
            href="/assessment/history"
            className="text-sm text-muted hover:text-primary-700 transition-colors"
          >
            History
          </Link>
        </nav>
      </div>
    </header>
  );
}
