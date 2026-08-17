import Link from "next/link";

function MergeGlyph({ className = "" }: { className?: string }) {
  // The git merge icon, drawn rather than imported: a side branch rejoining
  // the trunk. It is the one picture this whole product is about.
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path
        d="M4 2.5v6a3.5 3.5 0 0 0 3.5 3.5H11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="4" cy="2.5" r="1.9" fill="currentColor" />
      <circle cx="4" cy="13.5" r="1.9" fill="currentColor" />
      <circle cx="12.2" cy="12" r="1.9" fill="currentColor" />
    </svg>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1180px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <MergeGlyph className="h-4 w-4 text-merge transition-transform duration-300 group-hover:rotate-[-8deg]" />
          <span className="display text-[17px] tracking-[-0.04em]">
            MERGED<span className="text-merge">.</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/wall"
            className="mono px-2.5 py-1.5 text-[12px] text-mid transition-colors hover:text-fg"
          >
            Wall
          </Link>
          <Link
            href="/method"
            className="mono px-2.5 py-1.5 text-[12px] text-mid transition-colors hover:text-fg"
          >
            Method
          </Link>
          <Link
            href="/add"
            className="mono ml-1 rounded-[3px] border border-merge/40 bg-merge/10 px-3 py-1.5 text-[12px] text-merge transition-colors hover:bg-merge/20"
          >
            + Add yours
          </Link>
        </nav>
      </div>
    </header>
  );
}
