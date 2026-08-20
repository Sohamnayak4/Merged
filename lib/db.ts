import "server-only";
import { db, isConfigured } from "./supabase";
import { scoreOf, tierFor } from "./score";
import type { Lang, PR, Profile, Repo, ResolvedLink, Score } from "./types";

/** The slim shape the leaderboard needs — never the calendar or repo blobs. */
export type BoardRow = {
  login: string;
  name: string;
  avatar: string;
  totalStars: number;
  upstreamTotal: number;
  ownerCount: number;
  last90: number;
  langs: Lang[];
  score: number;
  tier: ReturnType<typeof tierFor>;
};

export type WallRow = {
  login: string;
  name: string;
  avatar: string;
  pr: PR;
};

const BOARD_COLUMNS =
  "login,name,avatar,total_stars,upstream_total,upstream_owner_count,last90,langs,score";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Read paths return empty when Supabase isn't configured, so `npm run build`
 * works on a fresh clone with no .env.local and the site renders its empty
 * state. Query *failures* are still thrown — a misconfigured production
 * database should look broken, not merely unpopulated.
 */
function unconfigured(): boolean {
  if (isConfigured()) return false;
  console.warn("[merged] SUPABASE_URL / SERVICE_ROLE_KEY unset — board empty.");
  return true;
}

