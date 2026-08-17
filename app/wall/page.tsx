import Link from "next/link";
import Wall from "@/components/Wall";
import { wallItems } from "@/lib/db";

export const revalidate = 300;

export const metadata = {
  title: "The wall — MERGED.",
  description: "Every upstream patch on the board, newest first.",
};

export default async function WallPage() {
  const items = await wallItems(180, 14);
  const repos = new Set(items.map((i) => i.pr.repo)).size;

  return (
    <>
      <section className="gutter-field border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 py-14 sm:px-8 sm:py-20">
          <p className="label mb-5 flex items-center gap-2">
            <span className="inline-block h-px w-6 bg-merge" />
            Every patch, newest first
          </p>
          <h1 className="display text-[42px] sm:text-[58px]">The wall</h1>
          <p className="mt-5 max-w-[54ch] text-[15px] leading-relaxed text-mid">
            {items.length > 0 ? (
              <>
                {items.length} pull requests that maintainers across {repos}{" "}
                repositories reviewed and merged. Each one is somebody&rsquo;s
                work in somebody else&rsquo;s codebase.
              </>
            ) : (
              <>
                Nothing on the wall yet. It fills up as people join the board —
                every patch here is work that landed in a codebase its author
                doesn&rsquo;t own.
              </>
            )}
          </p>

          {items.length === 0 && (
            <Link
              href="/add"
              className="mono mt-7 inline-block rounded-[3px] bg-merge px-4 py-2.5 text-[12.5px] font-medium text-ink-950 transition-opacity hover:opacity-90"
            >
              + Add the first
            </Link>
          )}
        </div>
      </section>

      {items.length > 0 && (
        <section className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8">
          <Wall items={items} />
        </section>
      )}
    </>
  );
}
