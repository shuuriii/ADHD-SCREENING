"use client";

import { motion } from "framer-motion";
import { LIKERT_LABELS, type LikertValue } from "@/questionnaire/types";

interface LikertScaleProps {
  questionId: string;
  value: LikertValue | undefined;
  onChange: (questionId: string, value: LikertValue) => void;
}

const likertOptions: LikertValue[] = [0, 1, 2, 3, 4];

export default function LikertScale({
  questionId,
  value,
  onChange,
}: LikertScaleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Select your response"
      className="flex flex-col sm:flex-row gap-2 sm:gap-3"
    >
      {likertOptions.map((opt) => {
        const isSelected = value === opt;
        return (
          <motion.button
            key={opt}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(questionId, opt)}
            whileTap={{ scale: 0.95 }}
            animate={
              isSelected
                ? {
                    boxShadow: [
                      "0 0 0px rgba(168,85,247,0)",
                      "0 0 20px rgba(168,85,247,0.4)",
                      "0 0 8px rgba(168,85,247,0.2)",
                    ],
                  }
                : { boxShadow: "0 0 0px rgba(168,85,247,0)" }
            }
            transition={{ duration: 0.3 }}
            className={`
              flex-1 min-h-[44px] px-4 py-3 rounded-xl border-2 text-sm font-medium
              transition-colors cursor-pointer
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
              ${
                isSelected
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-border bg-white text-foreground hover:border-primary-300 hover:bg-primary-50/50"
              }
            `}
          >
            {LIKERT_LABELS[opt]}
          </motion.button>
        );
      })}
    </div>
  );
}
