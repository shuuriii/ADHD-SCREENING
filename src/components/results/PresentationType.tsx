"use client";

import { motion } from "framer-motion";
import type { PresentationResult, ASRSPresentationResult } from "@/questionnaire/types";

const typeColors: Record<string, string> = {
  combined: "border-l-severity-high",
  inattentive: "border-l-calm-blue",
  hyperactive: "border-l-severity-moderate",
  subthreshold: "border-l-severity-low",
  high_risk: "border-l-severity-high",
  low_risk: "border-l-severity-low",
};

export default function PresentationTypeCard({
  result,
}: {
  result: PresentationResult | ASRSPresentationResult;
}) {
  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-sm border border-border/50 border-l-4 ${typeColors[result.type]} p-5 mb-6`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-1">
        Presentation Type
      </h3>
      <p className="text-xl font-bold text-foreground">{result.label}</p>
      <p className="text-sm text-muted mt-1">{result.description}</p>
    </motion.div>
  );
}
