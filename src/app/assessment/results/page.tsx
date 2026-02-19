"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useAssessment } from "@/contexts/AssessmentContext";
import ScoreSummary from "@/components/results/ScoreSummary";
import PresentationTypeCard from "@/components/results/PresentationType";
import DSM5CriteriaCard from "@/components/results/DSM5Criteria";
import ASRSPartACard from "@/components/results/ASRSPartACard";
import GenderInsights from "@/components/results/GenderInsights";
import Recommendations from "@/components/results/Recommendations";
import FocusTaskCard from "@/components/results/FocusTaskCard";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { RotateCcw, Download, Target } from "lucide-react";
import { saveQuestionnaireResult } from "@/lib/supabase/questionnaire-results";
import { createClient } from "@/lib/supabase/client";
import { saveQuestionnaireToBundle } from "@/lib/report-bundle";

const PDFDownloadButton = dynamic(
  () => import("@/components/report/PDFDownloadButton"),
  {
    ssr: false,
    loading: () => (
      <Button disabled>
        <Download size={16} className="mr-2" />
        Preparing PDF...
      </Button>
    ),
  }
);

const ASRSPDFDownloadButton = dynamic(
  () => import("@/components/report/ASRSPDFDownloadButton"),
  {
    ssr: false,
    loading: () => (
      <Button disabled>
        <Download size={16} className="mr-2" />
        Preparing PDF...
      </Button>
    ),
  }
);

export default function ResultsPage() {
  const router = useRouter();
  const { state, dispatch } = useAssessment();
  const { instrument, results, asrsResult, userData } = state;

  const activeResult = instrument === "asrs" ? asrsResult : results;

  useEffect(() => {
    if (!activeResult) {
      router.replace("/assessment/intake");
    }
  }, [activeResult, router]);

  useEffect(() => {
    if (!activeResult) return;
    // Save to unified report bundle (local)
    saveQuestionnaireToBundle(instrument, activeResult);
    // Save questionnaire result to Supabase once on mount (fire-and-forget)
    const sessionId = localStorage.getItem("fayth-session-id");
    if (sessionId) {
      createClient().auth.getUser().then(({ data }) => {
        saveQuestionnaireResult(activeResult, sessionId, data.user?.id ?? null);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!activeResult) return null;

  const handleStartNew = () => {
    dispatch({ type: "RESET" });
    router.push("/assessment/intake");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-1">
          Your Results
        </h1>
        <p className="text-xs text-muted mb-1">
          {instrument === "asrs" ? "ASRS v1.1 Screener" : "DSM-5 Assessment"}
        </p>
        {userData.name && userData.name !== "Anonymous" && (
          <p className="text-muted mb-2">
            {userData.name}, age {userData.age}
          </p>
        )}
        <p className="text-xs text-muted mb-8">
          Completed {new Date(activeResult.completedAt).toLocaleDateString()}
        </p>
      </motion.div>

      <ScoreSummary domainA={activeResult.domainA} domainB={activeResult.domainB} />
      <PresentationTypeCard result={activeResult.presentationType} />

      {instrument === "asrs" && asrsResult ? (
        <ASRSPartACard result={asrsResult} />
      ) : results ? (
        <DSM5CriteriaCard
          criteria={results.dsm5Criteria}
          clinicalNote={results.interpretation.clinicalNote}
        />
      ) : null}

      <GenderInsights insights={activeResult.interpretation.genderInsights} />
      <Recommendations items={activeResult.interpretation.recommendations} />

      <FocusTaskCard />

      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-border/50 p-5 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-start gap-3">
          <Target size={20} className="text-primary-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Want an additional cognitive measure?
            </h3>
            <p className="text-sm text-muted mb-3">
              Try the Go/No-Go attention task — 15 minutes, no account needed.
              It measures visual attention and impulse control with objective behavioral data.
            </p>
            <Link href="/assessment/focus-task">
              <Button variant="secondary" size="sm">
                Start Focus Task
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="flex flex-col sm:flex-row gap-3 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {instrument === "dsm5" && results && (
          <PDFDownloadButton results={results} />
        )}
        {instrument === "asrs" && asrsResult && (
          <ASRSPDFDownloadButton results={asrsResult} />
        )}
        <Button variant="secondary" onClick={handleStartNew}>
          <RotateCcw size={16} className="mr-2" />
          Start New Assessment
        </Button>
      </motion.div>
    </div>
  );
}
