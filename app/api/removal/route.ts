import { NextResponse } from "next/server";
import { requestRemoval } from "@/lib/db";
import { ipHashOf, LIMITS } from "@/lib/request";
import { submissionsSince, recordSubmission } from "@/lib/db";

/**
 * Opt-out. The board ranks real named people who never asked to be on it, so
 * there has to be a way off that doesn't involve finding someone's inbox.
 *
 * Requests are queued rather than applied: without accounts there's no way to
 * prove the person asking is the person listed, and letting anyone hide anyone
 * would just be a different kind of abuse.
 */
export async function POST(request: Request) {
  let body: { login?: string; reason?: string; contact?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }

  const login = (body.login ?? "").trim().replace(/^@/, "");
  if (!login) {
    return NextResponse.json(
      { error: "Which handle should come off?" },
      { status: 400 },
    );
  }

  const ipHash = ipHashOf(request);
  if ((await submissionsSince(ipHash, 60)) >= LIMITS.submissionsPerHour) {
    return NextResponse.json(
      { error: "Too many requests from this connection. Try again later." },
      { status: 429 },
    );
  }

  await requestRemoval(
    login,
    body.reason?.slice(0, 2000) ?? null,
    body.contact?.slice(0, 200) ?? null,
  );
  await recordSubmission(ipHash, login);

  return NextResponse.json({ ok: true });
}
