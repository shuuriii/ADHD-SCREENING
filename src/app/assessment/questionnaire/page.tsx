"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
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
import { ChevronLeft, Undo2 } from "lucide-react";

const TOTAL_CONTEXT = 3;

export default function QuestionnairePage() {
  const router = useRouter();
  const {
    state,
    dispatch,
    hydrated,
    calculateAndSetResults,
    computeFollowUps,
  } = useAssessment();
  const {
    currentPhase,
    currentQuestionIndex,
    responses,
    contextResponses,
    followUpResponses,
    followUpQuestions,
  } = state;

  const questions = dsm5Questions;
  const TOTAL_MAIN = questions.length;
  const MILESTONE_INDEX = 14; // Domain A at Q15 (index 14)

  const [showPhaseTransition, setShowPhaseTransition] = useState(false);
  const [phaseTransitionData, setPhaseTransitionData] = useState({
    title: "",
    subtitle: "",
  });
  const [showMilestone, setShowMilestone] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const pendingAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Redirect if no user data (wait for hydration to avoid false redirect)
  useEffect(() => {
    if (hydrated && !state.userData.gender && currentPhase !== "results") {
      router.replace("/assessment/intake");
    }
  }, [hydrated, state.userData.gender, currentPhase, router]);

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
      setIsAdvancing(true);
      pendingAdvanceRef.current = setTimeout(() => {
        setIsAdvancing(false);
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
      }, 800);
    },
    [currentQuestionIndex, dispatch, TOTAL_MAIN, MILESTONE_INDEX]
  );

  const handleContextResponse = useCallback(
    (questionId: string, value: string) => {
      dispatch({
        type: "RECORD_CONTEXT_RESPONSE",
        payload: { questionId, value },
      });

      setIsAdvancing(true);
      pendingAdvanceRef.current = setTimeout(() => {
        setIsAdvancing(false);
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
      }, 800);
    },
    [currentQuestionIndex, dispatch, computeFollowUps]
  );

  const finishAssessment = useCallback(() => {
    calculateAndSetResults();
    router.push("/assessment/results");
  }, [calculateAndSetResults, router]);

  // If we enter followups phase but there are no questions, finish the assessment
  const finishedRef = useRef(false);
  useEffect(() => {
    if (
      currentPhase === "followups" &&
      followUpQuestions.length === 0 &&
      !finishedRef.current
    ) {
      finishedRef.current = true;
      finishAssessment();
    }
  }, [currentPhase, followUpQuestions.length, finishAssessment]);

  const handleFollowUpResponse = useCallback(
    (questionId: string, value: LikertValue) => {
      dispatch({
        type: "RECORD_FOLLOWUP_RESPONSE",
        payload: { questionId, value },
      });

      setIsAdvancing(true);
      pendingAdvanceRef.current = setTimeout(() => {
        setIsAdvancing(false);
        if (currentQuestionIndex < followUpQuestions.length - 1) {
          dispatch({ type: "NEXT_QUESTION" });
        } else {
          finishAssessment();
        }
      }, 800);
    },
    [
      currentQuestionIndex,
      followUpQuestions.length,
      dispatch,
      finishAssessment,
    ]
  );

  const handleUndo = useCallback(() => {
    if (pendingAdvanceRef.current) {
      clearTimeout(pendingAdvanceRef.current);
      pendingAdvanceRef.current = null;
    }
    setIsAdvancing(false);
  }, []);

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

      {isAdvancing && (
        <div className="mt-4 flex items-center gap-3 bg-primary-50 border border-primary-200 rounded-xl px-4 py-3">
          <div className="flex-1 h-1.5 bg-primary-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full"
              style={{ animation: "fillBar 0.8s linear forwards" }}
            />
          </div>
          <button
            onClick={handleUndo}
            className="flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-900 transition-colors shrink-0"
          >
            <Undo2 size={14} />
            Undo
          </button>
        </div>
      )}

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
