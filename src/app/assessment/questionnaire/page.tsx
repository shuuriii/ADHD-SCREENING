"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useAssessment } from "@/contexts/AssessmentContext";
import { dsm5Questions } from "@/questionnaire/dsm5-questions";
import { contextQuestions } from "@/questionnaire/context-questions";
import type { LikertValue } from "@/questionnaire/types";
import LikertScale from "@/components/assessment/LikertScale";
import ContextQuestion from "@/components/assessment/ContextQuestion";
import QuestionCard from "@/components/assessment/QuestionCard";
import ProgressBar from "@/components/assessment/ProgressBar";
import PhaseTransition from "@/components/assessment/PhaseTransition";
import MilestoneAnimation from "@/components/assessment/MilestoneAnimation";
import Button from "@/components/ui/Button";
import { ChevronLeft } from "lucide-react";

const DOMAIN_A_COUNT = 15;
const TOTAL_MAIN = 30;
const TOTAL_CONTEXT = 3;

export default function QuestionnairePage() {
  const router = useRouter();
  const { state, dispatch, calculateAndSetResults, computeFollowUps } =
    useAssessment();
  const {
    currentPhase,
    currentQuestionIndex,
    responses,
    contextResponses,
    followUpResponses,
    followUpQuestions,
  } = state;

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

      // Check for milestone: Domain A complete
      if (currentQuestionIndex === DOMAIN_A_COUNT - 1) {
        setShowMilestone(true);
        setTimeout(() => setShowMilestone(false), 1500);
      }

      // Auto-advance after delay
      setTimeout(() => {
        if (currentQuestionIndex < TOTAL_MAIN - 1) {
          dispatch({ type: "NEXT_QUESTION" });
        } else {
          // Transition to context phase
          setPhaseTransitionData({
            title: "Great progress!",
            subtitle: "Now a few context questions about your symptoms.",
          });
          setShowPhaseTransition(true);
        }
      }, 350);
    },
    [currentQuestionIndex, dispatch]
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
          // Determine follow-ups and transition
          computeFollowUps();
          setPhaseTransitionData({
            title: "Almost there!",
            subtitle: "A few personalized follow-up questions.",
          });
          setShowPhaseTransition(true);
        }
      }, 350);
    },
    [currentQuestionIndex, dispatch, computeFollowUps]
  );

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
          // All done — calculate results
          calculateAndSetResults();
          router.push("/assessment/results");
        }
      }, 350);
    },
    [
      currentQuestionIndex,
      followUpQuestions.length,
      dispatch,
      calculateAndSetResults,
      router,
    ]
  );

  const handlePhaseTransitionComplete = useCallback(() => {
    setShowPhaseTransition(false);
    if (currentPhase === "main") {
      dispatch({ type: "SET_PHASE", payload: "context" });
    } else if (currentPhase === "context") {
      // Check if there are follow-ups
      if (state.followUpQuestions.length > 0 || followUpQuestions.length > 0) {
        dispatch({ type: "SET_PHASE", payload: "followups" });
      } else {
        calculateAndSetResults();
        router.push("/assessment/results");
      }
    }
  }, [
    currentPhase,
    dispatch,
    state.followUpQuestions.length,
    followUpQuestions.length,
    calculateAndSetResults,
    router,
  ]);

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      dispatch({ type: "PREVIOUS_QUESTION" });
    }
  };

  // Phase labels
  const getPhaseLabel = () => {
    switch (currentPhase) {
      case "main": {
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
      const question = dsm5Questions[currentQuestionIndex];
      if (!question) return null;
      return (
        <QuestionCard
          questionKey={question.id}
          questionNumber={question.questionNumber}
          text={question.text}
          helpText={question.helpText}
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
        // No follow-ups, go straight to results
        calculateAndSetResults();
        router.push("/assessment/results");
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

      {currentQuestionIndex > 0 && (
        <div className="mt-6">
          <Button variant="ghost" size="sm" onClick={handlePrevious}>
            <ChevronLeft size={16} className="mr-1" />
            Previous
          </Button>
        </div>
      )}

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
