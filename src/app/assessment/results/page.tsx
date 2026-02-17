"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useAssessment } from "@/contexts/AssessmentContext";
import Disclaimer from "@/components/results/Disclaimer";
import ScoreSummary from "@/components/results/ScoreSummary";
import PresentationTypeCard from "@/components/results/PresentationType";
import DSM5CriteriaCard from "@/components/results/DSM5Criteria";
import GenderInsights from "@/components/results/GenderInsights";
import Recommendations from "@/components/results/Recommendations";
import Button from "@/components/ui/Button";
import { RotateCcw, Download } from "lucide-react";

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

export default function ResultsPage() {
  const router = useRouter();
  const { state, dispatch } = useAssessment();
  const { results, userData } = state;

  useEffect(() => {
    if (!results) {
      router.replace("/assessment/intake");
    }
  }, [results, router]);

  if (!results) return null;

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
        {userData.name && userData.name !== "Anonymous" && (
          <p className="text-muted mb-2">
            {userData.name}, age {userData.age}
          </p>
        )}
        <p className="text-xs text-muted mb-8">
          Completed {new Date(results.completedAt).toLocaleDateString()}
        </p>
      </motion.div>

      <Disclaimer />
      <ScoreSummary domainA={results.domainA} domainB={results.domainB} />
      <PresentationTypeCard result={results.presentationType} />
      <DSM5CriteriaCard
        criteria={results.dsm5Criteria}
        clinicalNote={results.interpretation.clinicalNote}
      />
      <GenderInsights insights={results.interpretation.genderInsights} />
      <Recommendations items={results.interpretation.recommendations} />

      <motion.div
        className="flex flex-col sm:flex-row gap-3 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <PDFDownloadButton results={results} />
        <Button variant="secondary" onClick={handleStartNew}>
          <RotateCcw size={16} className="mr-2" />
          Start New Assessment
        </Button>
      </motion.div>
    </div>
  );
}
