"use client";

import Link from "next/link";
import Image from "next/image";
import { useContext } from "react";
import { AssessmentContext } from "@/contexts/AssessmentContext";

export default function Header() {
  // Safe: returns null when rendered outside AssessmentProvider (e.g. landing page)
  const ctx = useContext(AssessmentContext);
  const petPreference = ctx?.state.userData.petPreference ?? null;
  const name = ctx?.state.userData.name ?? "";

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
          {petPreference && (
            <div
              className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary-300 shrink-0"
              title={name ? `${name}'s avatar` : "Your avatar"}
            >
              <Image
                src={`/images/${petPreference}-avatar.png`}
                alt={petPreference === "cat" ? "Cat avatar" : "Dog avatar"}
                width={32}
                height={32}
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
