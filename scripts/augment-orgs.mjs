/**
 * Adds public org membership to each seeded profile.
 *
 * Without it, "upstream" counts any repo not owned by the personal account —
 * which wrongly credits Rich-Harris for sveltejs/svelte and Evan You for
 * vuejs/core. Those are their own orgs. A patch only earns upstream credit when
 * it lands somewhere the author has no home-team claim to.
 *
 *   node scripts/augment-orgs.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FILE = join(ROOT, "data", "seed.json");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const seed = JSON.parse(await readFile(FILE, "utf8"));

for (const p of seed.profiles) {
  const res = await fetch(`https://api.github.com/users/${p.login}/orgs`, {
    headers: {
      "User-Agent": "merged-showcase-seed",
      Accept: "application/vnd.github+json",
    },
  });
  const orgs = res.ok ? await res.json() : [];
  p.orgs = orgs.map((o) => o.login);
  console.log(`  ${p.login} → ${p.orgs.join(", ") || "(none public)"}`);
  await sleep(400);
}

await writeFile(FILE, JSON.stringify(seed, null, 2));
console.log("\nUpdated data/seed.json with org membership.");
