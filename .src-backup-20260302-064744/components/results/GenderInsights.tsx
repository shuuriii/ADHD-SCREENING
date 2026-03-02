"use client";

import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

export default function GenderInsights({
  insights,
}: {
  insights: string[];
}) {
  if (insights.length === 0) return null;

  return (
    <motion.div
      className="bg-primary-50 border border-primary-200 rounded-2xl p-5 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={18} className="text-primary-600" />
        <h3 className="font-semibold text-primary-800">
          Gender-Specific Insights
        </h3>
      </div>
      <ul className="space-y-2">
        {insights.map((insight) => (
          <li
            key={insight}
            className="text-sm text-primary-700 leading-relaxed flex items-start gap-2"
          >
            <span className="text-primary-400 mt-1 shrink-0">&bull;</span>
            {insight}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
