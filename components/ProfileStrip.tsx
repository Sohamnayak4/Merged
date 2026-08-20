import Link from "next/link";
import { activeSponsor, SPONSOR_HREF, SPONSOR_REL } from "@/lib/sponsor";

/**
 * One hairline of text under the profile header. Deliberately not a card: a
 * boxed unit here would compete with the person the page is about, and the
 * whole pitch of this placement is that it sits quietly on every contributor
 * page rather than interrupting one of them.
 *
 * Stays a single line at every width and ellipsises rather than wrapping — a
 * strip that grows to three lines on a phone stops being a strip.
 */
const LINE = "mx-auto flex max-w-[1180px] items-center gap-2 px-5 py-2 sm:px-8";

const TEXT = "mono min-w-0 truncate text-[11px] text-dim";

export default function ProfileStrip({
  preview = false,
}: {
  preview?: boolean;
}) {
  const sponsor = activeSponsor();
  const shell = preview ? "" : "border-b border-line";

  const body = sponsor ? (
    <>
      {sponsor.logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sponsor.logoUrl}
          alt=""
          width={14}
          height={14}
          className="h-3.5 w-3.5 shrink-0 rounded-[2px] object-contain"
        />
      )}
      <span className={TEXT}>{sponsor.blurb}</span>
    </>
  ) : (
    <span className={TEXT}>
      This line is for sale. It sits on every contributor page. →
    </span>
  );

  if (preview) return <div className={shell}><div className={LINE}>{body}</div></div>;

  const hover = "transition-colors hover:[&_span]:text-mid";

  return (
    <div className={shell}>
      {sponsor ? (
        <a
          href={sponsor.url}
          target="_blank"
          rel={SPONSOR_REL}
          className={`${LINE} ${hover}`}
        >
          {body}
        </a>
      ) : (
        <Link href={SPONSOR_HREF} className={`${LINE} ${hover}`}>
          {body}
        </Link>
      )}
    </div>
  );
}
