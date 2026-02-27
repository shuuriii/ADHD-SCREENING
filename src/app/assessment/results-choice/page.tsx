"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAssessment } from "@/contexts/AssessmentContext";
import Button from "@/components/ui/Button";
import { Download, ArrowRight, Mail } from "lucide-react";
import Link from "next/link";

export default function ResultsChoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, dispatch } = useAssessment();
  const { instrument } = state;

  const fromContext = searchParams.get("from") === "context";

  const handleDownloadPartial = () => {
    // Go to report page where they can download
    router.push("/assessment/my-report");
  };

  const handleContinueAssessment = () => {
    // Continue to next phase
    if (fromContext && state.followUpQuestions.length > 0) {
      // Show phase transition then go to followups
      dispatch({ type: "SET_PHASE", payload: "followups" });
    }
    router.push("/assessment/questionnaire");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-4">
          What Would You Like to Do?
        </h1>
        <p className="text-muted mb-8">
          You've completed the initial screening. You can download your partial results now,
          or continue for a more comprehensive assessment.
        </p>
      </motion.div>

      <div className="grid gap-4">
        {/* Option 1: Download Partial Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={handleDownloadPartial}
        >
          <div className="flex items-start gap-4">
            <div className="bg-blue-600 rounded-lg p-3 text-white flex-shrink-0">
              <Download size={24} />
            </div>
            <div className="flex-grow">
              <h2 className="font-semibold text-foreground text-lg mb-2">
                Download Partial Report
              </h2>
              <p className="text-sm text-muted mb-4">
                Get a PDF report with your current results. You can continue later or save this for your records.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleDownloadPartial}
              >
                Download PDF
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Option 2: Continue for Full Assessment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={handleContinueAssessment}
        >
          <div className="flex items-start gap-4">
            <div className="bg-green-600 rounded-lg p-3 text-white flex-shrink-0">
              <ArrowRight size={24} />
            </div>
            <div className="flex-grow">
              <h2 className="font-semibold text-foreground text-lg mb-2">
                Continue for Full Assessment
              </h2>
              <p className="text-sm text-muted mb-4">
                Complete the full assessment for more detailed insights. After completion, you'll get a comprehensive report sent to your email.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={handleContinueAssessment}
              >
                Continue
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-amber-50 rounded-2xl border border-amber-200 p-4"
        >
          <div className="flex items-start gap-3">
            <Mail size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground text-sm mb-1">
                💡 Full Assessment Benefit
              </h3>
              <p className="text-xs text-muted">
                Complete the full assessment to receive a comprehensive clinical report emailed to you free of cost.
                It includes personalized recommendations based on your complete profile.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
