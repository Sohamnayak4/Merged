import "server-only";

/**
 * Outbound mail for the one thing on this site that needs an answer from a
 * person: a sponsor inquiry.
 *
 * Sent over Resend's HTTP API rather than an SDK — one fetch, no dependency,
 * and nothing to keep up to date. Unconfigured, it logs the inquiry to the
 * function output instead of failing: on a fresh clone the form still works
 * and the message is still stored.
 *
 * Nothing here throws. The row is already in Postgres by the time this runs,
 * so a mail provider having a bad afternoon must not turn a saved inquiry
 * into an error page for the person who sent it.
 */
export type InquiryMail = {
  name: string;
  email: string;
  companyUrl: string | null;
  message: string | null;
};

export async function notifySponsorInquiry(i: InquiryMail): Promise<boolean> {
  // Plain text, so nothing a stranger types has to be escaped on its way into
  // an HTML mail body.
  const text = [
    `From:    ${i.name} <${i.email}>`,
    `Company: ${i.companyUrl ?? "—"}`,
    "",
    i.message ?? "(no message)",
  ].join("\n");

  const key = process.env.RESEND_API_KEY;
  const to = process.env.SPONSOR_NOTIFY_TO;

  if (!key || !to) {
    console.warn(
      `[merged] sponsor inquiry stored, no mail configured:\n${text}`,
    );
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.SPONSOR_NOTIFY_FROM ?? "MERGED <onboarding@resend.dev>",
        to: [to],
        // Replying goes straight back to whoever asked, rather than to me.
        reply_to: i.email,
        subject: `Sponsor inquiry — ${i.name}`,
        text,
      }),
    });

    if (!res.ok) {
      console.error(
        `[merged] sponsor notification failed (${res.status}): ${await res
          .text()
          .catch(() => "")}`,
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error("[merged] sponsor notification failed:", err);
    return false;
  }
}
