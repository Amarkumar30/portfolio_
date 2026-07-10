import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Amar Kumar portfolio and blog preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          background:
            "radial-gradient(circle at top left, rgba(52, 211, 153, 0.35), transparent 28%), linear-gradient(135deg, #0b1513 0%, #112723 100%)",
          color: "#ecf5f0",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            fontSize: 24,
            opacity: 0.92,
          }}
        >
          <div
            style={{
              display: "flex",
              height: 64,
              width: 64,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              background: "#34d399",
              color: "#062018",
              fontWeight: 700,
            }}
          >
            AK
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 22 }}>Amar Kumar</span>
            <span style={{ fontSize: 18, opacity: 0.72 }}>Portfolio and blog</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              width: 210,
              borderRadius: 9999,
              border: "1px solid rgba(236, 245, 240, 0.2)",
              padding: "10px 18px",
              fontSize: 18,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Full-stack + GEO
          </div>
          <div style={{ display: "flex", fontSize: 70, fontWeight: 700, lineHeight: 1.1 }}>
            Computer Science undergraduate building reliable products and studying visibility in AI search.
          </div>
          <div style={{ display: "flex", fontSize: 26, opacity: 0.78 }}>
            South Asian University • Projects • Writing • SDE trajectory
          </div>
        </div>
      </div>
    ),
    size,
  );
}
