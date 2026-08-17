import { ImageResponse } from "next/og";
import { ADD, DIM, FG, INK, LINE, MERGE, MergeMark, MID, OG_SIZE, ogFonts, PANEL } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "MERGED. — your best work is in someone else's repo.";

/**
 * The site card.
 *
 * Deliberately independent of the database: this is the image that renders
 * when someone drops the bare domain into a timeline, and it should never be
 * one slow query away from a blank rectangle.
 */
export default async function OpengraphImage() {
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
          padding: "60px 64px",
          fontFamily: "JetBrains Mono",
        }}
      >
        {/* wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <MergeMark size={30} />
          <div style={{ display: "flex", fontSize: 27, fontWeight: 800, color: FG }}>
            MERGED
            <span style={{ color: MERGE }}>.</span>
          </div>
        </div>

        {/* thesis */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 62,
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              color: FG,
            }}
          >
            <div style={{ display: "flex" }}>Your best work is in</div>
            <div style={{ display: "flex" }}>
              <span style={{ color: MERGE }}>someone else&rsquo;s</span>
              <span>&nbsp;repo.</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: 21,
              color: MID,
              maxWidth: 880,
              lineHeight: 1.5,
            }}
          >
            A leaderboard for open source, ranked by the patches other
            maintainers merged.
          </div>
        </div>

        {/* the material the whole product is made of */}
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
              fontSize: 18,
              color: MERGE,
              background: "rgba(163,113,247,0.09)",
            }}
          >
            @@ ranked by patches merged upstream @@
          </div>
          <div
            style={{
              display: "flex",
              padding: "9px 18px",
              fontSize: 18,
              color: FG,
              background: "rgba(63,185,80,0.08)",
              borderLeft: `3px solid ${ADD}`,
            }}
          >
            <span style={{ color: ADD, marginRight: 12 }}>+</span>
            reviewed and merged by someone who didn&rsquo;t have to say yes
          </div>
          <div style={{ display: "flex", padding: "9px 18px", fontSize: 18, color: DIM }}>
            &nbsp;&nbsp;no account · reads public GitHub data
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
