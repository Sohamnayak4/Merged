import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { seedProfiles } from "@/lib/data";
import { upsertProfile } from "@/lib/db";

export const maxDuration = 60;

/**
 * One-time import of data/seed.json into Postgres.
 *
 * Deliberately runs through upsertProfile — the same path the add endpoint and
 * the nightly refresh use — so the scoring logic exists in exactly one place
 * and imported rows can't drift from live ones.
 *
 *   curl -X POST https://<host>/api/admin/import -H "Authorization: Bearer $CRON_SECRET"
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const imported: { login: string; score: number }[] = [];
  const failed: { login: string; error: string }[] = [];

  for (const profile of seedProfiles()) {
    try {
      const score = await upsertProfile(profile, { source: "seed" });
      imported.push({ login: profile.login, score: score.total });
    } catch (err) {
      failed.push({
        login: profile.login,
        error: err instanceof Error ? err.message : "unknown",
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/wall");

  return NextResponse.json({ imported, failed });
}
