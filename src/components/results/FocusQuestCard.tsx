"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { FocusQuestScores } from "@/lib/focus-quest-scoring";
import { Waves } from "lucide-react";
import { safeParse, focusQuestScoresSchema } from "@/lib/schemas";

const STORAGE_KEY = "focus-quest-scores";

function scoreColor(value: number, threshLow: number, threshHigh: number) {
  return value < threshLow ? "text-red-500" : value < threshHigh ? "text-yellow-500" : "text-green-500";
}

export default function FocusQuestCard() {
  const [scores, setScores] = useState<FocusQuestScores | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setScores(safeParse(raw, focusQuestScoresSchema));
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  if (!scores) return null;

  const metrics = [
    { label: "CPT-X", value: String(scores.cCPT_X), desc: "Impulse Control", colorClass: scoreColor(scores.cCPT_X, 50, 70) },
    { label: "CPT-AX", value: String(scores.cCPT_AX), desc: "Working Memory", colorClass: scoreColor(scores.cCPT_AX, 50, 70) },
    { label: "cIA", value: String(scores.cIA), desc: "Inattention", colorClass: scoreColor(scores.cIA, 50, 70) },
    { label: "cHI", value: String(scores.cHI), desc: "Hyper/Impulsivity", colorClass: scoreColor(scores.cHI, 50, 70) },
  ];

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-border/50 p-5 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Waves size={18} className="text-blue-500" />
        <h3 className="font-semibold text-foreground">Focus Quest Results</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        {metrics.map((m) => (
          <div key={m.label} className="text-center p-3 bg-gray-50 rounded-xl">
            <div className={`text-2xl font-bold ${m.colorClass}`}>{m.value}</div>
            <div className="text-xs font-medium text-muted mt-0.5">{m.label}</div>
            <div className="text-[10px] text-muted">{m.desc}</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted leading-relaxed">
        Scores below 50 may indicate attention or impulse control difficulties.
        These scores supplement the questionnaire — not a standalone diagnosis.
      </p>
    </motion.div>
  );
}
