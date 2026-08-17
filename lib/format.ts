/**
 * Profile fields are free text, and people put anything in them — antfu's
 * GitHub location is the literal string "undefined". Rendered as-is it reads as
 * a bug in our page rather than a joke in his profile, and a visible glitch
 * makes every real number beside it look unreliable too.
 */
const JUNK = new Set(["undefined", "null", "none", "n/a", "-", "—"]);

export function cleanMeta(value: string | null | undefined): string | null {
  const v = value?.trim();
  if (!v || JUNK.has(v.toLowerCase())) return null;
  return v;
}

export function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return String(n);
}

export function ago(iso: string | null | undefined): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const s = Math.max(0, (Date.now() - then) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const d = Math.floor(s / 86400);
  if (d < 30) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

/**
 * GitHub's language colours, with the darkest few lifted.
 *
 * GitHub picked these against a white background, so C (#555555), Lua
 * (#000080) and Ruby (#701516) all but vanish on ours — a strip that reads as
 * empty looks broken rather than accurate. The hues are kept; only the
 * luminance moves, and only where it had to.
 */
export const LANG_COLOR: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#4b8bd0",
  Go: "#00ADD8",
  Rust: "#dea584",
  C: "#9a9a9a",
  "C++": "#f34b7d",
  Java: "#c98a3e",
  Ruby: "#cf3a45",
  PHP: "#7d8bc4",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#8b6fd0",
  SCSS: "#c6538c",
  MDX: "#fcb32c",
  Astro: "#ff5a03",
  Zig: "#ec915c",
  Elixir: "#a07cb0",
  Haskell: "#8d7fc0",
  Lua: "#5b5bff",
  Dart: "#00B4AB",
  "C#": "#3aa63a",
  Nix: "#7e7eff",
  Perl: "#3aaad8",
  Makefile: "#6faa3c",
  Dockerfile: "#6b8f9c",
};

export const langColor = (l: string | null | undefined) =>
  (l && LANG_COLOR[l]) || "#4a4a5e";

/**
 * People who join by pasting a link have no GitHub avatar to borrow, so draw
 * them a monogram instead of leaving a broken image in the row.
 */
export function avatarFor(p: { avatar?: string; login: string }): string {
  if (p.avatar) return p.avatar;
  const initial = (p.login[0] ?? "?").toUpperCase();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88">` +
    `<rect width="88" height="88" fill="#191922"/>` +
    `<text x="50%" y="50%" dy=".35em" text-anchor="middle" fill="#a371f7" ` +
    `font-family="monospace" font-size="38">${initial}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
