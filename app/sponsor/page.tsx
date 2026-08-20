import Link from "next/link";
import FeatureRow from "@/components/FeatureRow";
import FooterCredit from "@/components/FooterCredit";
import ProfileStrip from "@/components/ProfileStrip";
import SponsorInquiryForm from "@/components/SponsorInquiryForm";
import StatGrid, { boardStats } from "@/components/StatGrid";
import { boardTotals, getProfile } from "@/lib/db";
import { avatarFor } from "@/lib/format";

export const metadata = {
  title: "Sponsor — MERGED.",
  description:
    "One sponsor at a time, four placements, and a ranking that stays unsold.",
};

// Same cadence as the board itself, so the audience numbers quoted here are
// the numbers on the homepage rather than whatever was true on deploy day.
export const revalidate = 300;

/** My own row on the board, for the block above the form. */
const OWNER = "Sohamnayak4";

/**
 * Three entries for four placements: the two board rows are one component in
 * two positions, and showing the same mock twice cost more scroll than it
 * bought understanding.
 */
const PLACEMENTS = [
  {
    title: "Two rows on the board",
    body: "A full row in the leaderboard, five names deep — where people are still reading.",
    mock: <FeatureRow preview />,
    note: "The second is this same row again after the fifteenth contributor, for everyone who kept scrolling.",
  },
  {
    title: "Every contributor page",
    body: "One line under the profile header, on all of them, for as long as the run lasts.",
    mock: <ProfileStrip preview />,
    note: null,
  },
  {
    title: "The footer, every page",
    body: "A credit line that says who is paying for this to exist without accounts or trackers.",
    mock: (
      <div className="py-2.5">
        <FooterCredit preview />
      </div>
    ),
    note: null,
  },
];

const STEPS = [
  "Send a wordmark SVG and one line of copy",
  "Live within a day",
  "Stats email on the 1st of every month",
  "Cancel any time, no notice period",
];

