"use client";

import Link from "next/link";
import { FEATURE_ANCHOR, FEATURE_HREF } from "@/lib/anchors";

/**
 * The header's jump to the first sponsor row.
 *
 * A plain link to /#feature works exactly once: after the first click the URL
 * already ends in #feature, so the second click navigates nowhere and the
 * browser has no reason to scroll. Scroll away, press it again, nothing moves.
 *
 * So when the row is on the page, the click is handled here instead of by the
 * router — every press scrolls, whatever the address bar says. The offset is
 * still the row's own scroll-margin (see Board.tsx): `block: "start"` aligns
 * the scroll-margin box exactly as a hash jump would, so the landing position
 * is defined in one place rather than reimplemented here.
 *
 * When the row isn't on the page — any route other than the board — the click
 * falls through to the Link, which navigates home and lets the hash land it.
 */
export default function FeatureJump() {
  function jump(event: React.MouseEvent<HTMLAnchorElement>) {
    // Let the browser do its own thing for modified clicks: cmd-click opening
    // a new tab shouldn't be hijacked into a scroll.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const row = document.getElementById(FEATURE_ANCHOR);
    if (!row) return;

    event.preventDefault();

    // scrollIntoView's `smooth` overrides the CSS, so the reduced-motion
    // promise globals.css makes has to be kept by hand here.
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
  }

  return (
    <Link
      href={FEATURE_HREF}
      onClick={jump}
      className="mono group hidden items-center gap-1.5 rounded-[3px] border border-line-2 bg-ink-800 px-2.5 py-1.5 text-[11.5px] text-fg transition-colors hover:border-merge/40 hover:bg-ink-700 sm:flex"
    >
      Sponsor
      {/* The accent lands on the arrow alone. A second violet button beside
          "+ Add yours" would read as two primary actions; a violet arrow on a
          neutral chip reads as one, pointing. */}
      <span
        aria-hidden
        className="inline-block text-merge transition-transform duration-200 group-hover:translate-y-[2px]"
      >
        ↓
      </span>
    </Link>
  );
}
