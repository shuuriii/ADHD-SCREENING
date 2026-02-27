"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useAssessment } from "@/contexts/AssessmentContext";
import ScoreSummary from "@/components/results/ScoreSummary";
import PresentationTypeCard from "@/components/results/PresentationType";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { RotateCcw, Download, ArrowRight, Info } from "lucide-react";
import { saveQuestionnaireToBundle } from "@/lib/report-bundle";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";
import { saveQuestionnaireResult } from "@/lib/supabase/questionnaire-results";

const PartialPDFDownloadButton = dynamic(
  () => import("@/components/report/PartialPDFDownloadButton"),
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

export default function PartialResultsPage() {
  const router = useRouter();
  const { state, dispatch } = useAssessment();
  const { instrument, userData } = state;

  // Calculate partial results from current responses
  const calculatePartialResults = () => {
    // This would be implemented based on the current phase and responses
    // For now, we'll show a basic summary
    return {
      completedPhases: state.currentPhase,
      totalMainAnswered: Object.keys(state.responses).length,
      totalContextAnswered: Object.keys(state.contextResponses).length,
    };
  };

  const partialResults = calculatePartialResults();

  const handleContinue = () => {
    router.push("/assessment/questionnaire");
  };

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
          Your Partial Assessment
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
          You've completed {partialResults.totalMainAnswered} main questions
          {partialResults.totalContextAnswered > 0
            ? ` and ${partialResults.totalContextAnswered} context questions`
            : ""}
        </p>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-blue-50 rounded-2xl border border-blue-200 p-4 mb-6"
      >
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-foreground text-sm mb-1">
              Partial Results
            </h3>
            <p className="text-xs text-muted">
              This PDF includes only the sections you've completed. Continue your assessment
              for more comprehensive results and interpretations.
            </p>
          </div>
        </div>
      </motion.div>

      {/* PDF Download Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-border/50 p-6 mb-8"
      >
        <h2 className="font-semibold text-foreground mb-4">Download Your Report</h2>
        <PartialPDFDownloadButton
          completedPhases={state.currentPhase}
          responses={state.responses}
          contextResponses={state.contextResponses}
          userData={userData}
          instrument={instrument}
        />
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button onClick={handleContinue} variant="primary">
          <ArrowRight size={16} className="mr-2" />
          Continue Assessment
        </Button>
        <Button variant="secondary" onClick={handleStartNew}>
          <RotateCcw size={16} className="mr-2" />
          Start New Assessment
        </Button>
      </motion.div>
    </div>
  );
}
