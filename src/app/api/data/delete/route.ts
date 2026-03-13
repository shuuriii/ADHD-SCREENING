import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyCsrf } from "@/lib/csrf";
import { audit } from "@/lib/audit-log";

/**
 * DELETE /api/data/delete
 * Deletes all data for the authenticated user or a given session ID.
 * Supports GDPR right to erasure (Art. 17).
 */
export async function DELETE(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.valid) {
    return NextResponse.json({ error: csrf.error }, { status: 403 });
  }

  try {
    const { sessionId } = await request.json().catch(() => ({ sessionId: null }));
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user && !sessionId) {
      return NextResponse.json(
        { error: "Authentication or session ID required" },
        { status: 401 }
      );
    }

    const errors: string[] = [];
    const tables = [
      "focus_quest_scores",
      "chronos_scores",
      "gonogo_scores",
      "questionnaire_results",
      "profiles",
      "sessions",
    ] as const;

    for (const table of tables) {
      let query = supabase.from(table).delete();

      if (user) {
        query = query.eq("user_id", user.id);
      } else if (sessionId) {
        query = query.eq("session_id", sessionId);
      }

      const { error } = await query;
      if (error) {
        errors.push(`${table}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.error("[API] Partial deletion failure:", errors);
      return NextResponse.json(
        { error: "Some data could not be deleted", details: errors },
        { status: 500 }
      );
    }

    audit("data.deleted", {
      userId: user?.id,
      sessionId,
      meta: { scope: user ? "user" : "session" },
    });

    return NextResponse.json({
      deleted: true,
      scope: user ? "user" : "session",
      id: user?.id ?? sessionId,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
