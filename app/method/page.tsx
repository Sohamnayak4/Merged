import Link from "next/link";
import { ALL_TIERS } from "@/lib/score";

export const metadata = {
  title: "Method — MERGED.",
  description: "How impact is counted, and where the count falls short.",
};

const PARTS = [
  {
    label: "Upstream",
    weight: 420,
    body: "Pull requests you opened that were merged into repositories owned by neither you nor any org you publicly belong to. Someone with commit rights read your work and chose to take it. This is the number the board is really about.",
  },
  {
    label: "Reach",
    weight: 220,
    body: "Stars across the projects you maintain. It measures how many people found your own work worth keeping — real, but easy to win once and coast on, so it sits well below Upstream.",
  },
  {
    label: "Breadth",
    weight: 180,
    body: "How many distinct owners have merged your patches. Landing fifty patches in one repo shows commitment; landing fifty across twenty repos shows you can walk into an unfamiliar codebase and be useful.",
  },
  {
    label: "Standing",
    weight: 90,
    body: "Followers on GitHub. A weak proxy for reputation, deliberately capped low so popularity can't buy a tier.",
  },
  {
    label: "Current",
    weight: 90,
    body: "Contribution activity over the last 90 days. Enough to separate active contributors from dormant ones, not enough to punish anyone who took a season off.",
  },
];

export default function MethodPage() {
  return (
    <>
      <section className="gutter-field border-b border-line">
        <div className="mx-auto max-w-[820px] px-5 py-14 sm:px-8 sm:py-20">
          <p className="label mb-5 flex items-center gap-2">
            <span className="inline-block h-px w-6 bg-merge" />
            Method
          </p>
          <h1 className="display text-[40px] sm:text-[54px]">
            What counts, and
            <br />
            what doesn&rsquo;t.
          </h1>
          <p className="mt-6 max-w-[56ch] text-[15.5px] leading-relaxed text-mid">
            A ranking nobody can interrogate is a ranking nobody should trust.
            Here is the whole formula, including the parts of it that are
            wrong.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[820px] px-5 py-14 sm:px-8">
        {/* ── the parts ──────────────────────────────────────── */}
        <h2 className="display text-[26px]">The five parts</h2>
        <p className="mono mt-1.5 text-[11px] text-dim">
          1,000 points available, distributed on purpose
        </p>

        <ul className="mt-7 flex flex-col">
          {PARTS.map((p) => (
            <li key={p.label} className="border-t border-line py-5">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="mono text-[14px] text-fg">{p.label}</h3>
                <span className="mono tnum shrink-0 text-[12px] text-merge">
                  {p.weight} pts
                </span>
              </div>
              <div
                className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-ink-800"
                aria-hidden
              >
                <div
                  className="h-full rounded-full bg-merge/60"
                  style={{ width: `${(p.weight / 1000) * 100}%` }}
                />
              </div>
              <p className="mt-3 max-w-[62ch] text-[14px] leading-relaxed text-mid">
                {p.body}
              </p>
            </li>
          ))}
        </ul>

        {/* ── the curve ──────────────────────────────────────── */}
        <h2 className="display mt-16 text-[26px]">Why nothing scales linearly</h2>
        <p className="mt-4 max-w-[62ch] text-[14.5px] leading-relaxed text-mid">
          Each part runs through a saturating curve rather than a straight line.
          The distance between zero and fifty upstream patches is a career
          change; the distance between five hundred and five hundred fifty is
          noise. A linear score would say those gaps are equal, so the curve
          says otherwise.
        </p>
        <pre className="patch mt-5 overflow-x-auto rounded-[4px] border border-line bg-ink-900 px-4 py-3 text-mid">
          <div>
            <span className="text-dim">score</span> = Σ weight ×{" "}
            <span className="text-merge">(1 − e^(−value / k))</span>
          </div>
        </pre>

        {/* ── tiers ──────────────────────────────────────────── */}
        <h2 className="display mt-16 text-[26px]">The ladder</h2>
        <p className="mt-4 max-w-[62ch] text-[14.5px] leading-relaxed text-mid">
          Tier names are borrowed from the roles real projects give their own
          people, rather than invented metals.
        </p>
        <ul className="mt-6 overflow-hidden rounded-[4px] border border-line">
          {[...ALL_TIERS].reverse().map((t, i) => (
            <li
              key={t.name}
              className={`flex items-baseline justify-between gap-4 px-4 py-3 ${
                i % 2 ? "bg-ink-900" : "bg-ink-950"
              }`}
            >
              <span className="mono text-[13px] text-fg">{t.name}</span>
              <span className="mono tnum text-[12px] text-dim">
                {t.min}+ impact
              </span>
            </li>
          ))}
        </ul>

        {/* ── the honest part ────────────────────────────────── */}
        <h2 className="display mt-16 text-[26px]">Where this is wrong</h2>
        <p className="mt-4 max-w-[62ch] text-[14.5px] leading-relaxed text-mid">
          Every ranking encodes a bias. These are the ones known about:
        </p>

        <ul className="mt-6 flex flex-col gap-4">
          {[
            [
              "Private org membership is invisible",
              "Home teams are detected from public org membership. Someone who works on a project without publicly joining its org gets credited as an outside contributor, which overstates them.",
            ],
            [
              "Breadth is a floor, not a total",
              "Only the 100 most recent upstream patches are readable without an account, so anyone prolific has touched more owners than the board can see.",
            ],
            [
              "Pull requests aren't the only contribution",
              "Review, triage, documentation, maintainership, and mailing-list patches are real work and none of it appears here. A reviewer who never opens a PR scores zero.",
            ],
            [
              "Reach rewards timing",
              "Stars accumulate on whatever got popular. An early, lucky project outranks better work published later.",
            ],
          ].map(([head, body]) => (
            <li
              key={head}
              className="rounded-[4px] border border-line bg-ink-900 p-4"
            >
              <p className="patch patch-del rounded-[2px] py-1 pl-2.5 text-[12.5px] text-fg">
                <span className="mr-1.5 text-del">−</span>
                {head}
              </p>
              <p className="mt-2.5 pl-2.5 text-[13.5px] leading-relaxed text-mid">
                {body}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-14 border-t border-line pt-8">
          <p className="text-[14.5px] leading-relaxed text-mid">
            Data comes from GitHub&rsquo;s public API and public contribution
            graphs, read without an account.
          </p>
          <Link
            href="/add"
            className="mono mt-6 inline-block rounded-[3px] bg-merge px-4 py-2.5 text-[12.5px] font-medium text-ink-950 transition-opacity hover:opacity-90"
          >
            + Add your work
          </Link>
        </div>
      </div>
    </>
  );
}
