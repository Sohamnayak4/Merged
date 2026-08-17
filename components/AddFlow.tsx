"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { avatarFor, compact } from "@/lib/format";
import { scoreOf } from "@/lib/score";
import { markMine } from "@/lib/mine";
import type { Profile, ResolvedLink } from "@/lib/types";
import Heatmap from "./Heatmap";
import LangDNA from "./LangDNA";
import TierBadge from "./TierBadge";

type Result =
  | { type: "profile"; profile: Profile }
  | { type: "link"; link: ResolvedLink; author: string | null };

export default function AddFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const prefill = params.get("url") ?? "";

  const [value, setValue] = useState(prefill);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [handle, setHandle] = useState("");
  const ranPrefill = useRef(false);

  /** Reads without writing, so the visitor sees what lands before it lands. */
  const resolve = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/resolve?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "That didn't work.");
      else setResult(data as Result);
    } catch {
      setError("Couldn't reach GitHub from here.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (prefill && !ranPrefill.current) {
      ranPrefill.current = true;
      resolve(prefill);
    }
  }, [prefill, resolve]);

  /** The only write in the app. Everything it needs is re-fetched server-side. */
  async function commit(payload: { q?: string; link?: ResolvedLink; handle?: string }) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't save that.");
        return;
      }
      markMine(data.login);
      router.push(`/${data.login}`);
      router.refresh();
    } catch {
      setError("Couldn't save that. Try again in a moment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[820px] px-5 py-14 sm:px-8 sm:py-20">
      <p className="label mb-5 flex items-center gap-2">
        <span className="inline-block h-px w-6 bg-merge" />
        Open a pull request against the board
      </p>

      <h1 className="display text-[40px] sm:text-[52px]">
        Add your line to
        <br />
        the file.
      </h1>

      <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-mid">
        Paste your GitHub profile and the board reads the rest. A link to a
        single merged patch works too — it&rsquo;ll find who wrote it.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          resolve(value);
        }}
        className="mt-9"
      >
        <div className="flex items-center gap-2 rounded-[4px] border border-line bg-ink-900 p-1.5 transition-colors focus-within:border-merge/50">
          <span className="mono select-none pl-2 text-[13px] text-dim">$</span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="github.com/you"
            aria-label="GitHub profile or contribution link"
            spellCheck={false}
            autoFocus
            className="mono min-w-0 flex-1 bg-transparent py-2.5 text-[13px] text-fg outline-none placeholder:text-dim"
          />
          <button
            type="submit"
            disabled={busy || saving}
            className="mono shrink-0 rounded-[3px] bg-merge px-4 py-2.5 text-[12px] font-medium text-ink-950 transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {busy ? "Reading…" : "Read it"}
          </button>
        </div>
      </form>

      {busy && (
        <pre className="patch mt-7 text-dim">
          <div>$ git fetch --all</div>
          <div className="text-mid">
            Counting merged patches<span className="caret" />
          </div>
        </pre>
      )}

      {error && (
        <div className="mt-7 rounded-[4px] border border-del/30 bg-del/5 p-4">
          <p className="patch patch-del rounded-[2px] py-1.5 pl-2.5 text-del">
            <span className="mr-1.5">−</span>
            {error}
          </p>
        </div>
      )}

      {result?.type === "profile" && (
        <PreviewProfile
          profile={result.profile}
          saving={saving}
          onCommit={() => commit({ q: result.profile.login })}
        />
      )}

      {result?.type === "link" && (
        <div className="mt-9 rise">
          <p className="label mb-3">Found this</p>

          <div className="rounded-[4px] border border-line bg-ink-900 p-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="mono truncate text-[11.5px] text-mid">
                {result.link.repo ?? result.link.site}
              </span>
              {result.link.merged && (
                <span className="mono shrink-0 text-[10.5px] tracking-wider text-merge">
                  MERGED
                </span>
              )}
            </div>
            <p className="patch patch-add mt-2.5 rounded-[2px] py-1.5 pl-2.5 text-fg">
              <span className="mr-1.5 text-add">+</span>
              {result.link.title}
            </p>
            {result.link.desc && (
              <p className="mt-3 text-[13px] leading-snug text-mid">
                {result.link.desc}
              </p>
            )}
          </div>

          {result.author ? (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => {
                  setValue(result.author!);
                  resolve(result.author!);
                }}
                disabled={saving}
                className="mono rounded-[3px] bg-merge px-4 py-2.5 text-[12px] font-medium text-ink-950 transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                Build @{result.author}&rsquo;s full profile
              </button>
              <button
                onClick={() =>
                  commit({ link: result.link, handle: result.author! })
                }
                disabled={saving}
                className="mono rounded-[3px] border border-line px-4 py-2.5 text-[12px] text-mid transition-colors hover:border-line-2 hover:text-fg disabled:opacity-40"
              >
                {saving ? "Saving…" : "Just add this patch"}
              </button>
            </div>
          ) : (
            <div className="mt-5">
              <label
                htmlFor="handle"
                className="mono mb-2 block text-[11.5px] text-mid"
              >
                This link doesn&rsquo;t name an author. What should the board
                call you?
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="handle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="your-handle"
                  spellCheck={false}
                  className="mono min-w-0 flex-1 rounded-[4px] border border-line bg-ink-900 px-3 py-2.5 text-[13px] text-fg outline-none placeholder:text-dim focus:border-merge/50"
                />
                <button
                  onClick={() => commit({ link: result.link, handle })}
                  disabled={!handle.trim() || saving}
                  className="mono shrink-0 rounded-[3px] bg-merge px-4 py-2.5 text-[12px] font-medium text-ink-950 transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {saving ? "Saving…" : "Add to board"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="mono mt-12 border-t border-line pt-5 text-[11px] leading-relaxed text-dim">
        The board is public, so anything you add here is visible to everyone.
        Everything shown is already public on GitHub, and you can{" "}
        <a href="/remove" className="underline hover:text-fg">
          ask to be taken off
        </a>{" "}
        at any time.
      </p>
    </div>
  );
}

/** The patch that would land, plus the evidence behind it. */
function PreviewProfile({
  profile,
  saving,
  onCommit,
}: {
  profile: Profile;
  saving: boolean;
  onCommit: () => void;
}) {
  const score = scoreOf(profile);

  return (
    <div className="mt-9 rise">
      <p className="label mb-3">Your patch</p>

      <pre className="patch overflow-x-auto rounded-[4px] border border-line bg-ink-900 py-2">
        <div className="px-3 text-dim">
          diff --git a/CONTRIBUTORS b/CONTRIBUTORS
        </div>
        <div className="patch-hunk px-3">@@ +1 contributor @@</div>
        <div className="patch-add px-3 text-fg">
          + {profile.login} · {score.upstreamPRs} upstream · {score.total}{" "}
          impact · {score.tier.name}
        </div>
      </pre>

      <div className="mt-5 rounded-[4px] border border-line bg-ink-900 p-5">
        <div className="flex gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarFor(profile)}
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 rounded-[3px] border border-line"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="display text-[22px]">{profile.name}</span>
              <TierBadge tier={score.tier} />
            </div>
            <span className="mono block text-[11.5px] text-dim">
              @{profile.login}
            </span>
            {profile.bio && (
              <p className="mt-2 text-[13px] leading-snug text-mid">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { n: compact(score.upstreamPRs), l: "upstream" },
            { n: compact(profile.mergedTotal), l: "merged total" },
            { n: `${score.distinctOwners}+`, l: "owners" },
            { n: compact(profile.totalStars), l: "stars" },
          ].map((s) => (
            <div key={s.l}>
              <dt className="mono tnum text-[20px] text-fg">{s.n}</dt>
              <dd className="mono text-[10.5px] text-dim">{s.l}</dd>
            </div>
          ))}
        </dl>

        {profile.langs.length > 0 && (
          <div className="mt-5">
            <LangDNA langs={profile.langs} height={4} showLabels />
          </div>
        )}

        {profile.days.length > 0 && (
          <div className="mt-6">
            <Heatmap days={profile.days} cell={7} />
          </div>
        )}
      </div>

      <button
        onClick={onCommit}
        disabled={saving}
        className="mono mt-5 w-full rounded-[3px] bg-merge px-5 py-3 text-[13px] font-medium text-ink-950 transition-opacity hover:opacity-90 disabled:opacity-40 sm:w-auto"
      >
        {saving ? "Merging…" : "Merge to board →"}
      </button>
    </div>
  );
}
