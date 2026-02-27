"use client";

import { useRouter } from "next/navigation";
import { useAssessment } from "@/contexts/AssessmentContext";
import GoNoGoGame from "@/components/game/GoNoGoGame";
import type { GoNoGoScores } from "@/lib/gonogo-scoring";

export default function GoNoGoPage() {
  const router = useRouter();
  const { dispatch } = useAssessment();

  const handleComplete = (scores: GoNoGoScores) => {
    try {
      sessionStorage.setItem("focus-task-scores", JSON.stringify(scores));
      // Mark game as complete
      dispatch({ type: "MARK_GAME_COMPLETE", payload: "goNogo" });
    } catch {
      // ignore
    }
  };

  const handleReturn = () => {
    router.push("/assessment/hub");
  };

  return <GoNoGoGame onComplete={handleComplete} onReturn={handleReturn} />;
}
