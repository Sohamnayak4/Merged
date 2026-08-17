import { compact } from "@/lib/format";
import type { Score } from "@/lib/types";

/**
 * The score, shown as its own arithmetic.
 *
 * A single number nobody can interrogate is a number nobody trusts, so every
 * part states what it counted, how far along its curve that lands, and the
 * points it contributed out of the maximum available.
 */
export default function ImpactBars({ score }: { score: Score }) {
  return (
    <ul className="flex flex-col">
      {score.parts.map((part) => (
        <li
          key={part.key}
          className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1.5 border-b border-line py-3.5 sm:grid-cols-[112px_1fr_88px]"
        >
          <div className="min-w-0">
            <span className="mono block text-[12.5px] text-fg">
              {part.label}
            </span>
            <span className="mono block text-[10.5px] leading-snug text-dim sm:hidden">
              {part.detail}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 sm:pt-1">
            <div
              className="h-[5px] w-full overflow-hidden rounded-full bg-ink-800"
              role="img"
              aria-label={`${part.label}: ${part.points} of ${part.weight} points`}
            >
              <div
                className="sweep h-full rounded-full bg-merge"
                style={{ width: `${Math.round(part.norm * 100)}%` }}
              />
            </div>
            <span className="mono mt-1.5 hidden text-[10.5px] text-dim sm:block">
              {compact(part.raw)} {part.detail}
            </span>
          </div>

          <div className="text-right">
            <span className="mono tnum block text-[13px] text-fg">
              {part.points}
            </span>
            <span className="mono tnum block text-[10.5px] text-dim">
              of {part.weight}
            </span>
          </div>
        </li>
      ))}

      <li className="flex items-baseline justify-between pt-4">
        <span className="mono text-[12.5px] text-mid">Impact</span>
        <span className="mono tnum text-[26px] text-merge">{score.total}</span>
      </li>
    </ul>
  );
}
