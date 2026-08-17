import { ImageResponse } from "next/og";
import { getProfile } from "@/lib/db";
import { compact, langColor } from "@/lib/format";
import { ADD, DIM, FG, INK, LINE, MERGE, MergeMark, MID, OG_SIZE, ogFonts, PANEL } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "An open-source contribution profile on MERGED.";

/**
 * The profile card — the thing that actually travels.
 *
 * Someone sharing their own page is the growth loop, so the card leads with
 * the number that is hard to fake: patches other people merged. It is drawn as
 * a diff line, the same way the site draws every contribution.
 */
export default async function ProfileOG({
  params,
}: {
  params: Promise<{ login: string }>;
}) {
  const { login } = await params;
  const found = await getProfile(login).catch(() => null);
  const fonts = await ogFonts();

  // A card still has to render for a handle that isn't on the board — an
  // unfurl showing nothing is worse than one showing an invitation.
  if (!found) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: INK,
            padding: 72,
            fontFamily: "JetBrains Mono",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <MergeMark size={28} />
            <div style={{ display: "flex", fontSize: 25, fontWeight: 800, color: FG }}>
              MERGED
              <span style={{ color: MERGE }}>.</span>
            </div>
          </div>
          <div style={{ display: "flex", marginTop: 34, fontSize: 56, fontWeight: 800, color: FG }}>
            @{login}
          </div>
          <div style={{ display: "flex", marginTop: 16, fontSize: 24, color: MID }}>
            Not on the board yet.
          </div>
        </div>
      ),
      { ...size, fonts },
    );
  }

  const { profile, score, rank } = found;
  const langs = (profile.langs ?? []).slice(0, 6);
  const langTotal = langs.reduce((s, l) => s + l.weight, 0) || 1;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: INK,
          padding: "56px 64px",
          fontFamily: "JetBrains Mono",
        }}
      >
        {/* wordmark + standing */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <MergeMark size={26} />
            <div style={{ display: "flex", fontSize: 23, fontWeight: 800, color: FG }}>
              MERGED
              <span style={{ color: MERGE }}>.</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <div style={{ display: "flex", fontSize: 15, color: DIM, letterSpacing: "0.16em" }}>
              RANK
            </div>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 800, color: FG }}>
              {String(rank).padStart(2, "0")}
            </div>
          </div>
        </div>

        {/* identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          {profile.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar}
              alt=""
              width={132}
              height={132}
              style={{ borderRadius: 8, border: `1px solid ${LINE}` }}
            />
          ) : null}

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 52,
                fontWeight: 800,
                color: FG,
                letterSpacing: "-0.02em",
              }}
            >
              {profile.name.slice(0, 26)}
            </div>
            <div style={{ display: "flex", marginTop: 6, fontSize: 24, color: DIM }}>
              @{profile.login}
            </div>
          </div>
        </div>

        {/* the claim, as a patch */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            border: `1px solid ${LINE}`,
            borderRadius: 6,
            background: PANEL,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "9px 18px",
              fontSize: 17,
              color: MERGE,
              background: "rgba(163,113,247,0.09)",
            }}
          >
            @@ {score.distinctOwners}+ repositories took their work @@
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "13px 18px",
              fontSize: 27,
              color: FG,
              background: "rgba(63,185,80,0.08)",
            }}
          >
            <span style={{ color: ADD, marginRight: 14 }}>+</span>
            <span style={{ fontWeight: 800 }}>{compact(score.upstreamPRs)}</span>
            <span style={{ marginLeft: 12, color: MID, fontSize: 23 }}>
              patches merged upstream
            </span>
          </div>
        </div>

        {/* score + fingerprint */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", width: 620 }}>
            {/* satori sizes a flex row from its content, so the track needs an
                explicit width for the percentage children to resolve against. */}
            <div
              style={{
                display: "flex",
                width: "100%",
                height: 7,
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              {langs.map((l) => (
                <div
                  key={l.name}
                  style={{
                    display: "flex",
                    width: `${(l.weight / langTotal) * 100}%`,
                    background: langColor(l.name),
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", marginTop: 14, fontSize: 18, color: DIM }}>
              {langs.map((l) => l.name).slice(0, 4).join("  ·  ")}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
            <div
              style={{
                display: "flex",
                fontSize: 15,
                color: MERGE,
                letterSpacing: "0.16em",
                border: `1px solid rgba(163,113,247,0.35)`,
                borderRadius: 3,
                padding: "6px 11px",
              }}
            >
              {score.tier.name.toUpperCase()}
            </div>
            <div style={{ display: "flex", fontSize: 64, fontWeight: 800, color: MERGE }}>
              {score.total}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
