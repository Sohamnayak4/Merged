/**
 * One-time seed builder.
 *
 * GitHub's unauthenticated API allows 60 core requests/hour, which is nowhere
 * near enough to populate a leaderboard on every page load. So we pay that cost
 * once, here, and freeze the result into data/seed.json. The running app reads
 * the frozen file; live extraction is reserved for people adding themselves.
 *
 *   node scripts/seed.mjs
 */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const LOGINS = [
  "sindresorhus",
  "yyx990803",
  "antfu",
  "gaearon",
  "Rich-Harris",
  "tj",
  "mrdoob",
  "leerob",
  "shadcn",
  "tannerlinsley",
  "kentcdodds",
  "addyosmani",
  "cassidoo",
  "bradfitz",
];

const UA = {
  "User-Agent": "merged-showcase-seed",
  Accept: "application/vnd.github+json",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers: UA });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

/**
 * GitHub renders the contribution calendar as a plain HTML table on a public,
 * tokenless endpoint. Each cell carries data-date and data-level (0-4).
 */
async function contributions(login) {
  const res = await fetch(`https://github.com/users/${login}/contributions`, {
    headers: { "User-Agent": UA["User-Agent"] },
  });
  if (!res.ok) return [];
  const html = await res.text();
  const days = [];
  const cell = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d)"/g;
  let m;
  while ((m = cell.exec(html))) days.push({ date: m[1], level: Number(m[2]) });
  days.sort((a, b) => a.date.localeCompare(b.date));
  return days;
}

async function searchMergedPRs(login) {
  // Search has its own 10 req/min unauthenticated budget.
  const q = encodeURIComponent(`author:${login} type:pr is:merged`);
  try {
    const data = await api(`/search/issues?q=${q}&sort=updated&per_page=30`);
    return data;
  } catch {
    return { total_count: 0, items: [] };
  }
}

function ownerOf(repositoryUrl) {
  const m = /repos\/([^/]+)\/([^/]+)$/.exec(repositoryUrl || "");
  return m ? { owner: m[1], repo: m[2], full: `${m[1]}/${m[2]}` } : null;
}

async function build(login) {
  process.stdout.write(`  ${login} … `);
  const user = await api(`/users/${login}`);
  const repos = await api(
    `/users/${login}/repos?per_page=100&sort=pushed&type=owner`,
  );
  const search = await searchMergedPRs(login);
  const days = await contributions(login);

  const owned = repos
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
      topics: (r.topics || []).slice(0, 4),
    }))
    .sort((a, b) => b.stars - a.stars);

  // The signal that actually means "open-source contributor": merged pull
  // requests landed in repositories the author does not own.
  const prs = (search.items || [])
    .map((it) => {
      const r = ownerOf(it.repository_url);
      if (!r) return null;
      return {
        title: it.title,
        number: it.number,
        repo: r.full,
        owner: r.owner,
        url: it.html_url,
        mergedAt: it.pull_request?.merged_at || it.closed_at,
        upstream: r.owner.toLowerCase() !== login.toLowerCase(),
      };
    })
    .filter(Boolean)
    .sort((a, b) => String(b.mergedAt).localeCompare(String(a.mergedAt)));

  const langCount = {};
  for (const r of owned) {
    if (!r.lang) continue;
    // Weight language presence by reach, not by repo count: one 40k-star Rust
    // project says more than nine abandoned shell scripts.
    langCount[r.lang] = (langCount[r.lang] || 0) + Math.log10(r.stars + 10);
  }
  const langs = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, weight]) => ({ name, weight: Number(weight.toFixed(3)) }));

  const out = {
    login: user.login,
    name: user.name || user.login,
    avatar: user.avatar_url,
    bio: user.bio,
    company: user.company,
    location: user.location,
    blog: user.blog,
    followers: user.followers,
    publicRepos: user.public_repos,
    createdAt: user.created_at,
    url: user.html_url,
    repos: owned.slice(0, 12),
    totalStars: owned.reduce((s, r) => s + r.stars, 0),
    mergedTotal: search.total_count || 0,
    prs: prs.slice(0, 24),
    langs,
    days,
  };
  console.log(
    `${out.totalStars} stars · ${out.mergedTotal} merged · ${days.length} days`,
  );
  return out;
}

const profiles = [];
console.log("Fetching real GitHub data…");
for (const login of LOGINS) {
  try {
    profiles.push(await build(login));
  } catch (e) {
    console.log(`  ${login} … FAILED (${e.message})`);
  }
  await sleep(7000); // stay under the 10 req/min search budget
}

await mkdir(join(ROOT, "data"), { recursive: true });
await writeFile(
  join(ROOT, "data", "seed.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), profiles }, null, 2),
);
console.log(`\nWrote data/seed.json — ${profiles.length} profiles.`);
