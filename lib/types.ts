export type Day = { date: string; level: number };

export type Repo = {
  name: string;
  full: string;
  desc: string | null;
  stars: number;
  forks: number;
  lang: string | null;
  url: string;
  pushed: string;
  topics: string[];
};

export type PR = {
  title: string;
  number: number;
  repo: string;
  owner: string;
  url: string;
  mergedAt: string | null;
  upstream: boolean;
};

export type Lang = { name: string; weight: number };

export type Profile = {
  login: string;
  name: string;
  avatar: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  followers: number;
  publicRepos: number;
  createdAt: string;
  url: string;
  repos: Repo[];
  totalStars: number;
  /** Every merged PR, including ones to their own projects. */
  mergedTotal: number;
  /** Exact count of merged PRs to repos outside their account and orgs. */
  upstreamTotal: number;
  /** Up to the 100 most recent upstream patches. */
  upstreamPRs: PR[];
  /** Distinct owners seen in `upstreamPRs` — a floor, not a total. */
  upstreamOwners: string[];
  langs: Lang[];
  days: Day[];
  /** Public org membership — the author's "home teams". */
  orgs?: string[];
  /** Set when the profile came from a pasted link rather than the seed. */
  source?: "seed" | "live" | "links";
  /** Free-form contribution links for people whose work isn't on GitHub. */
  links?: ResolvedLink[];
};

export type ResolvedLink = {
  url: string;
  kind: "pr" | "issue" | "commit" | "repo" | "web";
  title: string;
  repo?: string;
  owner?: string;
  desc?: string | null;
  merged?: boolean;
  mergedAt?: string | null;
  stars?: number;
  lang?: string | null;
  site?: string;
};

export type ScorePart = {
  key: string;
  label: string;
  /** What the number literally counts, shown to the reader. */
  detail: string;
  raw: number;
  /** 0–1 after saturation. */
  norm: number;
  weight: number;
  points: number;
};

export type Score = {
  total: number;
  parts: ScorePart[];
  tier: Tier;
  upstreamPRs: number;
  distinctOwners: number;
  last90: number;
};

export type Tier = {
  name: string;
  min: number;
  /** Tailwind-ready text colour token. */
  tone: string;
};

/**
 * The single site-wide sponsor, edited by hand in sponsor.config.ts. There is
 * no table and no admin screen for this on purpose: one sponsor at a time is a
 * commitment I keep by making a second one impossible to add by accident.
 */
export type Sponsor = {
  name: string;
  tagline: string;
  /** Must be same-origin or Supabase storage — see lib/sponsor.ts. */
  logoUrl: string;
  url: string;
  blurb: string;
};
