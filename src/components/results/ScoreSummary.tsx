"use client";

import { motion } from "framer-motion";
import type { DomainScore } from "@/questionnaire/types";

const severityColors: Record<string, string> = {
  high: "bg-severity-high text-white",
  moderate: "bg-severity-moderate text-white",
  mild: "bg-severity-mild text-foreground",
  low: "bg-severity-low text-white",
};

const barColors: Record<string, string> = {
  high: "bg-severity-high",
  moderate: "bg-severity-moderate",
  mild: "bg-severity-mild",
  low: "bg-severity-low",
};

interface ScoreSummaryProps {
  domainA: DomainScore;
  domainB: DomainScore;
}

function DomainCard({ score }: { score: DomainScore }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">{score.domainName}</h3>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${severityColors[score.severity]}`}
        >
          {score.severity}
        </span>
      </div>

      <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
        <motion.div
          className={`h-full rounded-full ${barColors[score.severity]}`}
          initial={{ width: 0 }}
          animate={{ width: `${score.percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" as const, delay: 0.3 }}
        />
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-muted">
          Clinical symptoms:{" "}
          <span className="font-semibold text-foreground">
            {score.clinicalCount}/{score.totalQuestions}
          </span>
        </span>
        <span className="text-muted">
          Meets threshold:{" "}
          <span
            className={`font-semibold ${score.meetsCriteria ? "text-severity-high" : "text-severity-low"}`}
          >
            {score.meetsCriteria ? "Yes" : "No"}
          </span>
        </span>
      </div>
    </div>
  );
}

export default function ScoreSummary({ domainA, domainB }: ScoreSummaryProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DomainCard score={domainA} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <DomainCard score={domainB} />
      </motion.div>
    </div>
  );
}
