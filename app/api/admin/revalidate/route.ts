import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * Flushes the cached pages on demand.
 *
 * Writes made through the app revalidate themselves, but anything changed
 * directly in SQL — truncating the board, flipping someone to 'hidden' after
 * a removal request — is invisible to Next, which keeps serving prerendered
 * HTML until its own timer expires. This is the manual equivalent.
 *
 *   curl -X POST https://<host>/api/admin/revalidate \
 *     -H "Authorization: Bearer $CRON_SECRET"
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  // Profile pages are per-handle and there may be any number of them, so
  // clear the whole tree under the root layout rather than naming paths.
  revalidatePath("/", "layout");

  return NextResponse.json({
    revalidated: true,
    scope: "all pages",
    at: new Date().toISOString(),
  });
}
