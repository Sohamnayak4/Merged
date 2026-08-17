import type { Day } from "@/lib/types";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/**
 * The contribution calendar, re-toned into the brand violet rather than
 * GitHub's green — green is reserved here for diff additions, and a borrowed
 * green grid would read as a screenshot of another product.
 */
export default function Heatmap({ days, cell = 10 }: { days: Day[]; cell?: number }) {
  if (!days?.length) return null;

  const columns: (Day | null)[][] = [];
  let current: (Day | null)[] = [];

  const firstDow = new Date(days[0].date + "T00:00:00Z").getUTCDay();
  for (let i = 0; i < firstDow; i++) current.push(null);

  for (const d of days) {
    current.push(d);
    if (current.length === 7) {
      columns.push(current);
      current = [];
    }
  }
  if (current.length) {
    while (current.length < 7) current.push(null);
    columns.push(current);
  }

  // A month label sits above the first column that opens a new month.
  const labels: { index: number; text: string }[] = [];
  let lastMonth = -1;
  columns.forEach((col, i) => {
    const first = col.find(Boolean);
    if (!first) return;
    const m = new Date(first.date + "T00:00:00Z").getUTCMonth();
    if (m !== lastMonth) {
      lastMonth = m;
      labels.push({ index: i, text: MONTHS[m] });
    }
  });

  const gap = 3;
  const step = cell + gap;

  return (
    <div className="overflow-x-auto pb-1">
      <div style={{ width: columns.length * step }}>
        <div className="relative mb-1.5 h-3.5">
          {labels.map((l) => (
            <span
              key={`${l.index}-${l.text}`}
              className="mono absolute top-0 text-[9.5px] text-dim"
              style={{ left: l.index * step }}
            >
              {l.text}
            </span>
          ))}
        </div>

        <div className="flex" style={{ gap }}>
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col" style={{ gap }}>
              {col.map((d, di) =>
                d ? (
                  <div
                    key={d.date}
                    className={`cell cell-${d.level}`}
                    style={{ width: cell, height: cell }}
                    title={`${d.date} — level ${d.level}`}
                  />
                ) : (
                  <div
                    key={`e-${di}`}
                    style={{ width: cell, height: cell }}
                  />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