export default async function SponsorPage() {
  const [totals, me] = await Promise.all([
    boardTotals(),
    getProfile(OWNER).catch(() => null),
  ]);

  const owner = {
    name: me?.profile.name ?? "Soham Nayak",
    avatar: avatarFor(me?.profile ?? { login: OWNER }),
  };

  return (
    <>
      <section className="gutter-field border-b border-line">
        <div className="mx-auto max-w-[820px] px-5 py-14 sm:px-8 sm:py-20">
          <p className="label mb-5 flex items-center gap-2">
            <span className="inline-block h-px w-6 bg-merge" />
            Sponsor
          </p>
          <h1 className="display text-[40px] sm:text-[54px]">
            Sponsor
            <br />
            MERGED<span className="text-merge">.</span>
          </h1>
          <p className="mt-6 max-w-[56ch] text-[15.5px] leading-relaxed text-mid">
            One sponsor at a time. Four placements. No tracking pixels, no
            third-party ad scripts, no retargeting.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[820px] px-5 py-14 sm:px-8">
        {/* ── who is actually here ───────────────────────────── */}
        <h2 className="display text-[26px]">Who you&rsquo;d be in front of</h2>
        <p className="mono mt-1.5 mb-7 text-[11px] text-dim">
          Live, from the same query the homepage runs
        </p>

        <StatGrid stats={boardStats(totals)} />

        <p className="mono mt-3.5 text-[11.5px] leading-relaxed text-dim">
          Traffic is small and climbing. Ask and I will send you the analytics
          dashboard, no filtering.
        </p>

        <p className="mt-7 max-w-[62ch] text-[14.5px] leading-relaxed text-mid">
          The audience is narrow on purpose: people who open pull requests
          against repositories they don&rsquo;t own. They read a diff before
          they trust a claim, they already have opinions about their toolchain,
          and they are the people who decide what a team adopts eighteen months
          before anyone writes a purchase order. There are no accounts here, so
          nobody is profiled and nothing is segmented — you get the whole room
          or none of it.
        </p>

        {/* ── the four slots ─────────────────────────────────── */}
        <h2 className="display mt-16 text-[26px]">The four placements</h2>
        <p className="mono mt-1.5 text-[11px] text-dim">
          Rendered on the server with the rest of the page — no scripts, nothing
          injected after load
        </p>

        <ul className="mt-7 flex flex-col">
          {PLACEMENTS.map((p) => (
            <li key={p.title} className="border-t border-line py-6">
              <h3 className="mono text-[14px] text-fg">{p.title}</h3>
              <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-mid">
                {p.body}
              </p>
              <div className="mt-4 overflow-hidden rounded-[4px] border border-line bg-ink-950 px-3">
                {p.mock}
              </div>
              {p.note && (
                <p className="mono mt-3 max-w-[62ch] text-[11.5px] leading-relaxed text-dim">
                  {p.note}
                </p>
              )}
            </li>
          ))}
        </ul>

        {/* ── price ──────────────────────────────────────────── */}
        <h2 className="display mt-16 text-[26px]">What it costs</h2>
        <div className="mt-6 flex items-baseline gap-3">
          <span className="mono tnum text-[40px] leading-none text-merge">
            $150
          </span>
          <span className="mono text-[13px] text-dim">/ month</span>
        </div>
        <p className="mt-5 max-w-[62ch] text-[14.5px] leading-relaxed text-mid">
          All four placements, one invoice. Month to month, cancel anytime. This
          is the founding rate and it stays locked for as long as you stay. It
          goes to $400 when the board hits 250 contributors.
        </p>

        {/* ── the part that isn't for sale ───────────────────── */}
        <h2 className="display mt-16 text-[26px]">
          What money doesn&rsquo;t buy
        </h2>
        <div className="mt-6 rounded-[4px] border border-line bg-ink-900 p-4">
          <p className="patch patch-del rounded-[2px] py-1 pl-2.5 text-[12.5px] text-fg">
            <span className="mr-1.5 text-del">−</span>
            Rank is never for sale.
          </p>
          <p className="mt-2.5 max-w-[62ch] pl-2.5 text-[13.5px] leading-relaxed text-mid">
            No sponsor has changed a position on this board and none ever will.
            The formula is at{" "}
            <Link href="/method" className="text-merge underline">
              /method
            </Link>
            , including the four ways it&rsquo;s wrong.
          </p>
        </div>

        {/* ── how it goes ────────────────────────────────────── */}
        <h2 className="display mt-16 text-[26px]">How it works</h2>
        <ol className="mt-6 flex flex-col">
          {STEPS.map((step, i) => (
            <li
              key={step}
              className="flex items-baseline gap-3.5 border-t border-line py-3"
            >
              <span className="mono tnum shrink-0 text-[11px] text-merge">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[14px] leading-relaxed text-mid">
                {step}
              </span>
            </li>
          ))}
        </ol>

        {/* ── the person on the other end ────────────────────── */}
        <h2 className="display mt-16 text-[26px]">Who runs this</h2>
        <div className="mt-6 flex items-center gap-4 rounded-[4px] border border-line bg-ink-900 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={owner.avatar}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-[4px] border border-line"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <span className="text-[15px] font-medium text-fg">
                {owner.name}
              </span>
              <a
                href="https://x.com/soham_nayak04"
                target="_blank"
                rel="noopener noreferrer"
                className="mono text-[12px] text-dim transition-colors hover:text-merge"
              >
                @soham_nayak04 ↗
              </a>
            </div>
            <p className="mt-1.5 max-w-[54ch] text-[13.5px] leading-relaxed text-mid">
              I built MERGED and I run it. You will be dealing with me, not a
              sales team.
            </p>
          </div>
        </div>

        {/* ── get in touch ───────────────────────────────────── */}
        <h2 className="display mt-16 text-[26px]">Take a slot</h2>
        <p className="mono mt-1.5 text-[11px] text-dim">
          Four fields, and a person on the other end
        </p>

        <SponsorInquiryForm />

        <p className="mono mt-8 border-t border-line pt-6 text-[11.5px] leading-relaxed text-dim">
          Or skip the form:{" "}
          <span className="text-mid select-all">sohamnayak04@gmail.com</span>,
          or{" "}
          <a
            href="https://x.com/soham_nayak04"
            target="_blank"
            rel="noopener noreferrer"
            className="text-merge underline"
          >
            DM me on X
          </a>
          .
        </p>
      </div>
    </>
  );
}
