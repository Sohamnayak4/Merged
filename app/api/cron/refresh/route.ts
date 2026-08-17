import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { buildProfile } from "@/lib/github";
import { stalestLogins, upsertProfile } from "@/lib/db";

export const maxDuration = 60;

/**
 * Nightly refresh. A leaderboard that never moves is a dead leaderboard.
 *
 * Works through the stalest rows first and stops well short of the minute
 * limit, so a growing board just takes more nights rather than failing. Search
 * allows 30 requests/minute authenticated and each profile spends two, so the
 * batch size — not the wall clock — is the real governor.
 */
const BATCH = 8;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const logins = await stalestLogins(BATCH);
  const refreshed: string[] = [];
  const failed: { login: string; error: string }[] = [];

  for (const login of logins) {
    try {
      const profile = await buildProfile(login);
      await upsertProfile(profile, { source: "live" });
      revalidatePath(`/${login}`);
      refreshed.push(login);
    } catch (err) {
      failed.push({
        login,
        error: err instanceof Error ? err.message : "unknown",
      });
    }
    // Stay under the authenticated search budget of 30/minute.
    await new Promise((r) => setTimeout(r, 2500));
  }

  revalidatePath("/");
  revalidatePath("/wall");

  return NextResponse.json({ refreshed, failed });
}
