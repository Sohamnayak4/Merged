import { NextResponse } from "next/server";
import { recordSponsorInquiry, sponsorInquiriesSince } from "@/lib/db";
import { notifySponsorInquiry } from "@/lib/notify";
import { ipHashOf } from "@/lib/request";

/** Generous for someone writing one message, useless for a script. */
const INQUIRIES_PER_HOUR = 5;

/** Long enough for a real pitch, short enough that nobody pastes a book. */
const MAX = { name: 120, email: 200, url: 300, message: 4000 };

/** Deliberately loose — an address shape, not an RFC, and never a rejection
 *  of somebody's perfectly valid unusual address. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Only http(s), so a stored link can never be javascript: or data:. */
function cleanUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString().slice(0, MAX.url)
      : null;
  } catch {
    return null;
  }
}

/**
 * Sponsor inquiries. Stored first, mailed second — see lib/notify.ts for why
 * the mail is allowed to fail quietly.
 */
export async function POST(request: Request) {
  let body: {
    name?: string;
    email?: string;
    companyUrl?: string;
    message?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }

  const name = (body.name ?? "").trim().slice(0, MAX.name);
  const email = (body.email ?? "").trim().slice(0, MAX.email);
  const message = (body.message ?? "").trim().slice(0, MAX.message);

  if (!name) {
    return NextResponse.json({ error: "Add a name." }, { status: 400 });
  }
  if (!EMAIL.test(email)) {
    return NextResponse.json(
      { error: "That email doesn't look right." },
      { status: 400 },
    );
  }
  if (!message) {
    return NextResponse.json(
      { error: "Tell me a little about what you'd be sponsoring." },
      { status: 400 },
    );
  }

  const ipHash = ipHashOf(request);
  if ((await sponsorInquiriesSince(ipHash, 60)) >= INQUIRIES_PER_HOUR) {
    return NextResponse.json(
      { error: "Too many messages from this connection. Try again later." },
      { status: 429 },
    );
  }

  const inquiry = {
    name,
    email,
    companyUrl: cleanUrl(body.companyUrl ?? ""),
    message,
  };

  await recordSponsorInquiry(inquiry, ipHash);
  await notifySponsorInquiry(inquiry);

  return NextResponse.json({ ok: true });
}
