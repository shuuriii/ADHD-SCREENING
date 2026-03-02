import { createClient, supabaseConfigured } from "./client";

export async function saveSession(
  age: number,
  gender: string,
  petPreference: string | null,
  instrument: string,
  sessionId: string,
  userId?: string | null
): Promise<void> {
  if (!supabaseConfigured) return;
  const supabase = createClient();
  const { error } = await supabase.from("sessions").upsert(
    {
      session_id: sessionId,
      user_id: userId ?? null,
      age,
      gender,
      pet_preference: petPreference,
      instrument,
    },
    { onConflict: "session_id" }
  );
  if (error) {
    console.error("[Supabase] Failed to save session:", error.message);
  }
}
