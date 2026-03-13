import type { AssessmentResult, UserData } from "@/questionnaire/types";
import type { GoNoGoScores } from "@/lib/gonogo-scoring";
import type { ChronosScores } from "@/lib/chronos-scoring";
import type { FocusQuestScores } from "@/lib/focus-quest-scoring";
import { secureStorage } from "@/lib/client-crypto";

export interface ReportBundle {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  userData: Pick<UserData, "name" | "age" | "gender" | "petPreference" | "email">;
  questionnaire?: {
    instrument: "dsm5";
    result: AssessmentResult;
    completedAt: string;
  };
  games: {
    gonogo?: { scores: GoNoGoScores; completedAt: string };
    chronos?: { scores: ChronosScores; completedAt: string };
    focusQuest?: { scores: FocusQuestScores; completedAt: string };
  };
}

const BUNDLE_KEY = "fayth-report-bundle";

async function readBundle(): Promise<ReportBundle | null> {
  try {
    const raw = await secureStorage.getItem(localStorage, BUNDLE_KEY);
    return raw ? (JSON.parse(raw) as ReportBundle) : null;
  } catch (e) {
    console.warn("[report-bundle] readBundle failed:", e);
    return null;
  }
}

async function writeBundle(bundle: ReportBundle): Promise<void> {
  try {
    bundle.updatedAt = new Date().toISOString();
    await secureStorage.setItem(localStorage, BUNDLE_KEY, JSON.stringify(bundle));
  } catch (e) {
    console.warn("[report-bundle] writeBundle failed:", e);
  }
}

/** Called on intake submit. Creates or resets the bundle for this session. */
export async function initBundle(
  userData: Pick<UserData, "name" | "age" | "gender" | "petPreference" | "email">,
  sessionId: string
): Promise<void> {
  const now = new Date().toISOString();
  const bundle: ReportBundle = {
    sessionId,
    createdAt: now,
    updatedAt: now,
    userData,
    games: {},
  };
  await writeBundle(bundle);
}

/** Called on results page. Merges questionnaire result into the bundle. */
export async function saveQuestionnaireToBundle(
  instrument: "dsm5",
  result: AssessmentResult
): Promise<void> {
  const bundle = await readBundle();
  if (!bundle) return;
  bundle.questionnaire = {
    instrument,
    result,
    completedAt: new Date().toISOString(),
  };
  await writeBundle(bundle);
}

/** Called on each game completion. Merges game scores into the bundle. */
export async function saveGameToBundle(game: "gonogo", scores: GoNoGoScores): Promise<void>;
export async function saveGameToBundle(game: "chronos", scores: ChronosScores): Promise<void>;
export async function saveGameToBundle(game: "focusQuest", scores: FocusQuestScores): Promise<void>;
export async function saveGameToBundle(
  game: "gonogo" | "chronos" | "focusQuest",
  scores: GoNoGoScores | ChronosScores | FocusQuestScores
): Promise<void> {
  const bundle = await readBundle();
  if (!bundle) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (bundle.games as any)[game] = { scores, completedAt: new Date().toISOString() };
  await writeBundle(bundle);
}

/** Returns the full bundle, or null if not started yet. */
export async function getBundle(): Promise<ReportBundle | null> {
  return readBundle();
}
