import configured from "@/sponsor.config";
import type { Sponsor } from "./types";

/**
 * Outbound sponsor links carry `sponsored` — it is the honest declaration for
 * a paid link and it keeps the board's own ranking signal clean.
 */
export const SPONSOR_REL = "sponsored noopener";

/** Where every empty placement points. */
export const SPONSOR_HREF = "/sponsor";

/**
 * A logo is the one asset a sponsor supplies, and an <img> pointed at their
 * CDN would report every visitor on every page to them. So the origin is
 * checked here rather than trusted: same-origin paths, or the Supabase
 * project's storage host, and nothing else.
 */
function safeLogo(logoUrl: string): string | null {
  const url = logoUrl.trim();
  if (!url) return null;

  // Same-origin path. Rejects "//evil.example/logo.svg", which is a URL.
  if (url.startsWith("/") && !url.startsWith("//")) return url;

  const supabase = process.env.SUPABASE_URL;
  if (supabase) {
    try {
      if (new URL(url).origin === new URL(supabase).origin) return url;
    } catch {
      return null;
    }
  }

  console.warn(
    `[merged] sponsor logoUrl ${url} is not on this origin or Supabase storage — dropping it.`,
  );
  return null;
}

/**
 * The sponsor as the placements should render it, or null for the empty state.
 *
 * Every field is required to be non-empty: a half-filled config would render a
 * row with a blank name where the empty state would at least have been selling
 * the slot.
 */
export type ActiveSponsor = Omit<Sponsor, "logoUrl"> & {
  logoUrl: string | null;
};

export function activeSponsor(): ActiveSponsor | null {
  const s = configured;
  if (!s) return null;

  const name = s.name?.trim();
  const url = s.url?.trim();
  if (!name || !url) {
    console.warn("[merged] sponsor.config.ts needs both name and url.");
    return null;
  }

  return {
    name,
    url,
    tagline: s.tagline?.trim() ?? "",
    blurb: s.blurb?.trim() ?? "",
    logoUrl: safeLogo(s.logoUrl ?? ""),
  };
}
