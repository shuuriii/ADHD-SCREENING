"use client";

import FocusQuestGame from "@/components/game/FocusQuestGame";
import type { FocusQuestScores } from "@/lib/focus-quest-scoring";
import { saveFocusQuestViaAPI } from "@/lib/api-client";

export default function FocusQuestPage() {
  const handleComplete = (scores: FocusQuestScores) => {
    try {
      sessionStorage.setItem("focus-quest-scores", JSON.stringify(scores));
    } catch {
      // ignore
    }
    // Save via server-side API (fire-and-forget)
    const sessionId = localStorage.getItem("fayth-session-id");
    if (sessionId) {
      saveFocusQuestViaAPI(sessionId, scores);
    }
  };

  return <FocusQuestGame onComplete={handleComplete} />;
}
