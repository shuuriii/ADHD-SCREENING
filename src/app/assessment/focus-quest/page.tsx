"use client";

import { useRouter } from "next/navigation";
import { useAssessment } from "@/contexts/AssessmentContext";
import FocusQuestGame from "@/components/game/FocusQuestGame";
import type { FocusQuestScores } from "@/lib/focus-quest-scoring";
import { saveFocusQuestScore } from "@/lib/supabase/focus-quest-scores";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";

export default function FocusQuestPage() {
  const router = useRouter();
  const { dispatch } = useAssessment();

  const handleComplete = (scores: FocusQuestScores) => {
    try {
      sessionStorage.setItem("focus-quest-scores", JSON.stringify(scores));
      // Mark game as complete
      dispatch({ type: "MARK_GAME_COMPLETE", payload: "focusQuest" });
    } catch {
      // ignore
    }
    // Supabase fire-and-forget
    const sessionId = localStorage.getItem("fayth-session-id");
    if (sessionId && supabaseConfigured) {
      createClient().auth.getUser().then(({ data }) => {
        saveFocusQuestScore(scores, sessionId, data.user?.id);
      });
    }
  };

  const handleReturn = () => {
    router.push("/assessment/hub");
  };

  return <FocusQuestGame onComplete={handleComplete} onReturn={handleReturn} />;
}
