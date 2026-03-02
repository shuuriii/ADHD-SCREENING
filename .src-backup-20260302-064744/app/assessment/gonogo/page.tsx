"use client";

import GoNoGoGame from "@/components/game/GoNoGoGame";
import type { GoNoGoScores } from "@/lib/gonogo-scoring";

export default function GoNoGoPage() {
  const handleComplete = (scores: GoNoGoScores) => {
    try {
      sessionStorage.setItem("focus-task-scores", JSON.stringify(scores));
    } catch {
      // ignore
    }
  };

  return <GoNoGoGame onComplete={handleComplete} />;
}
