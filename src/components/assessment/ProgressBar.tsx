"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number;
  phaseLabel: string;
  questionLabel: string;
}

export default function ProgressBar({
  progress,
  phaseLabel,
  questionLabel,
}: ProgressBarProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-primary-600 uppercase tracking-wider">
          {phaseLabel}
        </span>
        <span className="text-xs text-muted">{questionLabel}</span>
      </div>
      <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>
      <div className="text-right mt-1">
        <span className="text-xs text-muted">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
