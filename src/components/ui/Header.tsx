"use client";

import Link from "next/link";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AssessmentContext } from "@/contexts/AssessmentContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/assessment/intake", label: "Start Screening" },
  { href: "/assessment/focus-task", label: "Tasks" },
  { href: "/assessment/history", label: "History" },
];

export default function Header() {
  const ctx = useContext(AssessmentContext);
  const petPreference = ctx?.state.userData.petPreference ?? null;
  const name = ctx?.state.userData.name ?? "";
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-border">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center relative">
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sm:hidden flex flex-col justify-center gap-1 w-8 h-8 shrink-0"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          <span className={`block h-0.5 w-5 bg-foreground transition-all ${mobileOpen ? "rotate-45 translate-y-1.5" : ""}`} />
          <span className={`block h-0.5 w-5 bg-foreground transition-all ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-5 bg-foreground transition-all ${mobileOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
        </button>

        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 sm:static sm:translate-x-0 text-xl font-semibold text-primary-700 tracking-tight"
        >
          fayth.life
        </Link>
        <nav aria-label="Main navigation" className="ml-auto flex items-center gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              {...(pathname === link.href ? { "aria-current": "page" as const } : {})}
              className={`hidden sm:block text-sm transition-colors ${
                pathname === link.href
                  ? "text-primary-700 font-medium"
                  : "text-muted hover:text-primary-700"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {petPreference && (
            <div
              className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary-300 shrink-0"
              title={name ? `${name}'s avatar` : "Your avatar"}
            >
              <Image
                src={`/images/${petPreference}-avatar.png`}
                alt={`${petPreference} avatar`}
                width={32}
                height={32}
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </nav>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <nav aria-label="Mobile navigation" className="sm:hidden border-t border-border bg-white/95 backdrop-blur-lg">
          <div className="max-w-4xl mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                {...(pathname === link.href ? { "aria-current": "page" as const } : {})}
                className={`px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname === link.href
                    ? "text-primary-700 font-medium bg-primary-50"
                    : "text-muted hover:text-primary-700 hover:bg-primary-50/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
