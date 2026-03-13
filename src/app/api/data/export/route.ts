import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { audit } from "@/lib/audit-log";

/**
 * GET /api/data/export
 * Exports all data for the authenticated user as JSON.
 * Supports GDPR right to data portability (Art. 20).
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId");

    if (!user && !sessionId) {
      return NextResponse.json(
        { error: "Authentication or session ID required" },
        { status: 401 }
      );
    }

    const filter = user
      ? { column: "user_id" as const, value: user.id }
      : { column: "session_id" as const, value: sessionId! };

    const [sessions, profiles, questionnaire, gonogo, chronos, focusQuest] =
      await Promise.all([
        supabase.from("sessions").select("*").eq(filter.column, filter.value),
        supabase.from("profiles").select("*").eq(filter.column, filter.value),
        supabase.from("questionnaire_results").select("*").eq(filter.column, filter.value),
        supabase.from("gonogo_scores").select("*").eq(filter.column, filter.value),
        supabase.from("chronos_scores").select("*").eq(filter.column, filter.value),
        supabase.from("focus_quest_scores").select("*").eq(filter.column, filter.value),
      ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      exportedFor: user?.email ?? `session:${sessionId}`,
      platform: "fayth.life",
      data: {
        sessions: sessions.data ?? [],
        profiles: profiles.data ?? [],
        questionnaireResults: questionnaire.data ?? [],
        gonogoScores: gonogo.data ?? [],
        chronosScores: chronos.data ?? [],
        focusQuestScores: focusQuest.data ?? [],
      },
    };

    audit("data.exported", { userId: user?.id, sessionId });

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="fayth-data-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
