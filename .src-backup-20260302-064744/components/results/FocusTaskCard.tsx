"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { GoNoGoScores } from "@/lib/gonogo-scoring";
import { Target } from "lucide-react";

const STORAGE_KEY = "focus-task-scores";

function scoreColor(value: number, threshLow: number, threshHigh: number, invert = false) {
  if (invert) {
    return value > threshHigh ? "text-red-500" : value > threshLow ? "text-yellow-500" : "text-green-500";
  }
  return value < threshLow ? "text-red-500" : value < threshHigh ? "text-yellow-500" : "text-green-500";
}

export default function FocusTaskCard() {
  const [scores, setScores] = useState<GoNoGoScores | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setScores(JSON.parse(raw));
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  if (!scores) return null;

  const metrics = [
    { label: "AQvis", value: String(scores.aqvis), desc: "Attention Quality", colorClass: scoreColor(scores.aqvis, 70, 85) },
    { label: "RCQvis", value: String(scores.rcqvis), desc: "Response Control", colorClass: scoreColor(scores.rcqvis, 70, 85) },
    { label: "ICV", value: `${scores.icv}%`, desc: "RT Variability", colorClass: scoreColor(scores.icv, 25, 35, true) },
    { label: "Mean RT", value: `${scores.meanRT}ms`, desc: "Avg Speed", colorClass: "text-foreground" },
  ];

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-border/50 p-5 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Target size={18} className="text-primary-600" />
        <h3 className="font-semibold text-foreground">Focus Task Results</h3>
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
        AQvis &lt; 70 or ICV &gt; 35% may indicate attention difficulties.
        These scores supplement the questionnaire — not a standalone diagnosis.
      </p>
    </motion.div>
  );
}
