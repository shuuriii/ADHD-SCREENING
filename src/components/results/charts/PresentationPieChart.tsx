"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { motion } from "framer-motion";
import type { PresentationResult } from "@/questionnaire/types";

const COLORS: Record<string, string> = {
  combined: "#6C5CE7",
  inattentive: "#00B894",
  hyperactive: "#E17055",
  subthreshold: "#A29BFE",
};

const LABELS: Record<string, string> = {
  combined: "Combined",
  inattentive: "Inattentive",
  hyperactive: "Hyperactive",
  subthreshold: "Subthreshold",
};

interface Props {
  presentationType: PresentationResult;
  domainAPercentage: number;
  domainBPercentage: number;
}

export default function PresentationPieChart({ presentationType, domainAPercentage, domainBPercentage }: Props) {
  const data = [
    { name: "Inattention (A)", value: domainAPercentage },
    { name: "Hyperactivity (B)", value: domainBPercentage },
  ];

  const chartColors = ["#0984E3", "#E84393"];

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-border/50 p-5 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="font-semibold text-foreground mb-1">Symptom Profile</h3>
      <div className="flex items-center gap-2 mb-4">
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full text-white"
          style={{ backgroundColor: COLORS[presentationType.type] }}
        >
          {LABELS[presentationType.type]}
        </span>
        <span className="text-xs text-muted">{presentationType.description}</span>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={2}
              stroke="#fff"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={chartColors[i]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `${Number(value).toFixed(1)}%`}
              contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "13px" }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ fontSize: "13px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
