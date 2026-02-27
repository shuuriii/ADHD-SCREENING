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
import { RotateCcw, Download, Target, ArrowLeft } from "lucide-react";
import { saveQuestionnaireResult } from "@/lib/supabase/questionnaire-results";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";
import { saveQuestionnaireToBundle } from "@/lib/report-bundle";
import { generateAndUploadPDF } from "@/lib/upload-report-pdf";

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
  const { instrument, results, asrsResult, userData, completedQuestionnaires } = state;

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
    if (sessionId && supabaseConfigured) {
      createClient()
        .auth.getUser()
        .then(({ data }) => {
          saveQuestionnaireResult(activeResult, sessionId, data.user?.id ?? null);
        })
        .catch((err) => {
          console.error("[Auth] Failed to get user:", err);
        });
      // Generate PDF and upload to Supabase Storage (fire-and-forget)
      generateAndUploadPDF(activeResult, sessionId);
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

      {/* Recommendation for completing both questionnaires */}
      {((instrument === "dsm5" && !completedQuestionnaires.asrs) ||
        (instrument === "asrs" && !completedQuestionnaires.dsm5)) && (
        <motion.div
          className="bg-blue-50 rounded-2xl p-5 mb-6 border border-blue-200/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-start gap-3">
            <Target size={20} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Enhance your insights with both questionnaires
              </h3>
              <p className="text-sm text-muted mb-3">
                {instrument === "dsm5"
                  ? "You've completed the DSM-5 assessment. Add the quick ASRS screener (2 min) for a more comprehensive perspective."
                  : "You've completed the ASRS screener. Add the comprehensive DSM-5 assessment (~15 min) for detailed diagnostic insights."}
              </p>
              <Link href="/assessment/hub">
                <Button variant="secondary" size="sm">
                  Go Back to Assessment Hub
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Cognitive games recommendation */}
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
              Strengthen your report with cognitive tasks
            </h3>
            <p className="text-sm text-muted mb-3">
              Optional: Try the Go/No-Go attention task or other cognitive measures.
              These add objective behavioral data to your assessment.
            </p>
            <Link href="/assessment/hub">
              <Button variant="secondary" size="sm">
                Back to Assessment Hub
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
        <Button
          variant="ghost"
          onClick={() => router.push("/assessment/hub")}
          className="flex-1"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Hub
        </Button>
        <div className="flex gap-3 flex-1">
          {instrument === "dsm5" && results && (
            <PDFDownloadButton results={results} />
          )}
          {instrument === "asrs" && asrsResult && (
            <ASRSPDFDownloadButton results={asrsResult} />
          )}
          <Button variant="secondary" onClick={handleStartNew} className="flex-1">
            <RotateCcw size={16} className="mr-2" />
            Start New
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
