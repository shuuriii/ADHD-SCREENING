"use client";

import { motion } from "framer-motion";

interface ContextQuestionProps {
  questionId: string;
  options: { value: string; label: string }[];
  value: string | undefined;
  onChange: (questionId: string, value: string) => void;
}

export default function ContextQuestion({
  questionId,
  options,
  value,
  onChange,
}: ContextQuestionProps) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <motion.button
            key={opt.value}
            type="button"
            onClick={() => onChange(questionId, opt.value)}
            whileTap={{ scale: 0.97 }}
            animate={
              isSelected
                ? {
                    boxShadow: [
                      "0 0 0px rgba(168,85,247,0)",
                      "0 0 16px rgba(168,85,247,0.3)",
                      "0 0 6px rgba(168,85,247,0.15)",
                    ],
                  }
                : { boxShadow: "0 0 0px rgba(168,85,247,0)" }
            }
            transition={{ duration: 0.3 }}
            className={`
              w-full min-h-[44px] px-5 py-4 rounded-xl border-2 text-left text-sm font-medium
              transition-colors cursor-pointer
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
              ${
                isSelected
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-border bg-white text-foreground hover:border-primary-300 hover:bg-primary-50/50"
              }
            `}
          >
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}
