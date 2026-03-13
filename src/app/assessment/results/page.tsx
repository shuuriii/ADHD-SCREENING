"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useAssessment } from "@/contexts/AssessmentContext";
import ScoreSummary from "@/components/results/ScoreSummary";
import PresentationTypeCard from "@/components/results/PresentationType";
import DSM5CriteriaCard from "@/components/results/DSM5Criteria";
import GenderInsights from "@/components/results/GenderInsights";
import Recommendations from "@/components/results/Recommendations";
import Disclaimer from "@/components/results/Disclaimer";
import FocusTaskCard from "@/components/results/FocusTaskCard";
import ChronosTaskCard from "@/components/results/ChronosTaskCard";
import FocusQuestCard from "@/components/results/FocusQuestCard";
import PDFDownloadButton from "@/components/report/PDFDownloadButton";
import Button from "@/components/ui/Button";
import { RotateCcw, Gamepad2 } from "lucide-react";
import { saveQuestionnaireToBundle } from "@/lib/report-bundle";
import { saveQuestionnaireViaAPI } from "@/lib/api-client";
import type { AssessmentResult } from "@/questionnaire/types";

const PresentationPieChart = dynamic(
  () => import("@/components/results/charts/PresentationPieChart"),
  { ssr: false }
);

const DomainComparisonChart = dynamic(
  () => import("@/components/results/charts/DomainComparisonChart"),
  { ssr: false }
);

const DSM5FlagsChart = dynamic(
  () => import("@/components/results/charts/DSM5FlagsChart"),
  { ssr: false }
);

const GENDER_LABELS: Record<string, string> = {
  female: "Female",
  male: "Male",
  "non-binary": "Non-binary",
  "prefer-not-to-say": "Prefer not to say",
};

/** Try to recover results from sessionStorage if context is empty */
function recoverResult(): { result: AssessmentResult; userData: AssessmentResult["userData"] } | null {
  try {
    const raw = sessionStorage.getItem("adhd-assessment-v2");
    if (!raw) return null;
    const s = JSON.parse(raw);
    const result = s?.results;
    if (!result || typeof result !== "object") return null;
    return { result, userData: s.userData };
  } catch {
    return null;
  }
}

export default function ResultsPage() {
  const router = useRouter();
  const { state, dispatch } = useAssessment();
  const { results, userData } = state;
  const savedRef = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const contextResult = results;
  const [fallback, setFallback] = useState<ReturnType<typeof recoverResult>>(null);

  useEffect(() => {
    if (!contextResult) {
      const recovered = recoverResult();
      if (recovered) {
        setFallback(recovered);
      } else {
        // No results anywhere — redirect after a short delay
        const t = setTimeout(() => router.replace("/assessment/intake"), 1500);
        return () => clearTimeout(t);
      }
    }
  }, [contextResult, router]);

  const activeResult = contextResult ?? fallback?.result ?? null;
  const activeUserData = contextResult ? userData : (fallback?.userData ?? userData);

  useEffect(() => {
    if (!activeResult || savedRef.current) return;
    savedRef.current = true;
    // Save to unified report bundle (local)
    saveQuestionnaireToBundle("dsm5", activeResult);
    // Save questionnaire result via server-side API (fire-and-forget)
    const sessionId = localStorage.getItem("fayth-session-id");
    if (sessionId) {
      saveQuestionnaireViaAPI(sessionId, activeResult);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeResult]);

  if (!activeResult) return null;

  const handleStartNew = () => {
    dispatch({ type: "RESET" });
    router.push("/assessment/intake");
  };

  const displayName =
    activeUserData.name && activeUserData.name !== "Anonymous"
      ? activeUserData.name
      : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div ref={contentRef}>
      {/* ── Greeting & User Info ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {displayName ? (
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Hi {displayName}, here are your results
          </h1>
        ) : (
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Your Results
          </h1>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted mb-1">
          {displayName && <span className="font-medium text-foreground">{displayName}</span>}
          {activeUserData.age && (
            <span>Age {activeUserData.age}</span>
          )}
          {activeUserData.gender && (
            <span>{GENDER_LABELS[activeUserData.gender] ?? activeUserData.gender}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted mb-8">
          <span>DSM-5 Assessment</span>
          {activeResult.completedAt && (
            <span>
              Completed {new Date(activeResult.completedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </motion.div>

      {/* ── Score Summary (existing bars) ── */}
      {activeResult.domainA && activeResult.domainB && (
        <ScoreSummary domainA={activeResult.domainA} domainB={activeResult.domainB} />
      )}

      {/* ── Charts ── */}
      {activeResult.presentationType && activeResult.domainA && activeResult.domainB && (
        <PresentationPieChart
          presentationType={activeResult.presentationType}
          domainAPercentage={activeResult.domainA.percentage}
          domainBPercentage={activeResult.domainB.percentage}
        />
      )}

      {activeResult.domainA && activeResult.domainB && (
        <DomainComparisonChart
          domainA={activeResult.domainA}
          domainB={activeResult.domainB}
        />
      )}

      {activeResult.dsm5Criteria && (
        <DSM5FlagsChart criteria={activeResult.dsm5Criteria} />
      )}

      {/* ── Existing result cards ── */}
      {activeResult.presentationType && (
        <PresentationTypeCard result={activeResult.presentationType} />
      )}

      {activeResult.dsm5Criteria && activeResult.interpretation && (
        <DSM5CriteriaCard
          criteria={(activeResult as AssessmentResult).dsm5Criteria}
          clinicalNote={(activeResult as AssessmentResult).interpretation.clinicalNote}
        />
      )}

      <Disclaimer />
      <GenderInsights insights={activeResult.interpretation?.genderInsights ?? []} />
      <Recommendations items={activeResult.interpretation?.recommendations ?? []} />

      <FocusTaskCard />
      <ChronosTaskCard />
      <FocusQuestCard />

      </div>{/* end contentRef */}

      {/* ── Start Gamified Assessments CTA ── */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-sm border border-purple-200/60 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Gamepad2 size={24} className="text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-lg mb-1">
              Ready for the fun part?
            </h3>
            <p className="text-sm text-muted mb-4">
              Complete 3 short gamified cognitive tasks to get deeper insight into
              attention, impulse control, and time perception. Takes about 15 minutes total.
            </p>
            <a
              href="/assessment/chronos-task"
              className="inline-flex items-center justify-center rounded-xl font-medium px-6 py-3 text-base min-h-[44px] bg-[#fbbf24] text-foreground border-2 border-foreground shadow-[3px_3px_0_#1a2410] hover:shadow-[4px_4px_0_#1a2410] hover:-translate-x-px hover:-translate-y-px active:shadow-[1px_1px_0_#1a2410] active:translate-x-0.5 active:translate-y-0.5 transition-all duration-150"
            >
                <Gamepad2 size={16} className="mr-2" />
                Start Gamified Assessments
            </a>
          </div>
        </div>
      </div>

      {/* ── Bottom actions ── */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <PDFDownloadButton targetRef={contentRef} />
        <Button variant="secondary" onClick={handleStartNew}>
          <RotateCcw size={16} className="mr-2" />
          Start New Assessment
        </Button>
      </div>
    </div>
  );
}
