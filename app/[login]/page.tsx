import Link from "next/link";
import { notFound } from "next/navigation";
import ProfileView from "@/components/ProfileView";
import { getProfile } from "@/lib/db";
import { siteUrl } from "@/lib/site";

export const revalidate = 300;

/** GitHub's own handle rules — anything else can't be a person, so 404 fast. */
const HANDLE = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ login: string }>;
}) {
  const { login } = await params;
  const found = await getProfile(login).catch(() => null);
  const canonical = `${siteUrl()}/${found?.profile.login ?? login}`;

  if (!found) {
    return {
      title: `@${login} — MERGED.`,
      description: `@${login} isn't on the board yet.`,
      alternates: { canonical },
    };
  }

  const { profile, score } = found;
  const description =
    `${score.upstreamPRs} patches merged into repositories ` +
    `@${profile.login} doesn't own, across ${score.distinctOwners}+ owners. ` +
    `Impact ${score.total} — ${score.tier.name}.`;

  return {
    title: `${profile.name} — MERGED.`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      url: canonical,
      title: `${profile.name} (@${profile.login}) — MERGED.`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${profile.name} (@${profile.login}) — MERGED.`,
      description,
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ login: string }>;
}) {
  const { login } = await params;
  if (!HANDLE.test(login)) notFound();

  const found = await getProfile(login);

  if (!found) {
    return (
      <div className="mx-auto max-w-[1180px] px-5 py-28 text-center sm:px-8">
        <h1 className="display text-[34px]">Nobody here by that name</h1>
        <p className="mono mt-3 text-[12px] text-dim">
          @{login} isn&rsquo;t on the board yet.
        </p>
        <Link
          href={`/add?url=${encodeURIComponent(login)}`}
          className="mono mt-7 inline-block rounded-[3px] bg-merge px-4 py-2.5 text-[12px] font-medium text-ink-950"
        >
          Add @{login}
        </Link>
      </div>
    );
  }

  return (
    <ProfileView
      profile={found.profile}
      score={found.score}
      rank={found.rank}
    />
  );
}
