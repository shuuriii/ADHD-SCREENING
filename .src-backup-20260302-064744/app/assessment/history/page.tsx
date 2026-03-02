"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Clock, FileText, Trash2 } from "lucide-react";
import type { AssessmentResult, ASRSResult } from "@/questionnaire/types";

const HISTORY_KEY = "adhd-assessment-history";
type HistoryEntry = AssessmentResult | ASRSResult;

function getRiskLabel(entry: HistoryEntry): string {
  if (entry.instrument === "asrs") {
    return entry.partAHighRisk ? "High Risk" : "Low Risk";
  }
  return entry.presentationType.label;
}

function getRiskColor(entry: HistoryEntry): string {
  if (entry.instrument === "asrs") {
    return entry.partAHighRisk
      ? "bg-red-100 text-red-700"
      : "bg-green-100 text-green-700";
  }
  const t = entry.presentationType.type;
  if (t === "combined") return "bg-red-100 text-red-700";
  if (t === "inattentive" || t === "hyperactive") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      // localStorage unavailable
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Assessment History
            </h1>
            <p className="text-sm text-muted">
              Your past screening results, stored locally on this device.
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-sm text-muted hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <Trash2 size={14} />
              Clear
            </button>
          )}
        </div>
      </motion.div>

      {history.length === 0 ? (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Clock size={40} className="mx-auto text-muted/40 mb-4" />
          <p className="text-muted mb-1">No assessments yet</p>
          <p className="text-sm text-muted mb-6">
            Complete a screening to see your results here.
          </p>
          <Link href="/assessment/intake">
            <Button size="sm">Start Screening</Button>
          </Link>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map((entry, i) => (
            <motion.div
              key={entry.assessmentId}
              className="bg-white rounded-2xl shadow-sm border border-border/50 p-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-primary-600" />
                  <span className="font-semibold text-foreground">
                    {entry.instrument === "asrs" ? "ASRS v1.1" : "DSM-5"}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${getRiskColor(entry)}`}
                  >
                    {getRiskLabel(entry)}
                  </span>
                </div>
                <span className="text-xs text-muted">
                  {new Date(entry.completedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-muted mb-0.5">Inattention</div>
                  <div className="font-semibold">
                    {entry.domainA.percentage}%
                    <span className="text-xs font-normal text-muted ml-1">
                      ({entry.domainA.severity})
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-muted mb-0.5">Hyperactivity</div>
                  <div className="font-semibold">
                    {entry.domainB.percentage}%
                    <span className="text-xs font-normal text-muted ml-1">
                      ({entry.domainB.severity})
                    </span>
                  </div>
                </div>
              </div>

              {entry.userData.name && entry.userData.name !== "Anonymous" && (
                <p className="text-xs text-muted mt-2">
                  {entry.userData.name}, age {entry.userData.age}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
