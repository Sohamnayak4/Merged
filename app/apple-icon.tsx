import { ImageResponse } from "next/og";
import { INK, MERGE } from "@/lib/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS home-screen icon: the merge glyph, no rounding — the OS clips it. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: INK,
        }}
      >
        <svg width="112" height="112" viewBox="0 0 16 16">
          <path
            d="M4 2.5v6a3.5 3.5 0 0 0 3.5 3.5H11"
            fill="none"
            stroke={MERGE}
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <circle cx="4" cy="2.5" r="1.9" fill={MERGE} />
          <circle cx="4" cy="13.5" r="1.9" fill={MERGE} />
          <circle cx="12.2" cy="12" r="1.9" fill={MERGE} />
        </svg>
      </div>
    ),
    size,
  );
}
