/**
 * Client-side helper to save data via server-side API routes
 * instead of writing directly to Supabase from the browser.
 */

async function postData(endpoint: string, data: unknown): Promise<void> {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error(`[API] ${endpoint} failed:`, body.error ?? res.statusText);
    }
  } catch {
    // Network error — fire-and-forget
  }
}

export function saveSessionViaAPI(params: {
  sessionId: string;
  age: number;
  gender: string;
  petPreference: string | null;
  instrument: string;
  name?: string | null;
}): void {
  postData("/api/data/session", params);
}

export function saveQuestionnaireViaAPI(sessionId: string, result: unknown): void {
  postData("/api/data/questionnaire", { sessionId, result });
}

export function saveGonogoViaAPI(sessionId: string, scores: unknown): void {
  postData("/api/data/gonogo", { sessionId, scores });
}

export function saveChronosViaAPI(sessionId: string, scores: unknown): void {
  postData("/api/data/chronos", { sessionId, scores });
}

export function saveFocusQuestViaAPI(sessionId: string, scores: unknown): void {
  postData("/api/data/focus-quest", { sessionId, scores });
}
