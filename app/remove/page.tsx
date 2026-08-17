import { Suspense } from "react";
import RemoveFlow from "@/components/RemoveFlow";

export const metadata = {
  title: "Take me off — MERGED.",
  description: "Ask to be removed from the board.",
};

export default function RemovePage() {
  return (
    <div className="mx-auto max-w-[720px] px-5 py-14 sm:px-8 sm:py-20">
      <p className="label mb-5 flex items-center gap-2">
        <span className="inline-block h-px w-6 bg-merge" />
        Opt out
      </p>

      <h1 className="display text-[38px] sm:text-[48px]">
        Take me off
        <br />
        the board.
      </h1>

      <p className="mt-6 max-w-[56ch] text-[15px] leading-relaxed text-mid">
        Anyone can add anyone here, which means people end up ranked without
        ever asking to be. If that&rsquo;s you, say so and the entry comes down.
        No justification needed.
      </p>

      <p className="mono mt-4 max-w-[62ch] text-[11.5px] leading-relaxed text-dim">
        Requests are handled by hand rather than instantly — without accounts
        there&rsquo;s no way to prove you are who you say you are, and letting
        anyone hide anyone would just be a different kind of abuse.
      </p>

      <Suspense fallback={<div className="min-h-[40vh]" />}>
        <RemoveFlow />
      </Suspense>
    </div>
  );
}
