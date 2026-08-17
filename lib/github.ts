import "server-only";
import type { Day, Lang, PR, Profile, Repo, ResolvedLink } from "./types";

const API = "https://api.github.com";

/**
 * Anonymous GitHub allows 60 requests an hour per IP, and one profile costs
 * six or seven of them — roughly eight visitors before the site is down. A
 * token raises that to 5,000/hour and search to 30/minute, so it is required
 * in production and merely advisable while developing.
 */
function headers(): Record<string, string> {
  const base: Record<string, string> = {
    "User-Agent": "merged-showcase",
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) base.Authorization = `Bearer ${token}`;
  return base;
}

const HEADERS = { "User-Agent": "merged-showcase" };

export class GitHubError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/**
 * Unauthenticated GitHub allows 60 requests an hour per IP, and building one
 * profile spends four or five of them. A short in-process cache means reloading
 * a page or re-adding the same handle costs nothing.
 */
const cache = new Map<string, { at: number; value: unknown }>();
const TTL = 10 * 60_000;

async function gh<T>(path: string): Promise<T> {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < TTL) return hit.value as T;

  const res = await fetch(`${API}${path}`, { headers: headers() });

  if (res.status === 403 || res.status === 429) {
    const reset = Number(res.headers.get("x-ratelimit-reset") ?? 0) * 1000;
    const mins = reset ? Math.max(1, Math.ceil((reset - Date.now()) / 60000)) : null;
    const anon = !process.env.GITHUB_TOKEN;
    throw new GitHubError(
      `GitHub's rate limit is used up${
        mins ? `. It resets in about ${mins} minute${mins === 1 ? "" : "s"}` : ""
      }${anon ? " — no GITHUB_TOKEN is set, so this is the 60/hour anonymous limit." : "."}`,
      429,
    );
  }
  if (res.status === 404) throw new GitHubError("GitHub has no such page.", 404);
  if (!res.ok) throw new GitHubError(`GitHub returned ${res.status}.`, res.status);

  const value = (await res.json()) as T;
  cache.set(path, { at: Date.now(), value });
  return value;
}

async function contributions(login: string): Promise<Day[]> {
  const key = `contrib:${login}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value as Day[];

  const res = await fetch(`https://github.com/users/${login}/contributions`, {
    headers: { "User-Agent": HEADERS["User-Agent"] },
  });
  if (!res.ok) return [];

  const html = await res.text();
  const days: Day[] = [];
  const cell = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d)"/g;
  let m: RegExpExecArray | null;
  while ((m = cell.exec(html))) days.push({ date: m[1], level: Number(m[2]) });
  days.sort((a, b) => a.date.localeCompare(b.date));

  cache.set(key, { at: Date.now(), value: days });
  return days;
}

function ownerOf(repositoryUrl: string) {
  const m = /repos\/([^/]+)\/([^/]+)$/.exec(repositoryUrl || "");
  return m ? { owner: m[1], repo: m[2], full: `${m[1]}/${m[2]}` } : null;
}

type GhUser = {
  login: string; name: string | null; avatar_url: string; bio: string | null;
  company: string | null; location: string | null; blog: string | null;
  followers: number; public_repos: number; created_at: string; html_url: string;
};

type GhRepo = {
  name: string; full_name: string; description: string | null; fork: boolean;
  archived: boolean; stargazers_count: number; forks_count: number;
  language: string | null; html_url: string; pushed_at: string;
  topics?: string[];
};

type GhSearch = {
  total_count: number;
  items: {
    title: string; number: number; html_url: string; closed_at: string | null;
    repository_url: string; pull_request?: { merged_at: string | null };
  }[];
};

