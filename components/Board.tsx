"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { avatarFor, compact } from "@/lib/format";
import { loadMine } from "@/lib/mine";
import type { BoardRow } from "@/lib/db";
import LangDNA from "./LangDNA";
import TierBadge from "./TierBadge";

type SortKey = "impact" | "upstream" | "reach" | "current";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "impact", label: "Impact" },
  { key: "upstream", label: "Upstream" },
  { key: "reach", label: "Reach" },
  { key: "current", label: "Current" },
];

/**
 * Rows arrive already ranked by Postgres. Sorting and filtering here are view
 * state only — rank is always the person's standing on the whole board, so
 * filtering to Rust never renumbers anyone.
 */
export default function Board({ rows }: { rows: BoardRow[] }) {
  const [mine, setMine] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("impact");
  const [lang, setLang] = useState<string | null>(null);

  useEffect(() => setMine(loadMine()), []);

  const ranked = useMemo(
    () => rows.map((row, i) => ({ row, rank: i + 1 })),
    [rows],
  );

  const languages = useMemo(() => {
    const count = new Map<string, number>();
    for (const { row } of ranked)
      for (const l of row.langs ?? [])
        count.set(l.name, (count.get(l.name) ?? 0) + 1);
    return [...count.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name]) => name);
  }, [ranked]);

  const visible = useMemo(() => {
    const filtered = lang
      ? ranked.filter((r) => r.row.langs?.some((l) => l.name === lang))
      : ranked;

    const by: Record<SortKey, (r: (typeof ranked)[number]) => number> = {
      impact: (r) => r.row.score,
      upstream: (r) => r.row.upstreamTotal,
      reach: (r) => r.row.totalStars,
      current: (r) => r.row.last90,
    };
    return [...filtered].sort((a, b) => by[sort](b) - by[sort](a));
  }, [ranked, sort, lang]);

  return (
    <section id="board" className="mx-auto max-w-[1180px] px-5 sm:px-8">
      <div className="flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="display text-[30px] sm:text-[38px]">The board</h2>
          <p className="mono mt-1.5 text-[11px] text-dim">
            {visible.length} {visible.length === 1 ? "person" : "people"}
            {lang ? ` shipping ${lang}` : ""} · ranked by patches other people
            merged
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <span className="label mr-1">Sort</span>
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              aria-pressed={sort === s.key}
              className={`mono rounded-[3px] px-2.5 py-1.5 text-[11px] transition-colors ${
                sort === s.key
                  ? "bg-merge/15 text-merge"
                  : "text-dim hover:text-fg"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {languages.length > 1 && (
        <div className="flex flex-wrap items-center gap-1.5 py-3.5">
          <button
            onClick={() => setLang(null)}
            aria-pressed={lang === null}
            className={`mono rounded-[3px] border px-2 py-1 text-[11px] transition-colors ${
              lang === null
                ? "border-line-2 bg-ink-800 text-fg"
                : "border-transparent text-dim hover:text-mid"
            }`}
          >
            All
          </button>
          {languages.map((l) => (
            <button
              key={l}
              onClick={() => setLang(lang === l ? null : l)}
              aria-pressed={lang === l}
              className={`mono rounded-[3px] border px-2 py-1 text-[11px] transition-colors ${
                lang === l
                  ? "border-line-2 bg-ink-800 text-fg"
                  : "border-transparent text-dim hover:text-mid"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      )}

      <div className="label hidden grid-cols-[34px_1fr_88px_78px_74px_104px] items-center gap-3 border-b border-line px-2 py-2.5 lg:grid">
        <span>#</span>
        <span>Contributor</span>
        <span className="text-right">Upstream</span>
        <span className="text-right">Reach</span>
        <span className="text-right">Owners</span>
        <span className="text-right">Impact</span>
      </div>

      <ol>
        {visible.map(({ row, rank }, i) => {
          const isMine = mine.includes(row.login.toLowerCase());
          return (
            <li
              key={row.login}
              className="rise"
              style={{ animationDelay: `${Math.min(i, 12) * 34}ms` }}
            >
              <Link
                href={`/${row.login}`}
                className="group relative grid grid-cols-[26px_1fr_auto] items-center gap-3 border-b border-line px-2 py-3.5 transition-colors hover:bg-ink-900 lg:grid-cols-[34px_1fr_88px_78px_74px_104px]"
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-0 h-full w-[2px] scale-y-0 bg-add transition-transform duration-200 group-hover:scale-y-100"
                />

                <span
                  className={`mono tnum text-[13px] ${
                    rank <= 3 ? "text-merge" : "text-dim"
                  }`}
                >
                  {String(rank).padStart(2, "0")}
                </span>

                <span className="flex min-w-0 items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarFor(row)}
                    alt=""
                    width={32}
                    height={32}
                    loading="lazy"
                    className="h-8 w-8 shrink-0 rounded-[3px] border border-line grayscale transition-all duration-300 group-hover:grayscale-0"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[14px] font-medium text-fg">
                        {row.name}
                      </span>
                      {isMine && (
                        <span className="mono shrink-0 rounded-[2px] bg-add/15 px-1 py-px text-[9px] tracking-wider text-add">
                          YOU
                        </span>
                      )}
                    </span>
                    <span className="mono block truncate text-[11px] text-dim">
                      @{row.login}
                    </span>
                    <span className="mt-1.5 block max-w-[220px]">
                      <LangDNA langs={row.langs} height={2} />
                    </span>
                  </span>
                </span>

                <span className="mono tnum hidden text-right text-[13px] text-merge lg:block">
                  {compact(row.upstreamTotal)}
                </span>
                <span className="mono tnum hidden text-right text-[13px] text-mid lg:block">
                  {compact(row.totalStars)}
                </span>
                <span className="mono tnum hidden text-right text-[13px] text-mid lg:block">
                  {row.ownerCount}
                </span>

                <span className="flex flex-col items-end gap-1">
                  <span className="mono tnum text-[15px] text-fg">
                    {row.score}
                  </span>
                  <TierBadge tier={row.tier} />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      {visible.length === 0 && (
        <p className="mono py-14 text-center text-[12px] text-dim">
          {rows.length === 0 ? (
            <>
              Nobody on the board yet.{" "}
              <Link href="/add" className="text-merge underline">
                Add the first
              </Link>
            </>
          ) : (
            <>
              No one on the board ships {lang} yet.{" "}
              <button
                onClick={() => setLang(null)}
                className="text-merge underline"
              >
                Clear the filter
              </button>
            </>
          )}
        </p>
      )}
    </section>
  );
}
