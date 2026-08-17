import { NextResponse } from "next/server";
import { buildProfile, resolveLink, GitHubError } from "@/lib/github";
import { parseTarget } from "@/lib/parse";

/**
 * One endpoint for whatever got pasted. The client sends a raw string; this
 * decides whether it names a person or a single piece of work, and returns the
 * richest thing it can build from public data alone.
 */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json(
      { error: "Paste a GitHub profile or a link to something you shipped." },
      { status: 400 },
    );
  }

  const target = parseTarget(q);

  if (target.kind === "unknown") {
    return NextResponse.json(
      {
        error:
          "That doesn't look like a profile or a link. Try github.com/yourname.",
      },
      { status: 400 },
    );
  }

  try {
    if (target.kind === "user") {
      const profile = await buildProfile(target.login);
      return NextResponse.json({ type: "profile", profile });
    }

    const link = await resolveLink(target);

    // A link usually names its author, which means we can offer the full
    // profile instead of a lone card.
    return NextResponse.json({ type: "link", link, author: link.author ?? null });
  } catch (err) {
    const status = err instanceof GitHubError ? err.status : 500;
    return NextResponse.json(
      {
        error:
          err instanceof GitHubError
            ? err.message
            : "Couldn't read that link.",
      },
      { status: status === 404 ? 404 : status === 429 ? 429 : 502 },
    );
  }
}
