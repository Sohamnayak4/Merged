import Link from "next/link";
import Board from "@/components/Board";
import FeatureRow from "@/components/FeatureRow";
import HeroInput from "@/components/HeroInput";
import PatchPanel, { type Line } from "@/components/PatchPanel";
import StatGrid, { boardStats } from "@/components/StatGrid";
import Ticker from "@/components/Ticker";
import Wall from "@/components/Wall";
import { boardTotals, listBoard, wallItems } from "@/lib/db";

// The board changes when someone joins or the nightly refresh runs, so serve
// it from cache and rebuild every few minutes. Adding yourself revalidates
// this path immediately, so you never land on a page that omits you.
export const revalidate = 300;

export default async function Home() {
  const [rows, feed, totals] = await Promise.all([
    listBoard(),
    wallItems(60, 12),
    boardTotals(),
  ]);

  // The hero patch is generated from the live board, so the names typing
  // themselves onto the page are the people actually leading it.
  const top = rows.slice(0, 3);
  const pad = Math.max(...top.map((r) => r.login.length), 3) + 2;
  const lines: Line[] = [
    { kind: "meta", text: "diff --git a/CONTRIBUTORS b/CONTRIBUTORS" },
    { kind: "meta", text: "--- a/CONTRIBUTORS" },
    { kind: "meta", text: "+++ b/CONTRIBUTORS" },
    { kind: "hunk", text: "@@ ranked by patches merged upstream @@" },
    { kind: "ctx", text: "  # work that landed in someone else's repo" },
    ...top.map(
      (r): Line => ({
        kind: "add",
        text: `+ ${r.login.padEnd(pad)}${String(r.upstreamTotal).padStart(
          5,
        )} upstream   ${r.tier.name}`,
      }),
    ),
    { kind: "add", text: `+ ${"you".padEnd(pad)}    ? upstream   —` },
  ];

  return (
    <>
      {/* ── hero ───────────────────────────────────────────────── */}
      <section className="gutter-field border-b border-line">
        <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div className="rise">
            <p className="label mb-6 flex items-center gap-2">
              <span className="inline-block h-px w-6 bg-merge" />
              The open-source showcase
            </p>

            <h1 className="display text-[46px] sm:text-[62px] lg:text-[68px]">
              Your best work is in
              <br />
              <span className="text-merge">someone else&rsquo;s</span> repo.
            </h1>

            <p className="mt-6 max-w-[46ch] text-[15.5px] leading-relaxed text-mid">
              Stars measure what you own. This board measures what other
              maintainers let you change — every patch counted here was reviewed
              and merged by someone who didn&rsquo;t have to say yes.
            </p>

            <div className="mt-8 max-w-[520px]">
              <HeroInput />
            </div>
          </div>

          <div className="rise lg:mt-0" style={{ animationDelay: "180ms" }}>
            <PatchPanel lines={lines} />
          </div>
        </div>
      </section>

      <Ticker items={feed} />

      {/* ── aggregates ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8">
        <StatGrid stats={boardStats(totals)} />
      </section>

      <Board rows={rows} feature={<FeatureRow />} />

      {/* ── the wall ───────────────────────────────────────────── */}
      {feed.length > 0 && (
        <section className="mx-auto mt-24 max-w-[1180px] px-5 sm:px-8">
          <div className="flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="display text-[30px] sm:text-[38px]">The wall</h2>
              <p className="mono mt-1.5 text-[11px] text-dim">
                Individual patches, newest first — the actual work behind the
                numbers
              </p>
            </div>
            <Link
              href="/wall"
              className="mono shrink-0 rounded-[3px] border border-line px-3 py-1.5 text-[11.5px] text-mid transition-colors hover:border-line-2 hover:text-fg"
            >
              See all →
            </Link>
          </div>

          <div className="pt-6">
            <Wall items={feed.slice(0, 12)} />
          </div>
        </section>
      )}

      {/* ── close ──────────────────────────────────────────────── */}
      <section className="mx-auto mt-24 max-w-[1180px] px-5 sm:px-8">
        <div className="rounded-[4px] border border-line bg-ink-900 px-6 py-12 text-center sm:px-12 sm:py-16">
          <h2 className="display text-[32px] sm:text-[42px]">
            Add your line to the file.
          </h2>
          <p className="mx-auto mt-4 max-w-[48ch] text-[15px] leading-relaxed text-mid">
            Paste your GitHub profile and the board reads the rest — merged
            patches, the repos that accepted them, and what you ship in.
          </p>
          <Link
            href="/add"
            className="mono mt-8 inline-block rounded-[3px] bg-merge px-5 py-2.5 text-[12.5px] font-medium text-ink-950 transition-opacity hover:opacity-90"
          >
            + Add yours
          </Link>
        </div>
      </section>
    </>
  );
}
