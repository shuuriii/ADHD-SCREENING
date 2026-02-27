import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/report/[sessionId]
 *
 * Returns the full questionnaire result as JSON for a given session.
 * Used by the Python PDF-generation script and any external consumer.
 *
 * Optional query params:
 *   ?include=games   — also include game scores in the response
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  if (!sessionId) {
    return NextResponse.json(
      { error: "sessionId is required" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    // Verify the requesting user owns this session (or is anonymous)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch questionnaire result
    const { data: questionnaire, error: qErr } = await supabase
      .from("questionnaire_results")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (qErr || !questionnaire) {
      return NextResponse.json(
        { error: "No questionnaire result found for this session" },
        { status: 404 }
      );
    }

    // If user is authenticated, verify ownership
    if (user && questionnaire.user_id && questionnaire.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Optionally include game scores
    const url = new URL(_request.url);
    const includeGames = url.searchParams.get("include") === "games";

    let games = null;
    if (includeGames) {
      const [gonogoRes, chronosRes, focusQuestRes] = await Promise.all([
        supabase
          .from("game_scores")
          .select("*")
          .eq("session_id", sessionId)
          .limit(1)
          .maybeSingle(),
        supabase
          .from("chronos_scores")
          .select("*")
          .eq("session_id", sessionId)
          .limit(1)
          .maybeSingle(),
        supabase
          .from("focus_quest_scores")
          .select("*")
          .eq("session_id", sessionId)
          .limit(1)
          .maybeSingle(),
      ]);

      games = {
        gonogo: gonogoRes.data ?? null,
        chronos: chronosRes.data ?? null,
        focusQuest: focusQuestRes.data ?? null,
      };
    }

    const payload = {
      session_id: sessionId,
      questionnaire,
      ...(games ? { games } : {}),
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    console.error("[API] /api/report error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
