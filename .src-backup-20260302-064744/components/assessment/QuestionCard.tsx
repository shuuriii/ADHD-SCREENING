"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface QuestionCardProps {
  questionKey: string;
  questionNumber: number;
  text: string;
  helpText?: string;
  children: ReactNode;
}

export default function QuestionCard({
  questionKey,
  questionNumber,
  text,
  helpText,
  children,
}: QuestionCardProps) {
  return (
    <motion.div
      key={questionKey}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-white rounded-2xl shadow-md p-6 sm:p-8"
    >
      <span className="text-xs font-medium text-primary-500 uppercase tracking-wider">
        Question {questionNumber}
      </span>
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mt-2 mb-2 leading-relaxed">
        {text}
      </h2>
      {helpText && (
        <p className="text-sm text-muted italic mb-6">{helpText}</p>
      )}
      {!helpText && <div className="mb-6" />}
      {children}
    </motion.div>
  );
}
