"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";
import type { DomainScore } from "@/questionnaire/types";

interface Props {
  domainA: DomainScore;
  domainB: DomainScore;
}

export default function DomainComparisonChart({ domainA, domainB }: Props) {
  const data = [
    {
      name: "Inattention (A)",
      score: domainA.totalScore,
      max: domainA.maxScore,
      clinical: domainA.clinicalCount,
      severity: domainA.severity,
    },
    {
      name: "Hyperactivity (B)",
      score: domainB.totalScore,
      max: domainB.maxScore,
      clinical: domainB.clinicalCount,
      severity: domainB.severity,
    },
  ];

  const colors = ["#0984E3", "#E84393"];

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm border border-border/50 p-5 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h3 className="font-semibold text-foreground mb-1">Domain Score Comparison</h3>
      <p className="text-xs text-muted mb-4">Raw scores out of {domainA.maxScore} per domain</p>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={48}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#636E72" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, domainA.maxScore]}
              tick={{ fontSize: 12, fill: "#636E72" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "13px" }}
              formatter={(value) => [`${value} / ${domainA.maxScore}`, "Score"]}
            />
            <Bar dataKey="score" radius={[8, 8, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-4 mt-3 text-xs text-muted">
        <span>
          A clinical: <span className="font-semibold text-foreground">{domainA.clinicalCount}/{domainA.totalQuestions}</span>
        </span>
        <span>
          B clinical: <span className="font-semibold text-foreground">{domainB.clinicalCount}/{domainB.totalQuestions}</span>
        </span>
      </div>
    </motion.div>
  );
}
