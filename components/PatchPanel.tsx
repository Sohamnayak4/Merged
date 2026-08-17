"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Line = { kind: "meta" | "hunk" | "ctx" | "add" | "del"; text: string };

/**
 * The signature.
 *
 * A contribution is a patch, so the hero is a patch — a real unified diff that
 * writes itself, ending on the line where the reader gets added. Everything
 * else on the page stays quiet so this can be the thing people remember.
 */
export default function PatchPanel({ lines }: { lines: Line[] }) {
  const full = useMemo(() => lines.map((l) => l.text).join("\n"), [lines]);
  const [typed, setTyped] = useState(0);
  const [done, setDone] = useState(false);
  const frame = useRef<number>(0);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      setTyped(full.length);
      setDone(true);
      return;
    }

    let i = 0;
    let last = performance.now();
    let acc = 0;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      // Metadata rattles out fast; the lines that carry names land slower, so
      // the eye has time to read the part that matters.
      const speed = i < full.indexOf("@@") ? 1.6 : 0.55;
      acc += dt * speed * 0.06;
      const step = Math.floor(acc);
      if (step > 0) {
        i = Math.min(full.length, i + step);
        acc -= step;
        setTyped(i);
      }
      if (i < full.length) frame.current = requestAnimationFrame(tick);
      else setDone(true);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [full]);

  // Slice the joined string back into lines so the caret sits mid-line.
  const shown: { line: Line; text: string }[] = [];
  let cursor = 0;
  for (const line of lines) {
    const start = cursor;
    const end = cursor + line.text.length;
    if (typed <= start) break;
    shown.push({ line, text: line.text.slice(0, Math.max(0, typed - start)) });
    cursor = end + 1; // +1 for the newline
    if (typed <= end) break;
  }

  const tone: Record<Line["kind"], string> = {
    meta: "text-dim",
    hunk: "patch-hunk text-merge",
    ctx: "text-mid",
    add: "patch-add text-fg",
    del: "patch-del text-mid",
  };

  return (
    <div className="overflow-hidden rounded-[4px] border border-line bg-ink-900">
      <div className="flex items-center gap-2 border-b border-line bg-ink-850 px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-line-2" />
          <span className="h-2 w-2 rounded-full bg-line-2" />
          <span className="h-2 w-2 rounded-full bg-line-2" />
        </div>
        <span className="mono ml-1 text-[11px] text-dim">CONTRIBUTORS</span>
        <span
          className={`mono ml-auto flex items-center gap-1.5 text-[10px] tracking-wider transition-opacity duration-500 ${
            done ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-add" />
          <span className="text-add">READY TO MERGE</span>
        </span>
      </div>

      <pre
        className="patch overflow-x-auto py-2"
        aria-label="A unified diff adding contributors to a file"
      >
        {shown.map(({ line, text }, i) => (
          <div key={i} className={`px-3 ${tone[line.kind]}`}>
            {text || " "}
            {i === shown.length - 1 && !done ? (
              <span className="caret" />
            ) : null}
          </div>
        ))}
        {/* Hold the panel's height steady so the page doesn't jump while typing. */}
        {Array.from({ length: Math.max(0, lines.length - shown.length) }).map(
          (_, i) => (
            <div key={`pad-${i}`} className="px-3">
              &nbsp;
            </div>
          ),
        )}
      </pre>
    </div>
  );
}

export type { Line };
