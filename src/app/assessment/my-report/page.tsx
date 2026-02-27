"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getBundle, saveQuestionnaireToBundle, type ReportBundle } from "@/lib/report-bundle";
import { ArrowLeft, CheckCircle2, Circle, ArrowRight, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import SafePDFDownloadWrapper from "@/components/report/SafePDFDownloadWrapper";
import EmailReportDialog from "@/components/assessment/EmailReportDialog";
import { sendAssessmentReportEmail } from "@/lib/email-service";
import { useAssessment } from "@/contexts/AssessmentContext";

const CombinedPDFDownloadButton = dynamic(
  () => import("@/components/report/CombinedPDFDownloadButton"),
  {
    ssr: false,
    loading: () => (
      <div className="h-10 w-56 bg-border/30 rounded-xl animate-pulse" />
    ),
  }
);

const AVATAR_EMOJI: Record<string, string> = {
  fox: "🦊", panda: "🐼", frog: "🐸", bunny: "🐰",
};

const CHECKLIST = [
  { key: "questionnaire", label: "Questionnaire", sub: "DSM-5 or ASRS" },
  { key: "gonogo",        label: "Go / No-Go",    sub: "Impulse control & attention" },
  { key: "chronos",       label: "Chronos Sort",  sub: "Time perception" },
  { key: "focusQuest",    label: "Focus Quest",   sub: "Working memory" },
] as const;

const ASSESSMENT_LINKS: Record<string, string> = {
  gonogo: "/assessment/gonogo",
  chronos: "/assessment/chronos-task",
  focusQuest: "/assessment/focus-quest",
};

export default function MyReportPage() {
  const router = useRouter();
  const { state } = useAssessment();
  const [bundle, setBundle] = useState<ReportBundle | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBundle(getBundle());
  }, []);

  // Save results to bundle if they exist in state but not in bundle yet
  useEffect(() => {
    if (!mounted) return;
    if (state.results && !bundle?.questionnaire) {
      saveQuestionnaireToBundle("dsm5", state.results);
      setBundle(getBundle());
    } else if (state.asrsResult && !bundle?.questionnaire) {
      saveQuestionnaireToBundle("asrs", state.asrsResult);
      setBundle(getBundle());
    }
  }, [state.results, state.asrsResult, bundle?.questionnaire, mounted]);

  const handleEmailSubmit = async (email: string): Promise<boolean> => {
    try {
      const instrument = bundle?.questionnaire?.instrument ?? "dsm5";
      const result = await sendAssessmentReportEmail(
        email,
        bundle?.userData || { name: "", gender: null, age: null, petPreference: null },
        instrument,
        `Complete Assessment Report`,
        "Your comprehensive assessment report is attached."
      );
      return result.success;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  };

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

  // Avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="text-4xl mb-3">🧠</div>
          <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto mb-4 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto animate-pulse" />
        </div>
      </div>
    );
  }

  const handleContinueAssessment = (path: string) => {
    router.push(path);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

        {/* Back */}
        <Link href="/assessment/map" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={14} />
          Back to map
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
            const linkPath = ASSESSMENT_LINKS[key];
            return (
              <div key={key} className="flex items-center gap-4 px-5 py-4">
                {done
                  ? <CheckCircle2 size={20} className="text-[#46a83c] shrink-0" />
                  : <Circle size={20} className="text-border shrink-0" />
                }
                <div className="flex-1">
                  <p className={`text-sm font-medium ${done ? "text-foreground" : "text-muted"}`}>{label}</p>
                  <p className="text-xs text-muted/70">{sub}</p>
                </div>
                {done && (
                  <span className="ml-auto text-[10px] font-semibold text-[#46a83c] bg-[#f3faf1] px-2 py-0.5 rounded-full">
                    Done
                  </span>
                )}
                {!done && linkPath && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleContinueAssessment(linkPath)}
                    className="ml-auto"
                  >
                    Continue
                    <ArrowRight size={14} className="ml-1.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Download & Email */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <SafePDFDownloadWrapper>
              <CombinedPDFDownloadButton />
            </SafePDFDownloadWrapper>
            {bundle?.questionnaire && (
              <Button
                variant="secondary"
                onClick={() => setShowEmailDialog(true)}
                className="flex-1 sm:flex-none"
              >
                <Mail size={16} className="mr-2" />
                Email Report
              </Button>
            )}
          </div>
          {completedCount < 4 && (
            <p className="text-xs text-muted/60 text-center">
              Complete more tasks to add cognitive data to your report.
              <br />You can download after finishing just the questionnaire.
            </p>
          )}
        </div>

        <EmailReportDialog
          isOpen={showEmailDialog}
          onClose={() => setShowEmailDialog(false)}
          onSubmit={handleEmailSubmit}
          userName={bundle?.userData.name !== "Anonymous" ? bundle?.userData.name : undefined}
        />

      </motion.div>
    </div>
  );
}
