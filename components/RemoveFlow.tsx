"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function RemoveFlow() {
  const params = useSearchParams();
  const [login, setLogin] = useState(params.get("login") ?? "");
  const [reason, setReason] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!login.trim()) return;
    setState("busy");
    setError(null);
    try {
      const res = await fetch("/api/removal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, reason, contact }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't send that.");
        setState("idle");
        return;
      }
      setState("done");
    } catch {
      setError("Couldn't send that. Try again in a moment.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="mt-9 rounded-[4px] border border-line bg-ink-900 p-6">
        <p className="patch patch-del rounded-[2px] py-1.5 pl-2.5 text-[13px] text-fg">
          <span className="mr-1.5 text-del">−</span>
          {login}
        </p>
        <p className="mt-4 text-[14.5px] leading-relaxed text-mid">
          Request received. The entry comes down by hand, usually within a day,
          and once it&rsquo;s off nobody can re-add it.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-9 flex flex-col gap-5">
      <div>
        <label htmlFor="login" className="mono mb-2 block text-[11.5px] text-mid">
          Which handle should come off?
        </label>
        <input
          id="login"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          placeholder="your-handle"
          spellCheck={false}
          required
          className="mono w-full rounded-[4px] border border-line bg-ink-900 px-3 py-2.5 text-[13px] text-fg outline-none placeholder:text-dim focus:border-merge/50"
        />
      </div>

      <div>
        <label
          htmlFor="contact"
          className="mono mb-2 block text-[11.5px] text-mid"
        >
          How to reach you, if you want a reply{" "}
          <span className="text-dim">(optional)</span>
        </label>
        <input
          id="contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="email or @handle"
          spellCheck={false}
          className="mono w-full rounded-[4px] border border-line bg-ink-900 px-3 py-2.5 text-[13px] text-fg outline-none placeholder:text-dim focus:border-merge/50"
        />
      </div>

      <div>
        <label
          htmlFor="reason"
          className="mono mb-2 block text-[11.5px] text-mid"
        >
          Anything to add <span className="text-dim">(optional)</span>
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="mono w-full resize-y rounded-[4px] border border-line bg-ink-900 px-3 py-2.5 text-[13px] text-fg outline-none placeholder:text-dim focus:border-merge/50"
        />
      </div>

      {error && (
        <p className="patch patch-del rounded-[2px] py-1.5 pl-2.5 text-del">
          <span className="mr-1.5">−</span>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "busy"}
        className="mono self-start rounded-[3px] bg-merge px-4 py-2.5 text-[12.5px] font-medium text-ink-950 transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {state === "busy" ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
