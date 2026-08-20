import type { Sponsor } from "@/lib/types";

/**
 * The site-wide sponsor. One at a time, or none.
 *
 * Edited by hand — there is no admin UI and no table behind this, which is
 * what keeps the promise on /sponsor ("one sponsor at a time") structurally
 * true rather than merely stated. Set it back to `null` when a run ends and
 * every placement returns to its empty state.
 *
 * `logoUrl` must be a path on this origin (`/sponsors/acme.svg` in public/) or
 * a file in Supabase storage. A third-party image host would hand a stranger a
 * request log of everyone who loads any page here, which is exactly the thing
 * this page promises not to do. lib/sponsor.ts drops anything else.
 *
 *   const sponsor: Sponsor | null = {
 *     name: "Acme",
 *     tagline: "the build tool that stays out of the way",
 *     logoUrl: "/sponsors/acme.svg",
 *     url: "https://acme.dev",
 *     blurb: "Ship faster with Acme →",
 *   };
 */
const sponsor: Sponsor | null = null;

export default sponsor;
