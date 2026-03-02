"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import type { DSM5Criteria as CriteriaType } from "@/questionnaire/types";

interface DSM5CriteriaProps {
  criteria: CriteriaType;
  clinicalNote: string;
}

const criteriaItems = [
  { key: "meetsSymptomThreshold" as const, label: "5+ symptoms in at least one domain" },
  { key: "multipleSettings" as const, label: "Symptoms present in multiple settings" },
  { key: "beforeAge12" as const, label: "Some symptoms present before age 12" },
  { key: "significantImpact" as const, label: "Significant impact on daily functioning" },
];

export default function DSM5CriteriaCard({
  criteria,
  clinicalNote,
}: DSM5CriteriaProps) {
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-border/50 p-5 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h3 className="font-semibold text-foreground mb-4">
        DSM-5 Context Criteria
      </h3>
      <div className="space-y-3">
        {criteriaItems.map((item) => {
          const met = criteria[item.key];
          return (
            <div key={item.key} className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  met
                    ? "bg-severity-low/20 text-severity-low"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {met ? <Check size={14} /> : <X size={14} />}
              </div>
              <span
                className={`text-sm ${met ? "text-foreground" : "text-muted"}`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-sm text-muted leading-relaxed">{clinicalNote}</p>
      </div>
    </motion.div>
  );
}
