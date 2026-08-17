"use client";

import { useEffect, useState } from "react";

/**
 * The share handle, shown as the URL it actually is.
 *
 * A profile people want to show off needs its address visible rather than
 * buried in the browser chrome, so the button *is* the link — reading
 * merged.dev/antfu and copying it are the same gesture.
 */
export default function ShareLink({ login }: { login: string }) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  // Rendered on the server too, where there is no location — resolve the host
  // after mount and show the path alone until then.
  useEffect(() => setOrigin(window.location.host), []);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/${login}`,
      );
      setCopied(true);
    } catch {
      // Clipboard access can be denied; the text is on screen to select.
    }
  }

  return (
    <button
      onClick={copy}
      aria-label={`Copy link to ${login}'s profile`}
      className="mono group flex items-center gap-2 rounded-[3px] border border-line bg-ink-900 px-2.5 py-1.5 text-[11.5px] text-dim transition-colors hover:border-merge/40 hover:text-fg"
    >
      <span className="truncate">
        {origin || "…"}
        <span className="text-merge">/{login}</span>
      </span>
      <span
        className={`shrink-0 tabular-nums ${copied ? "text-add" : "text-dim group-hover:text-mid"}`}
      >
        {copied ? "copied" : "copy"}
      </span>
    </button>
  );
}
