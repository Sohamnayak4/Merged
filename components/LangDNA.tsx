import { langColor } from "@/lib/format";
import type { Lang } from "@/lib/types";

/**
 * A single hairline strip of the languages someone actually ships in, weighted
 * by the reach of the projects they appear in. It reads as a fingerprint at a
 * glance and costs one line of vertical space, which is why every row can carry
 * one without the board turning into a chart dump.
 */
export default function LangDNA({
  langs,
  height = 3,
  showLabels = false,
}: {
  langs: Lang[];
  height?: number;
  showLabels?: boolean;
}) {
  if (!langs?.length) return null;
  const total = langs.reduce((s, l) => s + l.weight, 0) || 1;

  return (
    <div className="w-full">
      <div
        className="flex w-full overflow-hidden rounded-full"
        style={{ height }}
        role="img"
        aria-label={`Languages: ${langs.map((l) => l.name).join(", ")}`}
      >
        {langs.map((l) => (
          <div
            key={l.name}
            style={{
              width: `${(l.weight / total) * 100}%`,
              background: langColor(l.name),
            }}
          />
        ))}
      </div>
      {showLabels && (
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
          {langs.map((l) => (
            <span
              key={l.name}
              className="mono flex items-center gap-1.5 text-[11px] text-mid"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: langColor(l.name) }}
              />
              {l.name}
              <span className="text-dim tnum">
                {Math.round((l.weight / total) * 100)}%
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
