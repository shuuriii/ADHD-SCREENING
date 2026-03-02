"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import type { ASRSResult } from "@/questionnaire/types";
import { ASRS_PART_A_HIGH_RISK_THRESHOLD } from "@/questionnaire/asrs-questions";

interface ASRSPartACardProps {
  result: ASRSResult;
}

export default function ASRSPartACard({ result }: ASRSPartACardProps) {
  const { partAShadedCount, partAHighRisk, dsm5Criteria } = result;

  const criteriaItems = [
    {
      met: partAHighRisk,
      label: `Part A shaded count: ${partAShadedCount}/6 (threshold: ${ASRS_PART_A_HIGH_RISK_THRESHOLD}+)`,
    },
    {
      met: dsm5Criteria.multipleSettings,
      label: "Symptoms present in multiple settings",
    },
    {
      met: dsm5Criteria.beforeAge12,
      label: "Some symptoms present before age 12",
    },
    {
      met: dsm5Criteria.significantImpact,
      label: "Significant impact on daily functioning",
    },
  ];

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-border/50 p-5 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h3 className="font-semibold text-foreground mb-4">
        ASRS v1.1 Screening Criteria
      </h3>
      <div className="space-y-3">
        {criteriaItems.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                item.met
                  ? "bg-severity-low/20 text-severity-low"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {item.met ? <Check size={14} /> : <X size={14} />}
            </div>
            <span
              className={`text-sm ${item.met ? "text-foreground" : "text-muted"}`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-sm text-muted leading-relaxed">
          {result.interpretation.clinicalNote}
        </p>
      </div>
    </motion.div>
  );
}
