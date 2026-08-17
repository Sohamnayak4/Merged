import { ago } from "@/lib/format";
import type { WallRow } from "@/lib/db";

/**
 * A single hairline band of real merges. It gives the page a pulse without
 * animating anything else, and it hovers to a stop so a passing title can
 * actually be read.
 */
export default function Ticker({ items }: { items: WallRow[] }) {
  if (!items.length) return null;
  const lane = items.slice(0, 24);

  return (
    <div className="marquee-hold relative overflow-hidden border-y border-line bg-ink-900/60 py-2.5">
      <div className="marquee">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
            {lane.map((it, i) => (
              <a
                key={`${copy}-${it.pr.url}-${i}`}
                href={it.pr.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mono group flex shrink-0 items-center gap-2.5 whitespace-nowrap px-5 text-[11.5px]"
              >
                <span className="text-add">+</span>
                <span className="text-dim">@{it.login}</span>
                <span className="text-line-2">→</span>
                <span className="text-fg transition-colors group-hover:text-merge">
                  {it.pr.repo}
                </span>
                <span className="text-dim">#{it.pr.number}</span>
                <span className="text-line-2">·</span>
                <span className="text-dim">{ago(it.pr.mergedAt)}</span>
              </a>
            ))}
          </div>
        ))}
      </div>

      {/* Fade the band into the page edges so it reads as a continuous stream. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-ink-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-ink-950 to-transparent" />
    </div>
  );
}