/** Builds the same shape scripts/seed.mjs freezes, but live. */
export async function buildProfile(login: string): Promise<Profile> {
  const user = await gh<GhUser>(`/users/${login}`);

  const [rawRepos, rawOrgs] = await Promise.all([
    gh<GhRepo[]>(`/users/${user.login}/repos?per_page=100&sort=pushed&type=owner`),
    gh<{ login: string }[]>(`/users/${user.login}/orgs`).catch(() => []),
  ]);

  const orgs = rawOrgs.map((o) => o.login);

  const repos: Repo[] = rawRepos
    .filter((r) => !r.fork && !r.archived)
    .map((r) => ({
      name: r.name,
      full: r.full_name,
      desc: r.description,
      stars: r.stargazers_count,
      forks: r.forks_count,
      lang: r.language,
      url: r.html_url,
      pushed: r.pushed_at,
      topics: (r.topics ?? []).slice(0, 4),
    }))
    .sort((a, b) => b.stars - a.stars);

  // Ask for the exact upstream figure rather than extrapolating: exclude the
  // author's own account and every org they belong to, and let search count.
  const excluded = [user.login, ...orgs];
  const q = [
    `author:${user.login}`,
    "type:pr",
    "is:merged",
    ...excluded.map((o) => `-user:${o}`),
  ].join(" ");

  const [search, days, allMerged] = await Promise.all([
    gh<GhSearch>(
      `/search/issues?q=${encodeURIComponent(q)}&per_page=100&sort=updated`,
    ).catch(() => ({ total_count: 0, items: [] }) as GhSearch),
    contributions(user.login),
    gh<GhSearch>(
      `/search/issues?q=${encodeURIComponent(
        `author:${user.login} type:pr is:merged`,
      )}&per_page=1`,
    ).catch(() => ({ total_count: 0, items: [] }) as GhSearch),
  ]);

  const upstreamPRs: PR[] = search.items
    .flatMap<PR>((it) => {
      const r = ownerOf(it.repository_url);
      if (!r) return [];
      return [
        {
          title: it.title,
          number: it.number,
          repo: r.full,
          owner: r.owner,
          url: it.html_url,
          mergedAt: it.pull_request?.merged_at ?? it.closed_at,
          upstream: true,
        },
      ];
    })
    .sort((a, b) => String(b.mergedAt).localeCompare(String(a.mergedAt)));

  const weights = new Map<string, number>();
  for (const r of repos) {
    if (!r.lang) continue;
    weights.set(r.lang, (weights.get(r.lang) ?? 0) + Math.log10(r.stars + 10));
  }
  const langs: Lang[] = [...weights.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, weight]) => ({ name, weight: Number(weight.toFixed(3)) }));

  return {
    login: user.login,
    name: user.name ?? user.login,
    avatar: user.avatar_url,
    bio: user.bio,
    company: user.company,
    location: user.location,
    blog: user.blog,
    followers: user.followers,
    publicRepos: user.public_repos,
    createdAt: user.created_at,
    url: user.html_url,
    repos: repos.slice(0, 12),
    totalStars: repos.reduce((s, r) => s + r.stars, 0),
    mergedTotal: allMerged.total_count,
    upstreamTotal: search.total_count,
    upstreamPRs,
    upstreamOwners: [...new Set(upstreamPRs.map((p) => p.owner))],
    langs,
    days,
    orgs,
    source: "live",
  };
}

/** Turns a single pasted link into something displayable. */
export async function resolveLink(
  target: Exclude<
    import("./parse").Target,
    { kind: "user" } | { kind: "unknown" }
  >,
): Promise<ResolvedLink & { author?: string }> {
  if (target.kind === "pr" || target.kind === "issue") {
    const { owner, repo, number } = target;
    const it = await gh<{
      title: string; html_url: string; user: { login: string } | null;
      merged_at?: string | null; merged?: boolean; body: string | null;
    }>(
      `/repos/${owner}/${repo}/${
        target.kind === "pr" ? "pulls" : "issues"
      }/${number}`,
    );
    return {
      url: it.html_url,
      kind: target.kind,
      title: it.title,
      repo: `${owner}/${repo}`,
      owner,
      merged: Boolean(it.merged ?? it.merged_at),
      mergedAt: it.merged_at ?? null,
      author: it.user?.login,
    };
  }

  if (target.kind === "commit") {
    const { owner, repo, sha } = target;
    const c = await gh<{
      html_url: string; commit: { message: string };
      author: { login: string } | null;
    }>(`/repos/${owner}/${repo}/commits/${sha}`);
    return {
      url: c.html_url,
      kind: "commit",
      title: c.commit.message.split("\n")[0],
      repo: `${owner}/${repo}`,
      owner,
      author: c.author?.login,
    };
  }

  if (target.kind === "repo") {
    const { owner, repo } = target;
    const r = await gh<GhRepo & { owner: { login: string } }>(
      `/repos/${owner}/${repo}`,
    );
    return {
      url: r.html_url,
      kind: "repo",
      title: r.full_name,
      repo: r.full_name,
      owner,
      desc: r.description,
      stars: r.stargazers_count,
      lang: r.language,
      author: r.owner.login,
    };
  }

  // Anything that isn't GitHub: read the page's own metadata so contributions
  // living on GitLab, Codeberg, a mailing list, or a blog still have a card.
  const res = await fetch(target.url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; merged-showcase)" },
    redirect: "follow",
  });
  if (!res.ok) throw new GitHubError(`That link returned ${res.status}.`, res.status);

  const html = (await res.text()).slice(0, 200_000);
  const meta = (prop: string) => {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']`,
      "i",
    );
    const alt = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop}["']`,
      "i",
    );
    return re.exec(html)?.[1] ?? alt.exec(html)?.[1] ?? null;
  };
  const title =
    meta("og:title") ??
    /<title[^>]*>([^<]+)<\/title>/i.exec(html)?.[1]?.trim() ??
    target.url;

  return {
    url: target.url,
    kind: "web",
    title: decodeEntities(title),
    desc: meta("og:description") ? decodeEntities(meta("og:description")!) : null,
    site: new URL(target.url).hostname.replace(/^www\./, ""),
  };
}

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/g, "'");
}
