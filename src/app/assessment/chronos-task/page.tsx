"use client";

import ChronosSortGame from "@/components/game/ChronosSortGame";
import type { ChronosScores } from "@/lib/chronos-scoring";
import { saveChronosViaAPI } from "@/lib/api-client";

export default function ChronosTaskPage() {
  const handleComplete = (scores: ChronosScores) => {
    try {
      sessionStorage.setItem("chronos-task-scores", JSON.stringify(scores));
    } catch {
      // ignore
    }
    // Save via server-side API (fire-and-forget)
    const sessionId = localStorage.getItem("fayth-session-id");
    if (sessionId) {
      saveChronosViaAPI(sessionId, scores);
    }
  };

  return <ChronosSortGame onComplete={handleComplete} />;
}
