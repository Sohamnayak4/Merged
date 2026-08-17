import Link from "next/link";
import { ago, avatarFor, cleanMeta, compact, langColor } from "@/lib/format";
import type { PR, Profile, Score } from "@/lib/types";
import Heatmap from "./Heatmap";
import ImpactBars from "./ImpactBars";
import LangDNA from "./LangDNA";
import ShareLink from "./ShareLink";
import TierBadge from "./TierBadge";

function PatchLine({ pr }: { pr: PR }) {
  return (
    <li>
      <a
        href={pr.url}
        target="_blank"
        rel="noopener noreferrer"
        className="patch-add flex items-baseline gap-2.5 px-3.5 py-1.5 transition-colors hover:bg-add/15"
      >
        <span className="shrink-0 text-add">+</span>
        <span className="min-w-0 flex-1 truncate text-fg">{pr.title}</span>
        <span className="shrink-0 text-dim">#{pr.number}</span>
        <span className="hidden shrink-0 text-dim sm:inline">
          {ago(pr.mergedAt)}
        </span>
      </a>
    </li>
  );
}

export default function ProfileView({
  profile,
  score,
  rank,
}: {
  profile: Profile;
  score: Score;
  rank: number;
}) {
  // Patches grouped by the repo that accepted them: the shape of someone's
  // open-source life is which doors opened for them, and how often.
  const byRepo = new Map<string, PR[]>();
  for (const pr of profile.upstreamPRs ?? []) {
    const list = byRepo.get(pr.repo) ?? [];
    list.push(pr);
    byRepo.set(pr.repo, list);
  }
  const allGroups = [...byRepo.entries()].sort(
    (a, b) => b[1].length - a[1].length,
  );
  const groups = allGroups.slice(0, 10);
  const hiddenRepos = allGroups.length - groups.length;

  const joined = new Date(profile.createdAt).getFullYear();

  return (
    <>
      {/* ── identity ───────────────────────────────────────────── */}
      <section className="gutter-field border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 sm:py-14">
          <Link
            href="/"
            className="mono inline-block text-[11.5px] text-dim transition-colors hover:text-fg"
          >
            ← The board
          </Link>

          <div className="mt-7 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarFor(profile)}
                alt=""
                width={88}
                height={88}
                className="h-[72px] w-[72px] shrink-0 rounded-[4px] border border-line sm:h-[88px] sm:w-[88px]"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="display text-[32px] sm:text-[42px]">
                    {profile.name}
                  </h1>
                  <TierBadge tier={score.tier} size="lg" />
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <a
                    href={profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono text-[12.5px] text-dim transition-colors hover:text-merge"
                  >
                    @{profile.login} ↗
                  </a>
                  <ShareLink login={profile.login} />
                </div>

                {profile.bio && (
                  <p className="mt-3.5 max-w-[54ch] text-[14.5px] leading-relaxed text-mid">
                    {profile.bio}
                  </p>
                )}

                <div className="mono mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-dim">
                  {cleanMeta(profile.company) && (
                    <span>{cleanMeta(profile.company)}</span>
                  )}
                  {cleanMeta(profile.location) && (
                    <span>{cleanMeta(profile.location)}</span>
                  )}
                  <span>on GitHub since {joined}</span>
                </div>
              </div>
            </div>

            {/* The headline pair: what the board thinks, and where that lands. */}
            <div className="flex shrink-0 items-start gap-8 lg:gap-10">
              <div>
                <p className="label mb-1.5">Impact</p>
                <p className="mono tnum text-[44px] leading-none text-merge">
                  {score.total}
                </p>
              </div>
              <div>
                <p className="label mb-1.5">Rank</p>
                <p className="mono tnum text-[44px] leading-none text-fg">
                  {String(rank).padStart(2, "0")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── headline counts ────────────────────────────────────── */}
      <section className="mx-auto max-w-[1180px] px-5 pt-10 sm:px-8">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-line bg-line sm:grid-cols-4">
          {[
            {
              n: compact(score.upstreamPRs),
              l: "patches merged upstream",
              tone: "text-merge",
            },
            {
              n: compact(profile.mergedTotal),
              l: "merged pull requests, all repos",
              tone: "text-fg",
            },
            {
              n: `${score.distinctOwners}+`,
              l: "owners who took their work",
              tone: "text-fg",
            },
            {
              n: compact(profile.totalStars),
              l: "stars on projects they maintain",
              tone: "text-fg",
            },
          ].map((s) => (
            <div key={s.l} className="bg-ink-950 px-4 py-5">
              <dt className={`mono tnum text-[27px] ${s.tone}`}>{s.n}</dt>
              <dd className="mono mt-1.5 text-[10.5px] leading-snug text-dim">
                {s.l}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── score + languages ──────────────────────────────────── */}
      <section className="mx-auto grid max-w-[1180px] gap-12 px-5 pt-14 sm:px-8 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
        <div>
          <h2 className="display text-[24px]">How this adds up</h2>
          <p className="mono mt-1 mb-4 text-[11px] text-dim">
            Every part of the score, and what it counted
          </p>
          <ImpactBars score={score} />
        </div>

        <div>
          {profile.langs.length > 0 && (
            <>
              <h2 className="display text-[24px]">What they ship in</h2>
              <p className="mono mt-1 mb-5 text-[11px] text-dim">
                Languages weighted by the reach of the projects using them
              </p>
              <LangDNA langs={profile.langs} height={6} showLabels />
            </>
          )}

          {profile.days.length > 0 && (
            <>
              <h3 className="display mt-11 text-[24px]">A year of commits</h3>
              <p className="mono mt-1 mb-4 text-[11px] text-dim">
                Public contribution activity, straight from GitHub
              </p>
              <Heatmap days={profile.days} cell={9} />
            </>
          )}
        </div>
      </section>

      {/* ── the patches ────────────────────────────────────────── */}
      {groups.length > 0 && (
        <section className="mx-auto max-w-[1180px] px-5 pt-16 sm:px-8">
          <h2 className="display text-[24px]">Where the work landed</h2>
          <p className="mono mt-1 mb-6 text-[11px] text-dim">
            {profile.upstreamPRs.length} most recent upstream patches across{" "}
            {allGroups.length} repositories
            {hiddenRepos > 0 && `, showing the ${groups.length} busiest`}
          </p>

          <div className="flex flex-col gap-5">
            {groups.map(([repo, prs]) => (
              <div
                key={repo}
                className="overflow-hidden rounded-[4px] border border-line bg-ink-900"
              >
                <a
                  href={`https://github.com/${repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="patch patch-hunk flex items-baseline justify-between gap-3 px-3.5 py-2 transition-colors hover:bg-merge/15"
                >
                  <span className="truncate">@@ {repo} @@</span>
                  <span className="shrink-0 text-[11px] text-merge/80">
                    {prs.length} {prs.length === 1 ? "patch" : "patches"}
                  </span>
                </a>

                <ul className="patch">
                  {prs.slice(0, 6).map((pr) => (
                    <PatchLine key={pr.url} pr={pr} />
                  ))}
                </ul>

                {/* A prolific repo can carry dozens of patches. Show enough to
                    prove the relationship, then get out of the way. */}
                {prs.length > 6 && (
                  <details className="group/more">
                    <summary className="mono cursor-pointer list-none px-3.5 py-2 text-[11.5px] text-dim transition-colors hover:text-merge">
                      <span className="group-open/more:hidden">
                        ↓ {prs.length - 6} more in {repo}
                      </span>
                      <span className="hidden group-open/more:inline">
                        ↑ Collapse
                      </span>
                    </summary>
                    <ul className="patch">
                      {prs.slice(6).map((pr) => (
                        <PatchLine key={pr.url} pr={pr} />
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── links pasted by hand ───────────────────────────────── */}
      {profile.links && profile.links.length > 0 && (
        <section className="mx-auto max-w-[1180px] px-5 pt-16 sm:px-8">
          <h2 className="display text-[24px]">Also submitted</h2>
          <p className="mono mt-1 mb-6 text-[11px] text-dim">
            Contribution links added by hand
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {profile.links.map((l) => (
              <li key={l.url}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-[4px] border border-line bg-ink-900 p-3.5 transition-colors hover:border-merge/40"
                >
                  <span className="mono block text-[11px] text-dim">
                    {l.repo ?? l.site ?? "link"}
                  </span>
                  <span className="mt-1 block text-[13.5px] text-fg">
                    {l.title}
                  </span>
                  {l.desc && (
                    <span className="mt-1.5 block text-[12px] leading-snug text-mid">
                      {l.desc}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── what they maintain ─────────────────────────────────── */}
      {profile.repos?.length > 0 && (
        <section className="mx-auto max-w-[1180px] px-5 pt-16 sm:px-8">
          <h2 className="display text-[24px]">What they maintain</h2>
          <p className="mono mt-1 mb-6 text-[11px] text-dim">
            Their own projects, by reach
          </p>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {profile.repos.slice(0, 9).map((r) => (
              <li key={r.full}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full flex-col rounded-[4px] border border-line bg-ink-900 p-4 transition-colors hover:border-merge/40 hover:bg-ink-850"
                >
                  <span className="mono truncate text-[13px] text-fg">
                    {r.name}
                  </span>
                  {r.desc && (
                    <span className="mt-2 line-clamp-2 text-[12.5px] leading-snug text-mid">
                      {r.desc}
                    </span>
                  )}
                  <span className="mono mt-auto flex items-center gap-3 pt-4 text-[11px] text-dim">
                    {r.lang && (
                      <span className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: langColor(r.lang) }}
                        />
                        {r.lang}
                      </span>
                    )}
                    <span className="tnum">★ {compact(r.stars)}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Anyone can add anyone here, so the way off has to be on the page
          itself rather than buried in a policy nobody reads. */}
      <section className="mx-auto max-w-[1180px] px-5 pt-16 sm:px-8">
        <p className="mono border-t border-line pt-5 text-[11px] text-dim">
          Built from public GitHub data.{" "}
          <Link
            href={`/remove?login=${profile.login}`}
            className="underline transition-colors hover:text-fg"
          >
            Ask to be taken off the board
          </Link>
        </p>
      </section>
    </>
  );
}