export async function listBoard(): Promise<BoardRow[]> {
  if (unconfigured()) return [];

  const { data, error } = await db()
    .from("profiles")
    .select(BOARD_COLUMNS)
    .eq("status", "ready")
    .order("score", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((r: any) => ({
    login: r.login,
    name: r.name,
    avatar: r.avatar ?? "",
    totalStars: r.total_stars,
    upstreamTotal: r.upstream_total,
    ownerCount: r.upstream_owner_count,
    last90: r.last90,
    langs: (r.langs ?? []) as Lang[],
    score: r.score,
    tier: tierFor(r.score),
  }));
}

export async function getProfile(
  login: string,
): Promise<{ profile: Profile; score: Score; rank: number } | null> {
  if (unconfigured()) return null;
  const supabase = db();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .ilike("login", login)
    .eq("status", "ready")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as any;

  const { data: patchRows } = await supabase
    .from("patches")
    .select("repo,owner,number,title,url,merged_at")
    .eq("login", row.login)
    .order("merged_at", { ascending: false, nullsFirst: false })
    .limit(100);

  const upstreamPRs: PR[] = (patchRows ?? []).map((p: any) => ({
    title: p.title,
    number: p.number,
    repo: p.repo,
    owner: p.owner,
    url: p.url,
    mergedAt: p.merged_at,
    upstream: true,
  }));

  // Rank is the person's position across the whole board, so it has to be
  // counted rather than read off the row.
  const { count } = await supabase
    .from("profiles")
    .select("login", { count: "exact", head: true })
    .eq("status", "ready")
    .gt("score", row.score);

  const profile: Profile = {
    login: row.login,
    name: row.name,
    avatar: row.avatar ?? "",
    bio: row.bio,
    company: row.company,
    location: row.location,
    blog: row.blog,
    followers: row.followers,
    publicRepos: row.public_repos,
    createdAt: row.github_created_at ?? new Date().toISOString(),
    url: row.url ?? `https://github.com/${row.login}`,
    repos: (row.repos ?? []) as Repo[],
    totalStars: row.total_stars,
    mergedTotal: row.merged_total,
    upstreamTotal: row.upstream_total,
    upstreamPRs,
    upstreamOwners: [],
    langs: (row.langs ?? []) as Lang[],
    days: row.days ?? [],
    orgs: row.orgs ?? [],
    links: (row.links ?? []) as ResolvedLink[],
    source: row.source,
  };

  const score: Score = {
    total: row.score,
    parts: row.score_parts ?? [],
    tier: tierFor(row.score),
    upstreamPRs: row.upstream_total,
    distinctOwners: row.upstream_owner_count,
    last90: row.last90,
  };

  return { profile, score, rank: (count ?? 0) + 1 };
}

export async function wallItems(limit = 60, perPerson = 12): Promise<WallRow[]> {
  if (unconfigured()) return [];

  const { data, error } = await db().rpc("wall", {
    limit_n: limit,
    per_person: perPerson,
  });

  if (error) throw new Error(error.message);

  return (data ?? []).map((r: any) => ({
    login: r.login,
    name: r.name,
    avatar: r.avatar ?? "",
    pr: {
      title: r.title,
      number: r.number,
      repo: r.repo,
      owner: r.owner,
      url: r.url,
      mergedAt: r.merged_at,
      upstream: true,
    },
  }));
}

export async function boardTotals() {
  if (unconfigured())
    return { contributors: 0, upstream: 0, stars: 0, repos: 0 };

  const { data, error } = await db().rpc("board_totals");
  if (error) throw new Error(error.message);
  const row = (Array.isArray(data) ? data[0] : data) as any;
  return {
    contributors: Number(row?.contributors ?? 0),
    upstream: Number(row?.upstream ?? 0),
    stars: Number(row?.stars ?? 0),
    repos: Number(row?.repos ?? 0),
  };
}

/** Written by both the add endpoint and the nightly refresh. */
export async function upsertProfile(
  profile: Profile,
  opts: { ipHash?: string | null; source?: string } = {},
) {
  const supabase = db();
  const score = scoreOf(profile);

  const { error } = await supabase.from("profiles").upsert(
    {
      login: profile.login,
      name: profile.name,
      avatar: profile.avatar,
      bio: profile.bio,
      company: profile.company,
      location: profile.location,
      blog: profile.blog,
      followers: profile.followers,
      public_repos: profile.publicRepos,
      github_created_at: profile.createdAt,
      url: profile.url,
      total_stars: profile.totalStars,
      merged_total: profile.mergedTotal,
      upstream_total: profile.upstreamTotal,
      upstream_owner_count: profile.upstreamOwners?.length ?? 0,
      last90: score.last90,
      orgs: profile.orgs ?? [],
      langs: profile.langs,
      days: profile.days,
      repos: profile.repos,
      links: profile.links ?? [],
      score: score.total,
      score_parts: score.parts,
      source: opts.source ?? profile.source ?? "live",
      submitted_ip_hash: opts.ipHash ?? null,
      fetched_at: new Date().toISOString(),
    },
    { onConflict: "login" },
  );

  if (error) throw new Error(error.message);

  // Patches are replaced wholesale: the upstream query returns the 100 most
  // recent, and anything older than that window is no longer representable.
  if (profile.upstreamPRs?.length) {
    const rows = profile.upstreamPRs.map((p) => ({
      login: profile.login,
      repo: p.repo,
      owner: p.owner,
      number: p.number,
      title: p.title,
      url: p.url,
      merged_at: p.mergedAt,
    }));
    const { error: patchError } = await supabase
      .from("patches")
      .upsert(rows, { onConflict: "login,url" });
    if (patchError) throw new Error(patchError.message);
  }

  return score;
}

/**
 * Someone who opted out stays in the table as 'hidden' rather than being
 * deleted, so the next passer-by can't silently put them back.
 */
export async function statusOf(login: string): Promise<string | null> {
  const { data } = await db()
    .from("profiles")
    .select("status")
    .ilike("login", login)
    .maybeSingle();
  return (data as any)?.status ?? null;
}

export async function recordSubmission(ipHash: string, login: string) {
  await db().from("submissions").insert({ ip_hash: ipHash, login });
}

export async function submissionsSince(ipHash: string, minutes: number) {
  const since = new Date(Date.now() - minutes * 60_000).toISOString();
  const { count } = await db()
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  return count ?? 0;
}

export async function requestRemoval(
  login: string,
  reason: string | null,
  contact: string | null,
) {
  const { error } = await db()
    .from("removal_requests")
    .insert({ login, reason, contact });
  if (error) throw new Error(error.message);
}

export type SponsorInquiry = {
  name: string;
  email: string;
  companyUrl: string | null;
  message: string | null;
};

/**
 * Sponsor inquiries are stored first and mailed second — a notification that
 * fails to send must not lose the message, because there is no second copy of
 * it anywhere and the person who wrote it was told I'd reply.
 */
export async function recordSponsorInquiry(
  inquiry: SponsorInquiry,
  ipHash: string | null,
) {
  const { error } = await db().from("sponsor_inquiries").insert({
    name: inquiry.name,
    email: inquiry.email,
    company_url: inquiry.companyUrl,
    message: inquiry.message,
    ip_hash: ipHash,
  });
  if (error) throw new Error(error.message);
}

export async function sponsorInquiriesSince(ipHash: string, minutes: number) {
  const since = new Date(Date.now() - minutes * 60_000).toISOString();
  const { count } = await db()
    .from("sponsor_inquiries")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  return count ?? 0;
}

/** Oldest data first — the refresh job works through the staleest rows. */
export async function stalestLogins(limit: number): Promise<string[]> {
  const { data, error } = await db()
    .from("profiles")
    .select("login")
    .eq("status", "ready")
    .order("fetched_at", { ascending: true })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => r.login);
}
