"use client";

import { useState } from "react";

const FIELD =
  "mono w-full rounded-[4px] border border-line bg-ink-900 px-3 py-2.5 text-[13px] text-fg outline-none placeholder:text-dim focus:border-merge/50";

const LABEL = "mono mb-2 block text-[11.5px] text-mid";

export default function SponsorInquiryForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    setError(null);
    try {
      const res = await fetch("/api/sponsor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, companyUrl, message }),
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
      <div className="mt-8 rounded-[4px] border border-line bg-ink-900 p-6">
        <p className="patch patch-add rounded-[2px] py-1.5 pl-2.5 text-[13px] text-fg">
          <span className="mr-1.5 text-add">+</span>
          {name}
        </p>
        <p className="mt-4 text-[14.5px] leading-relaxed text-mid">
          Got it. I read these myself and reply within a day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="sponsor-name" className={LABEL}>
            Your name
          </label>
          <input
            id="sponsor-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="sponsor-email" className={LABEL}>
            Email
          </label>
          <input
            id="sponsor-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            spellCheck={false}
            required
            className={FIELD}
          />
        </div>
      </div>

      <div>
        <label htmlFor="sponsor-url" className={LABEL}>
          Company url
        </label>
        <input
          id="sponsor-url"
          value={companyUrl}
          onChange={(e) => setCompanyUrl(e.target.value)}
          placeholder="acme.dev"
          spellCheck={false}
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="sponsor-message" className={LABEL}>
          What would you be putting in the slot?
        </label>
        <textarea
          id="sponsor-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          required
          className={`${FIELD} resize-y`}
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
        {state === "busy" ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
