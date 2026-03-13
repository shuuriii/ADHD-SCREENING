"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type {
  LikertValue,
  UserData,
  AssessmentResult,
  FollowUpQuestion,
  InstrumentType,
} from "@/questionnaire/types";
import {
  calculateDomainScore,
  determinePresentationType,
  evaluateDSM5Criteria,
  interpretDSM5Results,
  determineFollowUps,
} from "@/questionnaire/scoring";
import { secureStorage } from "@/lib/client-crypto";

type Phase = "intake" | "main" | "context" | "followups" | "results";

interface AssessmentState {
  currentPhase: Phase;
  instrument: InstrumentType;
  userData: UserData;
  responses: Record<string, LikertValue>;
  contextResponses: Record<string, string>;
  followUpResponses: Record<string, LikertValue>;
  currentQuestionIndex: number;
  followUpQuestions: FollowUpQuestion[];
  results: AssessmentResult | null;
  asrsResult: null;
}

type Action =
  | { type: "SET_USER_DATA"; payload: UserData }
  | { type: "SET_INSTRUMENT"; payload: InstrumentType }
  | { type: "RECORD_RESPONSE"; payload: { questionId: string; value: LikertValue } }
  | { type: "RECORD_CONTEXT_RESPONSE"; payload: { questionId: string; value: string } }
  | { type: "RECORD_FOLLOWUP_RESPONSE"; payload: { questionId: string; value: LikertValue } }
  | { type: "NEXT_QUESTION" }
  | { type: "PREVIOUS_QUESTION" }
  | { type: "SET_PHASE"; payload: Phase }
  | { type: "SET_QUESTION_INDEX"; payload: number }
  | { type: "SET_FOLLOWUPS"; payload: FollowUpQuestion[] }
  | { type: "SET_RESULTS"; payload: AssessmentResult }
  | { type: "RESET" }
  | { type: "HYDRATE"; payload: AssessmentState };

const initialState: AssessmentState = {
  currentPhase: "intake",
  instrument: "dsm5",
  userData: { name: "", gender: null, age: null, petPreference: null, email: "" },
  responses: {},
  contextResponses: {},
  followUpResponses: {},
  currentQuestionIndex: 0,
  followUpQuestions: [],
  results: null,
  asrsResult: null,
};

function reducer(state: AssessmentState, action: Action): AssessmentState {
  switch (action.type) {
    case "SET_USER_DATA":
      return { ...state, userData: action.payload, currentPhase: "main" };
    case "SET_INSTRUMENT":
      return { ...state, instrument: action.payload };
    case "RECORD_RESPONSE":
      return {
        ...state,
        responses: {
          ...state.responses,
          [action.payload.questionId]: action.payload.value,
        },
      };
    case "RECORD_CONTEXT_RESPONSE":
      return {
        ...state,
        contextResponses: {
          ...state.contextResponses,
          [action.payload.questionId]: action.payload.value,
        },
      };
    case "RECORD_FOLLOWUP_RESPONSE":
      return {
        ...state,
        followUpResponses: {
          ...state.followUpResponses,
          [action.payload.questionId]: action.payload.value,
        },
      };
    case "NEXT_QUESTION":
      return { ...state, currentQuestionIndex: state.currentQuestionIndex + 1 };
    case "PREVIOUS_QUESTION":
      return {
        ...state,
        currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1),
      };
    case "SET_PHASE":
      return { ...state, currentPhase: action.payload, currentQuestionIndex: 0 };
    case "SET_QUESTION_INDEX":
      return { ...state, currentQuestionIndex: action.payload };
    case "SET_FOLLOWUPS":
      return { ...state, followUpQuestions: action.payload };
    case "SET_RESULTS":
      return { ...state, results: action.payload, currentPhase: "results" };
    case "RESET":
      return initialState;
    case "HYDRATE":
      return action.payload;
    default:
      return state;
  }
}

interface AssessmentContextValue {
  state: AssessmentState;
  dispatch: React.Dispatch<Action>;
  calculateAndSetResults: () => void;
  computeFollowUps: () => void;
}

export const AssessmentContext = createContext<AssessmentContextValue | null>(null);

const SESSION_KEY = "adhd-assessment-v2";
const HISTORY_KEY = "adhd-assessment-history";

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate from sessionStorage on mount (async due to encryption)
  useEffect(() => {
    (async () => {
      try {
        const saved = await secureStorage.getItem(sessionStorage, SESSION_KEY);
        if (saved) {
          dispatch({ type: "HYDRATE", payload: JSON.parse(saved) });
        }
      } catch (e) {
        console.warn("[AssessmentContext] hydrate failed:", e);
      }
    })();
  }, []);

  // Persist to sessionStorage on state change (async due to encryption)
  const persistState = useCallback(async (s: AssessmentState) => {
    try {
      await secureStorage.setItem(sessionStorage, SESSION_KEY, JSON.stringify(s));
    } catch (e) {
      console.warn("[AssessmentContext] persist failed:", e);
    }
  }, []);

  useEffect(() => {
    persistState(state);
  }, [state, persistState]);

  const computeFollowUps = () => {
    const followUps = determineFollowUps(state.responses, state.userData.gender);
    dispatch({ type: "SET_FOLLOWUPS", payload: followUps });
  };

  const calculateAndSetResults = () => {
    const domainA = calculateDomainScore(state.responses, "A");
    const domainB = calculateDomainScore(state.responses, "B");
    const presentationType = determinePresentationType(domainA, domainB);
    const criteria = evaluateDSM5Criteria(domainA, domainB, state.contextResponses);
    const interpretation = interpretDSM5Results(
      domainA,
      domainB,
      presentationType,
      criteria,
      state.userData.gender,
      state.followUpResponses
    );

    const result: AssessmentResult = {
      assessmentId: crypto.randomUUID(),
      instrument: "dsm5",
      userData: state.userData,
      domainA,
      domainB,
      presentationType,
      dsm5Criteria: criteria,
      interpretation,
      responses: state.responses,
      contextResponses: state.contextResponses,
      followUpResponses: state.followUpResponses,
      completedAt: new Date().toISOString(),
    };

    dispatch({ type: "SET_RESULTS", payload: result });
    // Persist so sessionStorage is up-to-date before router.push
    const next = { ...state, results: result, currentPhase: "results" as const };
    secureStorage.setItem(sessionStorage, SESSION_KEY, JSON.stringify(next)).catch(() => {});
    saveToHistory(result);
  };

  return (
    <AssessmentContext.Provider
      value={{ state, dispatch, calculateAndSetResults, computeFollowUps }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

async function saveToHistory(result: AssessmentResult) {
  try {
    const historyRaw = await secureStorage.getItem(localStorage, HISTORY_KEY);
    const history: AssessmentResult[] = historyRaw
      ? JSON.parse(historyRaw)
      : [];
    history.unshift(result);
    await secureStorage.setItem(localStorage, HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn("[AssessmentContext] saveToHistory failed:", e);
  }
}

export function useAssessment() {
  const ctx = useContext(AssessmentContext);
  if (!ctx)
    throw new Error("useAssessment must be used within AssessmentProvider");
  return ctx;
}
