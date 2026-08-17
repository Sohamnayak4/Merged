import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Fonts for the generated share cards.
 *
 * Vendored as TrueType in assets/ rather than fetched at request time:
 * satori cannot read woff2, and a card that depends on a network call to
 * Google renders as system-font mush the one time that call is slow — which
 * is exactly when someone is pasting the link somewhere public.
 */
export async function ogFonts() {
  const [regular, bold] = await Promise.all([
    readFile(join(process.cwd(), "assets", "JetBrainsMono-400.ttf")),
    readFile(join(process.cwd(), "assets", "JetBrainsMono-800.ttf")),
  ]);

  return [
    { name: "JetBrains Mono", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "JetBrains Mono", data: bold, weight: 800 as const, style: "normal" as const },
  ];
}

export const OG_SIZE = { width: 1200, height: 630 };

export const INK = "#0a0a0f";
export const PANEL = "#12121a";
export const LINE = "#20202c";
export const DIM = "#61617a";
export const MID = "#9292aa";
export const FG = "#e9e9f2";
export const MERGE = "#a371f7";
export const ADD = "#3fb950";

/** The merge glyph, inlined — satori has no access to component imports. */
export function MergeMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16">
      <path
        d="M4 2.5v6a3.5 3.5 0 0 0 3.5 3.5H11"
        fill="none"
        stroke={MERGE}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="4" cy="2.5" r="1.9" fill={MERGE} />
      <circle cx="4" cy="13.5" r="1.9" fill={MERGE} />
      <circle cx="12.2" cy="12" r="1.9" fill={MERGE} />
    </svg>
  );
}
