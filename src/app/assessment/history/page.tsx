"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Clock, FileText, Trash2, Download, AlertTriangle } from "lucide-react";
import type { AssessmentResult } from "@/questionnaire/types";
import { secureStorage } from "@/lib/client-crypto";

const HISTORY_KEY = "adhd-assessment-history";

// Legacy ASRS entries may still exist in localStorage from before removal
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HistoryEntry = AssessmentResult | (Record<string, any> & { instrument: "asrs" });

function getRiskLabel(entry: HistoryEntry): string {
  if (entry.instrument === "asrs") {
    return (entry as Record<string, unknown>).partAHighRisk ? "High Risk" : "Low Risk";
  }
  return entry.presentationType.label;
}

function getRiskColor(entry: HistoryEntry): string {
  if (entry.instrument === "asrs") {
    return (entry as Record<string, unknown>).partAHighRisk
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await secureStorage.getItem(localStorage, HISTORY_KEY);
        if (raw) {
          const { safeParse, assessmentHistorySchema } = await import("@/lib/schemas");
          setHistory(safeParse(raw, assessmentHistorySchema) ?? []);
        }
      } catch {
        // localStorage unavailable
      }
    })();
  }, []);

  const clearHistory = () => {
    secureStorage.removeItem(localStorage, HISTORY_KEY);
    setHistory([]);
  };

  const handleDeleteAllData = async () => {
    setDeleting(true);
    try {
      const sessionId = localStorage.getItem("fayth-session-id");
      await fetch("/api/data/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      // Clear all local data
      secureStorage.removeItem(localStorage, HISTORY_KEY);
      secureStorage.removeItem(localStorage, "fayth-report-bundle");
      secureStorage.removeItem(localStorage, "focus-task-history");
      secureStorage.removeItem(localStorage, "chronos-sort-history");
      secureStorage.removeItem(localStorage, "focus-quest-history");
      localStorage.removeItem("fayth-session-id");
      try { sessionStorage.clear(); } catch { /* ignore */ }
      setHistory([]);
      setShowDeleteConfirm(false);
    } catch {
      // Deletion failed silently
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const sessionId = localStorage.getItem("fayth-session-id");
      const url = sessionId ? `/api/data/export?sessionId=${sessionId}` : "/api/data/export";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `fayth-data-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      // Export failed silently
    } finally {
      setExporting(false);
    }
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

      {/* Data Management Section */}
      <motion.div
        className="mt-12 pt-8 border-t border-border/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-sm font-semibold text-foreground mb-1">Your Data</h2>
        <p className="text-xs text-muted mb-4">
          Download or delete all your data stored on our servers and this device.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 transition-colors disabled:opacity-50"
          >
            <Download size={14} />
            {exporting ? "Exporting..." : "Export My Data"}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors"
          >
            <Trash2 size={14} />
            Delete All My Data
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Are you sure? This cannot be undone.
                </p>
                <p className="text-xs text-red-600 mt-1">
                  This will permanently delete all your screening results, game scores, and profile
                  data from both our servers and this device.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAllData}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {deleting ? "Deleting..." : "Yes, Delete Everything"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
