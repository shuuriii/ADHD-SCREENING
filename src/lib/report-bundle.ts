import type { AssessmentResult, ASRSResult, UserData } from "@/questionnaire/types";
import type { GoNoGoScores } from "@/lib/gonogo-scoring";
import type { ChronosScores } from "@/lib/chronos-scoring";
import type { FocusQuestScores } from "@/lib/focus-quest-scoring";

export interface ReportBundle {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  userData: Pick<UserData, "name" | "age" | "gender" | "petPreference" | "email">;
  questionnaire?: {
    instrument: "dsm5" | "asrs";
    result: AssessmentResult | ASRSResult;
    completedAt: string;
  };
  games: {
    gonogo?: { scores: GoNoGoScores; completedAt: string };
    chronos?: { scores: ChronosScores; completedAt: string };
    focusQuest?: { scores: FocusQuestScores; completedAt: string };
  };
}

const BUNDLE_KEY = "fayth-report-bundle";

function readBundle(): ReportBundle | null {
  try {
    const raw = localStorage.getItem(BUNDLE_KEY);
    return raw ? (JSON.parse(raw) as ReportBundle) : null;
  } catch {
    return null;
  }
}

function writeBundle(bundle: ReportBundle): void {
  try {
    bundle.updatedAt = new Date().toISOString();
    localStorage.setItem(BUNDLE_KEY, JSON.stringify(bundle));
  } catch {
    // localStorage unavailable — silent fail
  }
}

/** Called on intake submit. Creates or resets the bundle for this session. */
export function initBundle(
  userData: Pick<UserData, "name" | "age" | "gender" | "petPreference" | "email">,
  sessionId: string
): void {
  const now = new Date().toISOString();
  const bundle: ReportBundle = {
    sessionId,
    createdAt: now,
    updatedAt: now,
    userData,
    games: {},
  };
  writeBundle(bundle);
}

/** Called on results page. Merges questionnaire result into the bundle. */
export function saveQuestionnaireToBundle(
  instrument: "dsm5" | "asrs",
  result: AssessmentResult | ASRSResult
): void {
  const bundle = readBundle();
  if (!bundle) return;
  bundle.questionnaire = {
    instrument,
    result,
    completedAt: new Date().toISOString(),
  };
  writeBundle(bundle);
}

/** Called on each game completion. Merges game scores into the bundle. */
export function saveGameToBundle(game: "gonogo", scores: GoNoGoScores): void;
export function saveGameToBundle(game: "chronos", scores: ChronosScores): void;
export function saveGameToBundle(game: "focusQuest", scores: FocusQuestScores): void;
export function saveGameToBundle(
  game: "gonogo" | "chronos" | "focusQuest",
  scores: GoNoGoScores | ChronosScores | FocusQuestScores
): void {
  const bundle = readBundle();
  if (!bundle) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (bundle.games as any)[game] = { scores, completedAt: new Date().toISOString() };
  writeBundle(bundle);
}

/** Returns the full bundle, or null if not started yet. */
export function getBundle(): ReportBundle | null {
  return readBundle();
}
