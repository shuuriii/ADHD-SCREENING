"use client";

import { useRouter } from "next/navigation";
import { useAssessment } from "@/contexts/AssessmentContext";
import ChronosSortGame from "@/components/game/ChronosSortGame";
import type { ChronosScores } from "@/lib/chronos-scoring";
import { saveChronosScore } from "@/lib/supabase/chronos-scores";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";

export default function ChronosTaskPage() {
  const router = useRouter();
  const { dispatch } = useAssessment();

  const handleComplete = (scores: ChronosScores) => {
    try {
      sessionStorage.setItem("chronos-task-scores", JSON.stringify(scores));
      // Mark game as complete
      dispatch({ type: "MARK_GAME_COMPLETE", payload: "chronosTask" });
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

  const handleReturn = () => {
    router.push("/assessment/hub");
  };

  return <ChronosSortGame onComplete={handleComplete} onReturn={handleReturn} />;
}
