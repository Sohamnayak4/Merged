import "server-only";
import { createHash } from "node:crypto";

/**
 * Submissions are unauthenticated, so the only handle on abuse is the caller's
 * address. It is hashed with a server-side secret before storage: enough to
 * count repeat submitters, not enough to reconstruct who they were.
 */
export function ipHashOf(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip =
    forwarded.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "merged";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export const LIMITS = {
  /** Per address, per hour. Generous for a person, useless for a script. */
  submissionsPerHour: 10,
};
