"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * One field, because there is only one thing to do here. It accepts a profile
 * URL, a bare handle, or a link to a single pull request — the /add route works
 * out which it got rather than making the visitor classify it first.
 */
export default function HeroInput() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    router.push(`/add?url=${encodeURIComponent(v)}`);
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex items-center gap-2 rounded-[4px] border border-line bg-ink-900 p-1.5 transition-colors focus-within:border-merge/50">
        <span className="mono pl-2 text-[13px] text-dim select-none">$</span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="github.com/you"
          aria-label="Your GitHub profile or a link to a contribution"
          spellCheck={false}
          className="mono min-w-0 flex-1 bg-transparent py-2 text-[13px] text-fg outline-none placeholder:text-dim"
        />
        <button
          type="submit"
          className="mono shrink-0 rounded-[3px] bg-merge px-3.5 py-2 text-[12px] font-medium text-ink-950 transition-opacity hover:opacity-90"
        >
          Show my work
        </button>
      </div>
      <p className="mono mt-2.5 text-[11px] leading-relaxed text-dim">
        A link to one merged pull request works too. Nothing to sign up for.
      </p>
    </form>
  );
}
