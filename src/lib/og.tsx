/**
 * Shared 1200×630 share-image template used by the site-wide and per-entry opengraph-image routes.
 */
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

interface OgImageProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export function renderOgImage({ eyebrow, title, subtitle }: OgImageProps) {
  const titleSize = title.length > 70 ? 54 : title.length > 40 ? 64 : 76;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background:
            "radial-gradient(circle at 15% 0%, rgba(52, 211, 153, 0.22), transparent 45%), #0c1412",
          color: "#e9f2ee",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              height: 56,
              width: 56,
              borderRadius: 28,
              alignItems: "center",
              justifyContent: "center",
              background: "#34d399",
              color: "#04170f",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            AK
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 24, fontWeight: 600 }}>Amar Kumar</span>
            <span style={{ fontSize: 18, opacity: 0.7 }}>amarkumar.dev</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#34d399",
            }}
          >
            {eyebrow}
          </div>
          <div style={{ display: "flex", fontSize: titleSize, fontWeight: 700, lineHeight: 1.1 }}>
            {title}
          </div>
          {subtitle ? (
            <div style={{ display: "flex", fontSize: 28, lineHeight: 1.35, opacity: 0.78 }}>
              {subtitle.length > 140 ? `${subtitle.slice(0, 137)}…` : subtitle}
            </div>
          ) : null}
        </div>
      </div>
    ),
    ogSize,
  );
}
