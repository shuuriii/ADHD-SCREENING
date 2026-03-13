"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { getBundle, type ReportBundle } from "@/lib/report-bundle";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import CombinedPDFDownloadButton from "@/components/report/CombinedPDFDownloadButton";

const AVATAR_EMOJI: Record<string, string> = {
  fox: "🦊", panda: "🐼", frog: "🐸", bunny: "🐰",
};

const CHECKLIST = [
  { key: "questionnaire", label: "Questionnaire", sub: "DSM-5 or ASRS" },
  { key: "gonogo",        label: "Go / No-Go",    sub: "Impulse control & attention" },
  { key: "chronos",       label: "Chronos Sort",  sub: "Time perception" },
  { key: "focusQuest",    label: "Focus Quest",   sub: "Working memory" },
] as const;

export default function MyReportPage() {
  const [bundle, setBundle] = useState<ReportBundle | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getBundle().then(setBundle);
  }, []);

  const avatar = bundle?.userData.petPreference
    ? AVATAR_EMOJI[bundle.userData.petPreference] ?? "🧠"
    : "🧠";

  const firstName = bundle?.userData.name && bundle.userData.name !== "Anonymous"
    ? bundle.userData.name.split(" ")[0]
    : null;

  const completedCount = bundle
    ? [
        bundle.questionnaire,
        bundle.games.gonogo,
        bundle.games.chronos,
        bundle.games.focusQuest,
      ].filter(Boolean).length
    : 0;

  const isComplete = (key: typeof CHECKLIST[number]["key"]) => {
    if (!bundle) return false;
    if (key === "questionnaire") return Boolean(bundle.questionnaire);
    return Boolean(bundle.games[key as keyof typeof bundle.games]);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div ref={contentRef}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

        {/* Back */}
        <Link href="/assessment/intake" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={14} />
          Back to intake
        </Link>

        {/* Heading */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-3">{avatar}</div>
          <h1 className="text-2xl font-bold text-foreground">
            {firstName ? `${firstName}'s Report` : "Your Report"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {completedCount}/4 sections complete
          </p>
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm divide-y divide-border/30 mb-8">
          {CHECKLIST.map(({ key, label, sub }) => {
            const done = isComplete(key);
            return (
              <div key={key} className="flex items-center gap-4 px-5 py-4">
                {done
                  ? <CheckCircle2 size={20} className="text-[#46a83c] shrink-0" />
                  : <Circle size={20} className="text-border shrink-0" />
                }
                <div>
                  <p className={`text-sm font-medium ${done ? "text-foreground" : "text-muted"}`}>{label}</p>
                  <p className="text-xs text-muted/70">{sub}</p>
                </div>
                {done && (
                  <span className="ml-auto text-[10px] font-semibold text-[#46a83c] bg-[#f3faf1] px-2 py-0.5 rounded-full">
                    Done
                  </span>
                )}
              </div>
            );
          })}
        </div>

      </motion.div>
      </div>{/* end contentRef */}

        {/* Download */}
        <div className="flex flex-col items-center gap-3" data-html2pdf-ignore>
          <CombinedPDFDownloadButton targetRef={contentRef} />
          {completedCount < 4 && (
            <p className="text-xs text-muted/60 text-center">
              Complete more tasks to add cognitive data to your report.
              <br />You can download after finishing just the questionnaire.
            </p>
          )}
        </div>

    </div>
  );
}
