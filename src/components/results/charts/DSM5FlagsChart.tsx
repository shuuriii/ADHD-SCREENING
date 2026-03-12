"use client";

import { motion } from "framer-motion";
import type { DSM5Criteria } from "@/questionnaire/types";

interface Props {
  criteria: DSM5Criteria;
}

const FLAG_COLORS = ["#6C5CE7", "#00B894", "#0984E3", "#E17055"];

export default function DSM5FlagsChart({ criteria }: Props) {
  const data = [
    { name: "Symptom\nThreshold", met: criteria.meetsSymptomThreshold },
    { name: "Multiple\nSettings", met: criteria.multipleSettings },
    { name: "Before\nAge 12", met: criteria.beforeAge12 },
    { name: "Significant\nImpact", met: criteria.significantImpact },
  ];

  const metCount = data.filter((d) => d.met).length;

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-border/50 p-5 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <h3 className="font-semibold text-foreground mb-1">DSM-5 Criteria</h3>
      <p className="text-xs text-muted mb-4">
        {metCount} of 4 criteria met
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {data.map((item, i) => (
          <div
            key={i}
            className={`text-center p-4 rounded-xl border-2 transition-colors ${
              item.met
                ? "border-transparent"
                : "border-gray-100 bg-gray-50"
            }`}
            style={item.met ? { backgroundColor: FLAG_COLORS[i] + "18", borderColor: FLAG_COLORS[i] + "40" } : undefined}
          >
            <div
              className={`text-2xl font-bold mb-1 ${item.met ? "" : "text-gray-300"}`}
              style={item.met ? { color: FLAG_COLORS[i] } : undefined}
            >
              {item.met ? "\u2713" : "\u2717"}
            </div>
            <div className="text-xs font-medium text-foreground whitespace-pre-line leading-tight">
              {item.name}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
