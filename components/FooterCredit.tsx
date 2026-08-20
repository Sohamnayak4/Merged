import Link from "next/link";
import { activeSponsor, SPONSOR_HREF, SPONSOR_REL } from "@/lib/sponsor";

/**
 * The credit line in the footer — the one placement that appears on every
 * page, including the ones with no board and no profile on them. Reads as a
 * credit rather than a placement, which is the accurate description: someone
 * is paying for this site to exist without accounts or trackers.
 */
export default function FooterCredit({ preview = false }: { preview?: boolean }) {
  const sponsor = activeSponsor();

  if (!sponsor) {
    return (
      <p className="mono text-[11px] text-dim">
        MERGED is unsponsored.{" "}
        {preview ? (
          <span className="text-merge">Be the first →</span>
        ) : (
          <Link
            href={SPONSOR_HREF}
            className="text-merge transition-opacity hover:opacity-80"
          >
            Be the first →
          </Link>
        )}
      </p>
    );
  }

  const mark = (
    <span className="inline-flex items-center gap-1.5 align-middle">
      {sponsor.logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sponsor.logoUrl}
          alt=""
          width={14}
          height={14}
          className="h-3.5 w-3.5 rounded-[2px] object-contain"
        />
      )}
      <span className="text-mid">{sponsor.name}</span>
    </span>
  );

  return (
    <p className="mono text-[11px] text-dim">
      MERGED is supported by{" "}
      {preview ? (
        mark
      ) : (
        <a
          href={sponsor.url}
          target="_blank"
          rel={SPONSOR_REL}
          className="transition-colors hover:[&_span]:text-fg"
        >
          {mark}
        </a>
      )}
    </p>
  );
}
