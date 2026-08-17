import seed from "@/data/seed.json";
import type { Profile } from "./types";

/**
 * The frozen seed captured by scripts/seed.mjs.
 *
 * Postgres is the runtime source of truth — this file is read once, by
 * /api/admin/import, to populate an empty board. Nothing on a rendered page
 * imports it, which keeps 560KB of JSON out of the page bundles.
 */
export function seedProfiles(): Profile[] {
  return (seed.profiles as unknown as Profile[]).map((p) => ({
    ...p,
    source: "seed" as const,
  }));
}

export function seedGeneratedAt(): string {
  return seed.generatedAt;
}
