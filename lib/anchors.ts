/**
 * Named scroll targets, kept in one dependency-free module so the header and
 * the board can't drift apart on the spelling.
 *
 * Deliberately not in lib/sponsor.ts: that module reads sponsor.config.ts, and
 * the board is a client component. Importing it there would ship the sponsor
 * config to the browser, which is exactly what the placements avoid.
 */

/** The first sponsor row on the board. */
export const FEATURE_ANCHOR = "feature";

export const FEATURE_HREF = `/#${FEATURE_ANCHOR}`;
