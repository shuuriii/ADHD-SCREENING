"use client";

import { motion } from "framer-motion";

export default function Recommendations({ items }: { items: string[] }) {
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-border/50 p-5 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <h3 className="font-semibold text-foreground mb-4">Next Steps</h3>
      <ol className="space-y-3">
        {items.map((item, i) => (
          <li key={item} className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <span className="text-sm text-muted leading-relaxed">{item}</span>
          </li>
        ))}
      </ol>
    </motion.div>
  );
}
