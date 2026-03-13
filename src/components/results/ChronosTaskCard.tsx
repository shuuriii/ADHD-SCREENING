"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ChronosScores } from "@/lib/chronos-scoring";
import { Timer } from "lucide-react";
import { safeParse, chronosScoresSchema } from "@/lib/schemas";

const STORAGE_KEY = "chronos-task-scores";

function scoreColor(value: number, threshLow: number, threshHigh: number) {
  return value < threshLow ? "text-red-500" : value < threshHigh ? "text-yellow-500" : "text-green-500";
}

export default function ChronosTaskCard() {
  const [scores, setScores] = useState<ChronosScores | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setScores(safeParse(raw, chronosScoresSchema));
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  if (!scores) return null;

  const metrics = [
    { label: "cIM", value: String(scores.cIM), desc: "Temporal Memory", colorClass: scoreColor(scores.cIM, 50, 70) },
    { label: "cHR", value: String(scores.cHR), desc: "Patience", colorClass: scoreColor(scores.cHR, 50, 70) },
    { label: "cIE", value: String(scores.cIE), desc: "Adaptation", colorClass: scoreColor(scores.cIE, 40, 60) },
  ];

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-border/50 p-5 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Timer size={18} className="text-teal-600" />
        <h3 className="font-semibold text-foreground">Chronos Sort Results</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        {metrics.map((m) => (
          <div key={m.label} className="text-center p-3 bg-gray-50 rounded-xl">
            <div className={`text-2xl font-bold ${m.colorClass}`}>{m.value}</div>
            <div className="text-xs font-medium text-muted mt-0.5">{m.label}</div>
            <div className="text-[10px] text-muted">{m.desc}</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted leading-relaxed">
        cIM &lt; 50 may indicate time perception difficulties.
        cIE &gt; 50 means you improved across phases.
        These scores supplement the questionnaire — not a standalone diagnosis.
      </p>
    </motion.div>
  );
}
