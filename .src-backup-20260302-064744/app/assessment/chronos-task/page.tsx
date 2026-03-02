"use client";

import ChronosSortGame from "@/components/game/ChronosSortGame";
import type { ChronosScores } from "@/lib/chronos-scoring";
import { saveChronosScore } from "@/lib/supabase/chronos-scores";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";

export default function ChronosTaskPage() {
  const handleComplete = (scores: ChronosScores) => {
    try {
      sessionStorage.setItem("chronos-task-scores", JSON.stringify(scores));
    } catch {
      // ignore
    }
    // Supabase fire-and-forget
    const sessionId = localStorage.getItem("fayth-session-id");
    if (sessionId && supabaseConfigured) {
      createClient().auth.getUser().then(({ data }) => {
        saveChronosScore(scores, sessionId, data.user?.id);
      });
    }
  };

  return <ChronosSortGame onComplete={handleComplete} />;
}
