"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LIKERT_LABELS, type LikertValue } from "@/questionnaire/types";
import { useState } from "react";
import { Check } from "lucide-react";

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
  const [justSelected, setJustSelected] = useState<LikertValue | null>(null);

  const handleClick = (opt: LikertValue) => {
    setJustSelected(opt);
    onChange(questionId, opt);
    setTimeout(() => setJustSelected(null), 600);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Select your response"
      className="flex flex-col sm:flex-row gap-2 sm:gap-3"
    >
      {likertOptions.map((opt) => {
        const isSelected = value === opt;
        const isJust = justSelected === opt;

        return (
          <motion.button
            key={opt}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => handleClick(opt)}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.03, y: -2 }}
            animate={
              isJust
                ? {
                    scale: [1, 1.08, 1],
                    boxShadow: [
                      "0 0 0px rgba(168,85,247,0)",
                      "0 0 30px rgba(168,85,247,0.5)",
                      "0 0 12px rgba(168,85,247,0.2)",
                    ],
                  }
                : isSelected
                  ? {
                      boxShadow: "0 0 12px rgba(168,85,247,0.2)",
                    }
                  : {
                      scale: 1,
                      boxShadow: "0 0 0px rgba(168,85,247,0)",
                    }
            }
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`
              relative flex-1 min-h-[44px] px-4 py-3 rounded-xl border-2 text-sm font-medium
              transition-colors cursor-pointer overflow-hidden
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
              ${
                isSelected
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-border bg-white text-foreground hover:border-primary-300 hover:bg-primary-50/50"
              }
            `}
          >
            {/* Ripple effect on select */}
            <AnimatePresence>
              {isJust && (
                <motion.div
                  className="absolute inset-0 bg-primary-200/40 rounded-xl"
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{ transformOrigin: "center" }}
                />
              )}
            </AnimatePresence>

            <span className="relative z-10 flex items-center justify-center gap-1.5">
              <AnimatePresence>
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <Check size={14} className="text-primary-600" />
                  </motion.span>
                )}
              </AnimatePresence>
              {LIKERT_LABELS[opt]}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
