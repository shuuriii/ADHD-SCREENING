import type { AssessmentResult, ASRSResult, UserData } from "@/questionnaire/types";

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
    gonogo?: { scores: unknown; completedAt: string };
    chronos?: { scores: unknown; completedAt: string };
    focusQuest?: { scores: unknown; completedAt: string };
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
export function saveGameToBundle(
  game: "gonogo" | "chronos" | "focusQuest",
  scores: unknown
): void {
  const bundle = readBundle();
  if (!bundle) return;
  bundle.games[game] = { scores, completedAt: new Date().toISOString() };
  writeBundle(bundle);
}

/** Returns the full bundle, or null if not started yet. */
export function getBundle(): ReportBundle | null {
  return readBundle();
}
