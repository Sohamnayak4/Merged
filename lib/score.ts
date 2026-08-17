import type { Profile, Score, ScorePart, Tier } from "./types";

/**
 * Impact.
 *
 * Most developer scoreboards rank people by commit count or stars, which
 * rewards owning a popular repository and shipping to yourself. Open source is
 * the opposite discipline: the meaningful unit is a patch someone else reviewed
 * and merged into a codebase you do not control.
 *
 * "Do not control" is doing real work in that sentence. A repo owned by an org
 * you belong to is your home team, so Svelte patches by a Svelte maintainer are
 * not upstream. Every count here excludes the author's personal account and
 * every org they publicly belong to.
 *
 * Upstream therefore carries the most weight by a wide margin; everything else
 * is a supporting fact. Each part saturates rather than scaling linearly — the
 * distance from 0 to 50 upstream patches is enormous, the distance from 500 to
 * 550 is noise, and the curve should say so.
 */

const TIERS: Tier[] = [
  { name: "Core", min: 780, tone: "text-merge" },
  { name: "Maintainer", min: 600, tone: "text-merge" },
  { name: "Committer", min: 400, tone: "text-fg" },
  { name: "Contributor", min: 200, tone: "text-mid" },
  { name: "First patch", min: 0, tone: "text-dim" },
];

/** Smooth 0→1 curve. `k` is the value that reaches ~63%. */
const sat = (v: number, k: number) => 1 - Math.exp(-Math.max(0, v) / k);

export function tierFor(total: number): Tier {
  return TIERS.find((t) => total >= t.min) ?? TIERS[TIERS.length - 1];
}

export const ALL_TIERS = TIERS;

export function upstreamPRsOf(p: Profile) {
  return p.upstreamPRs ?? [];
}

export function scoreOf(p: Profile): Score {
  // Exact, not extrapolated: GitHub search counted these with the author's own
  // account and orgs excluded from the query.
  const upstreamPRs = p.upstreamTotal ?? 0;

  // A floor rather than a total — we can only see the 100 most recent upstream
  // patches, so someone with thousands has touched at least this many owners.
  const distinctOwners = (p.upstreamOwners ?? []).length;

  const cutoff = Date.now() - 90 * 86400_000;
  const last90 = (p.days ?? [])
    .filter((d) => new Date(d.date).getTime() >= cutoff)
    .reduce((s, d) => s + d.level, 0);

  const parts: Omit<ScorePart, "points">[] = [
    {
      key: "upstream",
      label: "Upstream",
      detail: "patches merged into repos they don't own",
      raw: upstreamPRs,
      norm: sat(upstreamPRs, 150),
      weight: 420,
    },
    {
      key: "reach",
      label: "Reach",
      detail: "stars across projects they maintain",
      raw: p.totalStars,
      norm: sat(p.totalStars, 14000),
      weight: 220,
    },
    {
      key: "breadth",
      label: "Breadth",
      detail: "distinct owners who merged their work",
      raw: distinctOwners,
      norm: sat(distinctOwners, 14),
      weight: 180,
    },
    {
      key: "standing",
      label: "Standing",
      detail: "developers following the work",
      raw: p.followers,
      norm: sat(p.followers, 9000),
      weight: 90,
    },
    {
      key: "current",
      label: "Current",
      detail: "contribution weight, last 90 days",
      raw: last90,
      norm: sat(last90, 160),
      weight: 90,
    },
  ];

  const scored: ScorePart[] = parts.map((x) => ({
    ...x,
    points: Math.round(x.norm * x.weight),
  }));

  const total = scored.reduce((s, x) => s + x.points, 0);

  return {
    total,
    parts: scored,
    tier: tierFor(total),
    upstreamPRs,
    distinctOwners,
    last90,
  };
}

export function rank(profiles: Profile[]) {
  return profiles
    .map((p) => ({ profile: p, score: scoreOf(p) }))
    .sort((a, b) => b.score.total - a.score.total)
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

export type Ranked = ReturnType<typeof rank>[number];
