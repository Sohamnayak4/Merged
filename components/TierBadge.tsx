import type { Tier } from "@/lib/types";

/**
 * Tier names borrow the real ladder open-source projects use for their own
 * people — first patch, contributor, committer, maintainer, core. The label
 * means something to the audience instead of inventing Bronze through Diamond.
 */
export default function TierBadge({
  tier,
  size = "sm",
}: {
  tier: Tier;
  size?: "sm" | "lg";
}) {
  const strong = tier.min >= 600;
  return (
    <span
      className={[
        "mono inline-flex items-center whitespace-nowrap rounded-[2px] border uppercase tracking-[0.14em]",
        size === "lg"
          ? "px-2.5 py-1 text-[11px]"
          : "px-1.5 py-0.5 text-[9.5px]",
        strong
          ? "border-merge/35 bg-merge/10 text-merge"
          : "border-line-2 bg-ink-800 text-mid",
      ].join(" ")}
    >
      {tier.name}
    </span>
  );
}
