"use client";

import FocusQuestGame from "@/components/game/FocusQuestGame";
import type { FocusQuestScores } from "@/lib/focus-quest-scoring";
import { saveFocusQuestScore } from "@/lib/supabase/focus-quest-scores";
import { createClient } from "@/lib/supabase/client";

export default function FocusQuestPage() {
  const handleComplete = (scores: FocusQuestScores) => {
    try {
      sessionStorage.setItem("focus-quest-scores", JSON.stringify(scores));
    } catch {
      // ignore
    }
    // Supabase fire-and-forget
    const sessionId = localStorage.getItem("fayth-session-id");
    if (sessionId) {
      createClient().auth.getUser().then(({ data }) => {
        saveFocusQuestScore(scores, sessionId, data.user?.id);
      });
    }
  };

  return <FocusQuestGame onComplete={handleComplete} />;
}
