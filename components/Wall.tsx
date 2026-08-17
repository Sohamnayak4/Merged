import Link from "next/link";
import { ago, avatarFor } from "@/lib/format";
import type { WallRow } from "@/lib/db";

/**
 * The wall.
 *
 * Every card is one patch that a maintainer somewhere chose to merge, drawn as
 * the thing it actually is: an added line. Masonry columns let long PR titles
 * breathe instead of being clipped to a uniform grid, so the wall reads like a
 * changelog rather than a dashboard.
 *
 * The whole card opens the pull request via a stretched overlay link, which
 * keeps the author's handle a real, separate link instead of nesting anchors.
 */
export default function Wall({ items }: { items: WallRow[] }) {
  if (!items.length) return null;

  return (
    <div className="[column-fill:_balance] columns-1 gap-3.5 sm:columns-2 lg:columns-3">
      {items.map((it, i) => (
        <article
          key={`${it.pr.url}-${i}`}
          className="group relative mb-3.5 break-inside-avoid rounded-[4px] border border-line bg-ink-900 p-3.5 transition-colors duration-200 focus-within:border-merge/50 hover:border-merge/40 hover:bg-ink-850"
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="mono truncate text-[11.5px] text-mid transition-colors group-hover:text-merge">
              {it.pr.repo}
            </span>
            <span className="mono shrink-0 text-[11px] text-dim">
              #{it.pr.number}
            </span>
          </div>

          <p className="patch-add mono mt-2.5 rounded-[2px] py-1.5 pl-2.5 pr-2 text-[12.5px] leading-relaxed text-fg">
            <span className="mr-1.5 text-add">+</span>
            <a
              href={it.pr.url}
              target="_blank"
              rel="noopener noreferrer"
              className="before:absolute before:inset-0 before:content-['']"
            >
              {it.pr.title}
            </a>
          </p>

          <div className="mt-3 flex items-center gap-2 border-t border-line pt-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarFor(it)}
              alt=""
              width={18}
              height={18}
              loading="lazy"
              className="h-[18px] w-[18px] rounded-[2px] border border-line"
            />
            <Link
              href={`/${it.login}`}
              className="mono relative z-10 truncate text-[11px] text-mid transition-colors hover:text-fg"
            >
              @{it.login}
            </Link>
            <span className="mono ml-auto shrink-0 text-[10.5px] text-dim">
              merged {ago(it.pr.mergedAt)}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
