"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export default function Card({
  children,
  className = "",
  animate = true,
}: CardProps) {
  if (!animate) {
    return (
      <div className={`bg-white rounded-2xl shadow-md p-6 ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`bg-white rounded-2xl shadow-md p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}
