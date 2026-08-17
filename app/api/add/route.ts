import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { buildProfile, GitHubError } from "@/lib/github";
import { parseTarget } from "@/lib/parse";
import {
  recordSubmission,
  statusOf,
  submissionsSince,
  upsertProfile,
} from "@/lib/db";
import { ipHashOf, LIMITS } from "@/lib/request";
import type { Profile, ResolvedLink } from "@/lib/types";

// Building a profile is six or seven GitHub calls. Comfortable with a token,
// but well past the 10s default.
export const maxDuration = 60;

const EMPTY = {
  bio: null, company: null, location: null, blog: null,
  followers: 0, publicRepos: 0, repos: [], totalStars: 0,
  mergedTotal: 0, upstreamTotal: 0, upstreamPRs: [], upstreamOwners: [],
  langs: [], days: [], orgs: [],
};

export async function POST(request: Request) {
  let body: { q?: string; link?: ResolvedLink; handle?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }

  const ipHash = ipHashOf(request);

  try {
    const recent = await submissionsSince(ipHash, 60);
    if (recent >= LIMITS.submissionsPerHour) {
      return NextResponse.json(
        {
          error: `That's ${LIMITS.submissionsPerHour} submissions in an hour from this connection. Try again later.`,
        },
        { status: 429 },
      );
    }

    // ── a hand-added link, for work that isn't a GitHub pull request ──
    if (body.link) {
      const login = (body.handle ?? "").trim().replace(/^@/, "");
      if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(login)) {
        return NextResponse.json(
          { error: "Pick a handle: letters, numbers and dashes." },
          { status: 400 },
        );
      }
      if ((await statusOf(login)) === "hidden") return removed();

      const profile = {
        ...EMPTY,
        login,
        name: login,
        avatar: "",
        createdAt: new Date().toISOString(),
        url: body.link.url,
        links: [body.link],
        source: "links",
      } as Profile;

      await upsertProfile(profile, { ipHash, source: "links" });
      await recordSubmission(ipHash, login);
      bust(login);
      return NextResponse.json({ login });
    }

    // ── a GitHub identity ─────────────────────────────────────────────
    const target = parseTarget(body.q ?? "");
    if (target.kind !== "user") {
      return NextResponse.json(
        { error: "Expected a GitHub profile or handle." },
        { status: 400 },
      );
    }

    if ((await statusOf(target.login)) === "hidden") return removed();

    const profile = await buildProfile(target.login);
    await upsertProfile(profile, { ipHash });
    await recordSubmission(ipHash, profile.login);
    bust(profile.login);

    return NextResponse.json({ login: profile.login });
  } catch (err) {
    const status = err instanceof GitHubError ? err.status : 500;
    return NextResponse.json(
      {
        error:
          err instanceof GitHubError
            ? err.message
            : "Couldn't save that. Try again in a moment.",
      },
      { status: status === 404 ? 404 : status === 429 ? 429 : 502 },
    );
  }
}

function removed() {
  return NextResponse.json(
    {
      error:
        "This person asked to be taken off the board, so they can't be re-added.",
    },
    { status: 403 },
  );
}

function bust(login: string) {
  revalidatePath("/");
  revalidatePath("/wall");
  revalidatePath(`/${login}`);
}
