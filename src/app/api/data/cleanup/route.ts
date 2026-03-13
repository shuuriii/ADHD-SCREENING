import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/data/cleanup
 * Data retention cleanup — deletes records older than the retention period.
 *
 * Retention policy:
 * - Anonymous sessions (user_id IS NULL): 90 days
 * - Authenticated user data: 12 months
 *
 * This endpoint should be called by a scheduled job (e.g., Vercel Cron).
 * Protected by a secret token to prevent unauthorized access.
 */
export async function POST(request: Request) {
  // Verify cleanup authorization
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();

  const results: Record<string, { deleted: number; error?: string }> = {};

  const tables = [
    "focus_quest_scores",
    "chronos_scores",
    "gonogo_scores",
    "questionnaire_results",
    "profiles",
    "sessions",
  ] as const;

  // Delete anonymous records older than 90 days
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .delete({ count: "exact" })
      .is("user_id", null)
      .lt("created_at", ninetyDaysAgo);

    results[`${table}_anonymous`] = {
      deleted: count ?? 0,
      ...(error ? { error: error.message } : {}),
    };
  }

  // Delete authenticated records older than 12 months
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .delete({ count: "exact" })
      .not("user_id", "is", null)
      .lt("created_at", twelveMonthsAgo);

    results[`${table}_authenticated`] = {
      deleted: count ?? 0,
      ...(error ? { error: error.message } : {}),
    };
  }

  console.log("[Cleanup] Data retention cleanup completed:", results);

  return NextResponse.json({
    cleanedAt: now.toISOString(),
    policy: {
      anonymous: "90 days",
      authenticated: "12 months",
    },
    results,
  });
}
