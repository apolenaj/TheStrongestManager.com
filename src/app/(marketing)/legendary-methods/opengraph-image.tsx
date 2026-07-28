import { ImageResponse } from "next/og";

export const alt =
  "Legendary Training Methods — abstract barbell and volume geometry";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Original social graphic — no celebrity photographs, faces, or federation marks.
 */
export default function LegendaryMethodsOpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background:
            "linear-gradient(145deg, #121412 0%, #070807 55%, #0d120e 100%)",
          color: "#f4f7f2",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              maxWidth: 720,
            }}
          >
            <div
              style={{
                fontSize: 22,
                letterSpacing: 6,
                textTransform: "uppercase",
                color: "#b7ff2a",
                fontFamily: "sans-serif",
              }}
            >
              The Strongest Manager
            </div>
            <div
              style={{
                fontSize: 64,
                lineHeight: 1.05,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Legendary Training Methods
            </div>
            <div
              style={{
                fontSize: 26,
                lineHeight: 1.35,
                color: "#a8b5a4",
                fontFamily: "sans-serif",
                maxWidth: 640,
              }}
            >
              Independent educational analysis of bodybuilding, powerlifting and
              strongman systems — not athlete endorsements.
            </div>
          </div>

          <svg width="280" height="220" viewBox="0 0 280 220">
            <rect
              x="40"
              y="30"
              width="24"
              height="140"
              fill="#b7ff2a"
              opacity="0.35"
            />
            <rect
              x="78"
              y="60"
              width="24"
              height="110"
              fill="#b7ff2a"
              opacity="0.55"
            />
            <rect
              x="116"
              y="20"
              width="24"
              height="150"
              fill="#b7ff2a"
              opacity="0.8"
            />
            <line
              x1="20"
              y1="190"
              x2="260"
              y2="190"
              stroke="#b7ff2a"
              strokeWidth="8"
            />
            <rect x="10" y="170" width="28" height="40" fill="#b7ff2a" />
            <rect x="242" y="170" width="28" height="40" fill="#b7ff2a" />
            <circle
              cx="210"
              cy="90"
              r="48"
              fill="none"
              stroke="#b7ff2a"
              strokeWidth="6"
              opacity="0.5"
            />
          </svg>
        </div>

        <div
          style={{
            display: "flex",
            gap: 24,
            fontSize: 20,
            color: "#8f9c8b",
            fontFamily: "sans-serif",
            textTransform: "uppercase",
            letterSpacing: 3,
          }}
        >
          <span>Bodybuilding</span>
          <span>Strongman</span>
          <span>Powerlifting</span>
          <span>Systems</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
