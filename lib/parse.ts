export type Target =
  | { kind: "user"; login: string }
  | { kind: "pr"; owner: string; repo: string; number: number }
  | { kind: "issue"; owner: string; repo: string; number: number }
  | { kind: "commit"; owner: string; repo: string; sha: string }
  | { kind: "repo"; owner: string; repo: string }
  | { kind: "web"; url: string }
  | { kind: "unknown"; input: string };

/** Paths GitHub owns that are never a person. */
const RESERVED = new Set([
  "orgs", "topics", "collections", "trending", "features", "sponsors",
  "explore", "marketplace", "pricing", "about", "settings", "notifications",
  "pulls", "issues", "search", "login", "join", "new", "codespaces",
]);

/**
 * Works out what someone just pasted. The visitor shouldn't have to tell us
 * whether they handed over a profile, a merged PR, or an unrelated URL — the
 * shapes are unambiguous enough to just read.
 */
export function parseTarget(raw: string): Target {
  const input = raw.trim();
  if (!input) return { kind: "unknown", input };

  // A bare handle or @handle.
  if (/^@?[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(input)) {
    return { kind: "user", login: input.replace(/^@/, "") };
  }

  let url: URL;
  try {
    url = new URL(input.startsWith("http") ? input : `https://${input}`);
  } catch {
    return { kind: "unknown", input };
  }

  const host = url.hostname.replace(/^www\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  if (host !== "github.com") return { kind: "web", url: url.toString() };
  if (!parts.length) return { kind: "unknown", input };

  const [owner, repo, section, id] = parts;
  if (RESERVED.has(owner.toLowerCase())) return { kind: "unknown", input };

  if (repo && section === "pull" && id && /^\d+$/.test(id))
    return { kind: "pr", owner, repo, number: Number(id) };

  if (repo && section === "issues" && id && /^\d+$/.test(id))
    return { kind: "issue", owner, repo, number: Number(id) };

  if (repo && section === "commit" && id)
    return { kind: "commit", owner, repo, sha: id };

  if (repo) return { kind: "repo", owner, repo };

  return { kind: "user", login: owner };
}
