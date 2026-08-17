/**
 * Replaces the projected upstream estimate with an exact one.
 *
 * The first pass sampled a person's 24 most recent merged PRs and extrapolated.
 * That is a biased estimator: recent work clusters on whatever you are
 * currently employed to build, so it scored Brad Fitzpatrick — who has
 * thousands of merged patches across Go and beyond — as a first-time
 * contributor, because his recent PRs all went to Tailscale.
 *
 * GitHub search accepts negative owner qualifiers, so we can just ask the
 * precise question instead:
 *
 *   author:X type:pr is:merged -user:X -user:<each org they belong to>
 *
 * One request returns the exact lifetime count AND up to 100 real upstream
 * PRs, which also become the contribution wall.
 *
 *   node scripts/augment-upstream.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILE = join(ROOT, "data", "seed.json");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const seed = JSON.parse(await readFile(FILE, "utf8"));

function ownerOf(url) {
  const m = /repos\/([^/]+)\/([^/]+)$/.exec(url || "");
  return m ? { owner: m[1], repo: m[2], full: `${m[1]}/${m[2]}` } : null;
}

for (const p of seed.profiles) {
  const excluded = [p.login, ...(p.orgs ?? [])];
  const q = [
    `author:${p.login}`,
    "type:pr",
    "is:merged",
    ...excluded.map((o) => `-user:${o}`),
  ].join(" ");

  const url =
    `https://api.github.com/search/issues?q=${encodeURIComponent(q)}` +
    `&per_page=100&sort=updated`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "merged-showcase-seed",
      Accept: "application/vnd.github+json",
    },
  });

  if (!res.ok) {
    console.log(`  ${p.login} … FAILED ${res.status}`);
    await sleep(8000);
    continue;
  }

  const data = await res.json();
  const items = (data.items ?? [])
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
        upstream: true,
      };
    })
    .filter(Boolean)
    .sort((a, b) => String(b.mergedAt).localeCompare(String(a.mergedAt)));

  p.upstreamTotal = data.total_count ?? 0;
  p.upstreamPRs = items;
  p.upstreamOwners = [...new Set(items.map((i) => i.owner))];
  // The old projected sample is no longer used for scoring; keep the field off
  // the payload so nothing accidentally reads a stale estimate.
  delete p.prs;

  console.log(
    `  ${p.login} … ${p.upstreamTotal} upstream across ` +
      `${p.upstreamOwners.length}+ owners (excluded ${excluded.length})`,
  );
  await sleep(7500); // search allows 10 req/min unauthenticated
}

await writeFile(FILE, JSON.stringify(seed, null, 2));
console.log("\nUpdated data/seed.json with exact upstream counts.");
