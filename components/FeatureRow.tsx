import Link from "next/link";
import { activeSponsor, SPONSOR_HREF, SPONSOR_REL } from "@/lib/sponsor";

/**
 * A row on the board that isn't a person.
 *
 * It borrows the contributor row's grid, padding and height exactly, so the
 * list keeps its rhythm. Everything that differs says the same thing: this row
 * is a different *kind* of thing, not a different rank. It carries no number
 * anywhere — no position, no impact, none of the three counts — sits on a
 * fractionally lighter ground, wears a 2px accent edge instead of the hairline
 * hover bar, and its badge is an outline where every tier badge is a fill.
 */

// The contributor row's own grid and padding, to the pixel. `relative` carries
// the accent edge, which is drawn as an overlay rather than a border so it
// can be 2px without pushing the columns out of alignment with the rows above.
const ROW =
  "group relative grid cursor-pointer grid-cols-[26px_1fr_auto] items-center gap-3 " +
  "border-b border-line bg-ink-900 px-2 py-3.5 transition-colors " +
  "lg:grid-cols-[34px_1fr_88px_78px_74px_104px]";

const HOVER = "hover:bg-ink-850";

/** Outline, where TierBadge fills. A tier is earned; this was bought. */
const BADGE =
  "mono inline-flex items-center whitespace-nowrap rounded-[2px] border " +
  "border-merge/50 px-1.5 py-0.5 text-[9.5px] uppercase tracking-[0.14em] text-merge";

function Edge() {
  return (
    <span
      aria-hidden
      className="absolute left-0 top-0 h-full w-[2px] bg-merge/70"
    />
  );
}

function Rank() {
  return (
    <span className="mono text-[13px] text-dim" aria-hidden>
      —
    </span>
  );
}

function Badge() {
  return (
    <span className="flex flex-col items-end gap-1">
      {/* The impact number's slot, held open and left empty — one line of the
          score's own type, with no glyph in it. It keeps this row exactly as
          tall as the ones above and below without printing a score the row
          didn't earn, and without hiding invisible text in the page. */}
      <span className="mono h-[1lh] text-[15px]" aria-hidden />
      <span className={BADGE}>Sponsor</span>
    </span>
  );
}

/**
 * `preview` renders the same row without its link, for the mock on /sponsor —
 * so what a buyer is shown is the component itself and can't drift from it.
 */
export default function FeatureRow({ preview = false }: { preview?: boolean }) {
  const sponsor = activeSponsor();

  if (!sponsor) {
    const body = (
      <>
        <Edge />
        <Rank />
        <span className="flex min-w-0 items-center gap-3">
          <span className="mono flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] border border-dashed border-line-2 bg-ink-850 text-[13px] text-dim">
            +
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-medium text-fg">
              Your tool, right here
            </span>
            <span className="mono block text-[11px] leading-snug text-dim lg:truncate lg:leading-normal">
              in front of every contributor on this board
            </span>
            <span className="mono mt-1 block text-[11px] leading-snug text-merge lg:hidden">
              This row is for sale →
            </span>
            <span
              className="mt-1.5 hidden h-[2px] max-w-[220px] rounded-full bg-merge/25 lg:block"
              aria-hidden
            />
          </span>
        </span>
        <span className="mono hidden text-right text-[12.5px] text-merge lg:col-span-3 lg:block">
          This row is for sale →
        </span>
        <Badge />
      </>
    );

    return preview ? (
      <div className={ROW}>{body}</div>
    ) : (
      <Link href={SPONSOR_HREF} className={`${ROW} ${HOVER}`}>
        {body}
      </Link>
    );
  }

  const body = (
    <>
      <Edge />
      <Rank />
      <span className="flex min-w-0 items-center gap-3">
        {sponsor.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sponsor.logoUrl}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 rounded-[3px] border border-line bg-ink-850 object-contain"
          />
        ) : (
          <span className="mono flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] border border-line bg-ink-850 text-[13px] text-merge">
            {sponsor.name[0]?.toUpperCase()}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-medium text-fg">
            {sponsor.name}
          </span>
          <span className="mono block text-[11px] leading-snug text-dim lg:truncate lg:leading-normal">
            {sponsor.tagline}
          </span>
          <span className="mono mt-1 block text-[11px] leading-snug text-mid lg:hidden">
            {sponsor.blurb}
          </span>
          <span
            className="mt-1.5 hidden h-[2px] max-w-[220px] rounded-full bg-merge/25 lg:block"
            aria-hidden
          />
        </span>
      </span>
      <span className="mono hidden truncate text-right text-[12.5px] text-mid lg:col-span-3 lg:block">
        {sponsor.blurb}
      </span>
      <Badge />
    </>
  );

  return preview ? (
    <div className={ROW}>{body}</div>
  ) : (
    <a
      href={sponsor.url}
      target="_blank"
      rel={SPONSOR_REL}
      className={`${ROW} ${HOVER}`}
    >
      {body}
    </a>
  );
}
