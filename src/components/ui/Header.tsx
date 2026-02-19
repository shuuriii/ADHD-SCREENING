"use client";

import Link from "next/link";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { AssessmentContext } from "@/contexts/AssessmentContext";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";
import { signInWithGoogle, signOut } from "@/lib/supabase/auth";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const ctx = useContext(AssessmentContext);
  const petPreference = ctx?.state.userData.petPreference ?? null;
  const name = ctx?.state.userData.name ?? "";

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!supabaseConfigured) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

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
            className="hidden sm:block text-sm text-muted hover:text-primary-700 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/assessment/intake"
            className="hidden sm:block text-sm text-muted hover:text-primary-700 transition-colors"
          >
            Start Screening
          </Link>
          <Link
            href="/assessment/focus-task"
            className="hidden sm:block text-sm text-muted hover:text-primary-700 transition-colors"
          >
            Tasks
          </Link>
          <Link
            href="/assessment/history"
            className="hidden sm:block text-sm text-muted hover:text-primary-700 transition-colors"
          >
            History
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted hidden sm:block max-w-[120px] truncate">
                {user.user_metadata?.full_name ?? user.email}
              </span>
              <button
                onClick={signOut}
                className="text-xs text-muted hover:text-red-500 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="flex items-center gap-1.5 text-xs font-medium text-primary-700 border border-primary-200 rounded-lg px-3 py-1.5 hover:bg-primary-50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in
            </button>
          )}

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
    </header>
  );
}
