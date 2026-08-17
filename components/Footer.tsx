import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="mono text-[11px] leading-relaxed text-dim">
          Built from public GitHub data. No accounts, no tracking — the board
          itself is public.
        </p>
        <div className="flex items-center gap-5">
          <Link
            href="/method"
            className="mono text-[11px] text-dim transition-colors hover:text-fg"
          >
            How impact is scored
          </Link>
          <Link
            href="/add"
            className="mono text-[11px] text-dim transition-colors hover:text-fg"
          >
            Add your work
          </Link>
          <Link
            href="/remove"
            className="mono text-[11px] text-dim transition-colors hover:text-fg"
          >
            Take me off
          </Link>
        </div>
      </div>
    </footer>
  );
}
