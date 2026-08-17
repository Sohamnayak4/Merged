import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="mono text-[11px] leading-relaxed text-dim">
          Built from public GitHub data. No accounts — just anonymous page
          counts, and a public board.
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
          <a
            href="https://x.com/soham_nayak04"
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-[11px] text-dim transition-colors hover:text-fg"
          >
            @soham_nayak04
          </a>
        </div>
      </div>
    </footer>
  );
}
