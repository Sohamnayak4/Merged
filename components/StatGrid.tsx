import { compact } from "@/lib/format";

export type Stat = { n: string; l: string };

/**
 * The aggregate row. Shared so the numbers on /sponsor are the same numbers
 * the homepage prints, from the same query — a sponsorship page quoting an
 * audience size that drifted from the live board would be the exact kind of
 * claim this site exists to argue against.
 */
export function boardStats(totals: {
  contributors: number;
  upstream: number;
  stars: number;
  repos: number;
}): Stat[] {
  return [
    { n: compact(totals.upstream), l: "patches merged upstream" },
    { n: String(totals.repos), l: "repositories touched" },
    { n: String(totals.contributors), l: "contributors on the board" },
    { n: compact(totals.stars), l: "stars on work they maintain" },
  ];
}

export default function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-line bg-line sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.l} className="bg-ink-950 px-4 py-5">
          <dt className="mono tnum text-[30px] text-fg sm:text-[34px]">{s.n}</dt>
          <dd className="mono mt-1.5 text-[11px] leading-snug text-dim">
            {s.l}
          </dd>
        </div>
      ))}
    </dl>
  );
}
