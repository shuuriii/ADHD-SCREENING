"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useAssessment } from "@/contexts/AssessmentContext";
import { dsm5Questions } from "@/questionnaire/dsm5-questions";
import { asrsQuestions } from "@/questionnaire/asrs-questions";
import { contextQuestions } from "@/questionnaire/context-questions";
import type { LikertValue } from "@/questionnaire/types";
import LikertScale from "@/components/assessment/LikertScale";
import ContextQuestion from "@/components/assessment/ContextQuestion";
import QuestionCard from "@/components/assessment/QuestionCard";
import ProgressBar from "@/components/assessment/ProgressBar";
import PhaseTransition from "@/components/assessment/PhaseTransition";
import MilestoneAnimation from "@/components/assessment/MilestoneAnimation";
import Button from "@/components/ui/Button";
import { ChevronLeft, X } from "lucide-react";

const TOTAL_CONTEXT = 3;

export default function QuestionnairePage() {
  const router = useRouter();
  const {
    state,
    dispatch,
    calculateAndSetResults,
    calculateAndSetASRSResults,
    computeFollowUps,
  } = useAssessment();
  const {
    currentPhase,
    currentQuestionIndex,
    instrument,
    responses,
    contextResponses,
    followUpResponses,
    followUpQuestions,
  } = state;

  const questions = useMemo(
    () => (instrument === "asrs" ? asrsQuestions : dsm5Questions),
    [instrument]
  );
  const TOTAL_MAIN = questions.length;
  const MILESTONE_INDEX =
    instrument === "asrs" ? 5 : 14; // Part A ends at Q6 (index 5), Domain A at Q15 (index 14)

  const [showPhaseTransition, setShowPhaseTransition] = useState(false);
  const [phaseTransitionData, setPhaseTransitionData] = useState({
    title: "",
    subtitle: "",
  });
  const [showMilestone, setShowMilestone] = useState(false);

  // Redirect if no user data
  useEffect(() => {
    if (!state.userData.gender && currentPhase !== "results") {
      router.replace("/assessment/intake");
    }
  }, [state.userData.gender, currentPhase, router]);

  // Calculate progress
  const getProgress = () => {
    const totalFollowUps = followUpQuestions.length || 1;
    switch (currentPhase) {
      case "main":
        return (currentQuestionIndex / TOTAL_MAIN) * 70;
      case "context":
        return 70 + (currentQuestionIndex / TOTAL_CONTEXT) * 20;
      case "followups":
        return 90 + (currentQuestionIndex / totalFollowUps) * 10;
      default:
        return 0;
    }
  };

  const handleMainResponse = useCallback(
    (questionId: string, value: LikertValue) => {
      dispatch({
        type: "RECORD_RESPONSE",
        payload: { questionId, value },
      });

      // Check for milestone
      if (currentQuestionIndex === MILESTONE_INDEX) {
        setShowMilestone(true);
        setTimeout(() => setShowMilestone(false), 1500);
      }

      // Auto-advance after delay
      setTimeout(() => {
        if (currentQuestionIndex < TOTAL_MAIN - 1) {
          dispatch({ type: "NEXT_QUESTION" });
        } else {
          // After main questionnaire, show choice to continue or download
          router.push("/assessment/results-choice");
        }
      }, 350);
    },
    [currentQuestionIndex, dispatch, TOTAL_MAIN, MILESTONE_INDEX]
  );

  const handleContextResponse = useCallback(
    (questionId: string, value: string) => {
      dispatch({
        type: "RECORD_CONTEXT_RESPONSE",
        payload: { questionId, value },
      });

      setTimeout(() => {
        if (currentQuestionIndex < TOTAL_CONTEXT - 1) {
          dispatch({ type: "NEXT_QUESTION" });
        } else {
          // After context questions, show choice to continue or download
          computeFollowUps();
          router.push("/assessment/results-choice?from=context");
        }
      }, 350);
    },
    [currentQuestionIndex, dispatch, computeFollowUps]
  );

  const finishAssessment = useCallback(() => {
    if (instrument === "asrs") {
      calculateAndSetASRSResults();
    } else {
      calculateAndSetResults();
    }
    router.push("/assessment/my-report");
  }, [instrument, calculateAndSetASRSResults, calculateAndSetResults, router]);

  const handleFollowUpResponse = useCallback(
    (questionId: string, value: LikertValue) => {
      dispatch({
        type: "RECORD_FOLLOWUP_RESPONSE",
        payload: { questionId, value },
      });

      setTimeout(() => {
        if (currentQuestionIndex < followUpQuestions.length - 1) {
          dispatch({ type: "NEXT_QUESTION" });
        } else {
          finishAssessment();
        }
      }, 350);
    },
    [
      currentQuestionIndex,
      followUpQuestions.length,
      dispatch,
      finishAssessment,
    ]
  );

  const handlePhaseTransitionComplete = useCallback(() => {
    setShowPhaseTransition(false);
    if (currentPhase === "main") {
      dispatch({ type: "SET_PHASE", payload: "context" });
    } else if (currentPhase === "context") {
      if (state.followUpQuestions.length > 0 || followUpQuestions.length > 0) {
        dispatch({ type: "SET_PHASE", payload: "followups" });
      } else {
        finishAssessment();
      }
    }
  }, [
    currentPhase,
    dispatch,
    state.followUpQuestions.length,
    followUpQuestions.length,
    finishAssessment,
  ]);

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      dispatch({ type: "PREVIOUS_QUESTION" });
    }
  };

  const handleQuit = () => {
    const confirm = window.confirm(
      "You'll be able to download a report of your answers so far. Continue?"
    );
    if (confirm) {
      router.push("/assessment/partial-results");
    }
  };

  // Phase labels
  const getPhaseLabel = () => {
    switch (currentPhase) {
      case "main": {
        if (instrument === "asrs") {
          const q = asrsQuestions[currentQuestionIndex];
          return q?.part === "A"
            ? "Part A — Quick Screener"
            : "Part B — Full Screener";
        }
        const q = dsm5Questions[currentQuestionIndex];
        return q?.domain === "A"
          ? "Domain A — Inattention"
          : "Domain B — Hyperactivity/Impulsivity";
      }
      case "context":
        return "Context Questions";
      case "followups":
        return "Personalized Follow-ups";
      default:
        return "";
    }
  };

  const getQuestionLabel = () => {
    switch (currentPhase) {
      case "main":
        return `${currentQuestionIndex + 1} of ${TOTAL_MAIN}`;
      case "context":
        return `${currentQuestionIndex + 1} of ${TOTAL_CONTEXT}`;
      case "followups":
        return `${currentQuestionIndex + 1} of ${followUpQuestions.length}`;
      default:
        return "";
    }
  };

  // Render current question
  const renderQuestion = () => {
    if (currentPhase === "main") {
      const question = questions[currentQuestionIndex];
      if (!question) return null;
      return (
        <QuestionCard
          questionKey={question.id}
          questionNumber={question.questionNumber}
          text={question.text}
          helpText={"helpText" in question ? (question as { helpText: string }).helpText : undefined}
        >
          <LikertScale
            questionId={question.id}
            value={responses[question.id]}
            onChange={handleMainResponse}
          />
        </QuestionCard>
      );
    }

    if (currentPhase === "context") {
      const question = contextQuestions[currentQuestionIndex];
      if (!question) return null;
      return (
        <QuestionCard
          questionKey={question.id}
          questionNumber={question.questionNumber}
          text={question.text}
          helpText={question.helpText}
        >
          <ContextQuestion
            questionId={question.id}
            options={question.options}
            value={contextResponses[question.id]}
            onChange={handleContextResponse}
          />
        </QuestionCard>
      );
    }

    if (currentPhase === "followups") {
      const question = followUpQuestions[currentQuestionIndex];
      if (!question) {
        finishAssessment();
        return null;
      }
      return (
        <QuestionCard
          questionKey={question.id}
          questionNumber={currentQuestionIndex + 1}
          text={question.text}
        >
          <LikertScale
            questionId={question.id}
            value={followUpResponses[question.id]}
            onChange={handleFollowUpResponse}
          />
        </QuestionCard>
      );
    }

    return null;
  };

  if (!state.userData.gender) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <ProgressBar
        progress={getProgress()}
        phaseLabel={getPhaseLabel()}
        questionLabel={getQuestionLabel()}
      />

      <AnimatePresence mode="wait">{renderQuestion()}</AnimatePresence>

      <div className="mt-6 flex gap-2">
        {currentQuestionIndex > 0 && (
          <Button variant="ghost" size="sm" onClick={handlePrevious}>
            <ChevronLeft size={16} className="mr-1" />
            Previous
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={handleQuit} className="ml-auto text-red-600 hover:text-red-700">
          <X size={16} className="mr-1" />
          Quit & Get PDF
        </Button>
      </div>

      {showMilestone && <MilestoneAnimation />}

      <AnimatePresence>
        {showPhaseTransition && (
          <PhaseTransition
            title={phaseTransitionData.title}
            subtitle={phaseTransitionData.subtitle}
            onComplete={handlePhaseTransitionComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
