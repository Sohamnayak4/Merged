# MERGED.

**[itsmerged.vercel.app](https://itsmerged.vercel.app)**

An open-source showcase and leaderboard. It ranks people by the patches other
maintainers merged — not by stars on their own projects.

Next.js (App Router) · Supabase Postgres · no accounts, no sessions.

---

## Deploy runbook

Everything below is manual and takes about fifteen minutes end to end. Steps
are in dependency order — don't skip ahead.

### 1. GitHub token

<https://github.com/settings/tokens?type=beta> → **Generate new token**.

- Name it anything, set an expiry you'll remember.
- **No account permissions, no repository access.** Everything read here is
  public, so an empty-scope token is enough.

Copy it. Without one you get 60 requests/hour per IP — roughly eight visitors
before the site is hard-down. With it, 5,000/hour.

### 2. Supabase project

1. <https://supabase.com/dashboard> → **New project**. Pick a region near your
   Vercel region.
2. Wait for it to finish provisioning.
3. **SQL Editor → New query** → paste all of [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
   It should report success and create four tables plus two functions. Safe to
   re-run.
4. **Project Settings → Data API** → copy the **Project URL**.
5. **Project Settings → API Keys** → reveal and copy the **`service_role`** key.
   Not the `anon` key — the app writes, and RLS is on with no policies.

### 3. Local env

```bash
cp .env.example .env.local
```

Fill in the four values, then:

```bash
npm install
npm run dev
```

The board will be empty until you import (next step).

### 4. Import the seed

Fourteen real contributors, captured once, so the board isn't empty on day one.

```bash
curl -X POST http://localhost:3000/api/admin/import \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

It returns each login with its computed score. Reload the site — the board
should be populated.

### 5. Push to GitHub, then Vercel

```bash
git init && git add -A && git commit -m "MERGED."
gh repo create merged --public --source=. --push
```

<https://vercel.com/new> → import the repo. Before clicking Deploy, add the
environment variables from your `.env` under **Environment Variables**
(Production, Preview, and Development).

> They must exist **before the first build** — pages prerender at build time
> and read the database then.

**Set `NEXT_PUBLIC_SITE_URL` to the address you'll actually share**, including
on a plain `*.vercel.app`. Auto-detection reads `VERCEL_PROJECT_PRODUCTION_URL`,
which is Vercel's generated project URL — if you renamed the project or added
an alias, that value is a *different hostname*, and every canonical link and
share card will advertise it instead of yours.

### 6. Import on production

Once deployed, run the import once more against the live host:

```bash
curl -X POST https://YOUR-APP.vercel.app/api/admin/import \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 7. Confirm the cron registered

Vercel → project → **Settings → Cron Jobs**. You should see
`/api/cron/refresh` scheduled daily at 04:00 UTC, from [`vercel.json`](vercel.json).
Hobby plans allow one run per day, which is what this is set to.

---

## Ongoing manual work

**Removal requests.** `/remove` writes to the `removal_requests` table rather
than acting immediately — without accounts there's no way to prove the person
asking is the person listed, and letting anyone hide anyone would just be a
different kind of abuse. So this one is on you:

```sql
-- Supabase → SQL Editor
select * from removal_requests where handled = false order by created_at;

update profiles set status = 'hidden' where login = 'the-handle';
update removal_requests set handled = true where login = 'the-handle';
```

Then flush the cache, or the removed profile keeps being served from
prerendered HTML until Next's own timer expires:

```bash
curl -X POST https://itsmerged.vercel.app/api/admin/revalidate -H "Authorization: Bearer $CRON_SECRET"
```

**Any change made directly in SQL needs that call.** Writes that go through
the app revalidate themselves; the database has no way to tell Next it
changed.

Hidden rows stay in the table on purpose, so the next passer-by can't silently
re-add someone who asked to be left alone. Check this weekly — you're ranking
real named people who never opted in, and one unanswered request is a worse
story than the product.

---

## Sharing

Profiles live at the root: **`/yourname`**, not `/u/yourname`. The old path
permanently redirects, so links that escaped earlier still land in one
canonical place. Each profile shows its own URL with a copy button next to the
handle.

Share cards are generated per profile at request time and published as both
`og:image` and `twitter:image` (`summary_large_image`), so X, Slack, Discord
and iMessage all unfurl the same card. The card leads with the number that's
hard to fake — patches other people merged — drawn as a diff line.

Fonts are vendored as TrueType in `assets/` rather than fetched at request
time: satori can't read woff2, and a card that depends on a live call to
Google renders as system-font mush exactly when someone is pasting the link
somewhere public. `next.config.ts` traces those files into the serverless
bundle; without that they'd be missing in production only.

To check a card without posting it anywhere, open the route directly:

```
/opengraph-image          the site card
/<login>/opengraph-image  a profile card
```

## The idea

Most developer scoreboards count commits or stars, which rewards owning a
popular repository and shipping to yourself. The meaningful unit of open source
is different: a patch somebody else reviewed and merged into a codebase you
don't control.

So the headline metric is **Upstream** — merged pull requests to repositories
owned by neither you nor any org you publicly belong to. The org exclusion
matters: without it a Svelte core maintainer is credited as an outside
contributor to Svelte, which is exactly backwards.

`/method` publishes the full formula in the UI, including where it's wrong.

## Where the data comes from

All public GitHub data:

| Data | Source |
| --- | --- |
| Profile, repos, orgs | `api.github.com` REST |
| Exact upstream count | Search with `-user:` exclusions for the author and every org they belong to |
| Contribution calendar | `github.com/users/<login>/contributions` (public HTML) |
| Non-GitHub links | The page's own OpenGraph tags |

Postgres is the runtime source of truth. `data/seed.json` is read once by
`/api/admin/import` and by nothing else, which keeps 560KB of JSON out of the
page bundles.

### Regenerating the seed

Only needed if you want different starting contributors. Edit the `LOGINS`
array in `scripts/seed.mjs`, then run all three in order — it throttles to stay
under the search API's rate limit, so it takes a few minutes.

```bash
node scripts/seed.mjs && node scripts/augment-orgs.mjs && node scripts/augment-upstream.mjs
```

## Design

Dark, minimal, built on the one material every contribution is actually made
of: the diff.

- **Violet** (`#a371f7`, the colour GitHub paints a merged PR) is the brand and
  the only decorative accent.
- **Green and red mean diff, nothing else** — added, removed. Nothing is green
  just to look alive.
- The hero is a unified diff that types itself and ends by adding *you*;
  submitting is framed as opening a pull request against the board.
- Type: Familjen Grotesk (display), Instrument Sans (prose), JetBrains Mono
  (all data).

## Layout

```
app/
  page.tsx                hero · ticker · totals · board · wall
  [login]/                profile showcase — the shareable /yourname URL
    opengraph-image.tsx   generated share card
  u/[login]/              permanent redirect to /[login]
  icon.svg                favicon
  apple-icon.tsx          iOS home-screen icon
  opengraph-image.tsx     site-level share card
  add/                    paste a link, preview the patch, merge to board
  wall/                   every upstream patch
  method/                 how the score works and where it fails
  remove/                 opt-out
  api/resolve/            read-only preview of a pasted link
  api/add/                the only public write
  api/removal/            queues an opt-out request
  api/cron/refresh/       nightly, CRON_SECRET-guarded
  api/admin/import/       one-time seed import, CRON_SECRET-guarded
lib/
  score.ts                the impact formula
  db.ts                   every query
  supabase.ts             service-role client, server-only
  database.types.ts       hand-written schema types
  github.ts               GitHub client
  parse.ts                works out what a pasted string is
supabase/schema.sql       run this in the SQL editor
```

## Known gaps

- **Ingest is synchronous.** Building a profile is six or seven GitHub calls
  inside one request (`maxDuration = 60`). Fine at launch volume; it wants a
  queue if `/add` gets busy.
- **No claiming.** If someone wants to prove a profile is theirs, the natural
  fit is a code in their GitHub bio verified through the API calls already
  being made. No OAuth needed.
