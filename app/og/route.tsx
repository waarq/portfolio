import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#F7F4EE",
          padding: "80px",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#66635E", letterSpacing: 4 }}>
          WALEED AHMED
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            color: "#1B1B1B",
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          Crafting products people remember.
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#B76E56", fontStyle: "italic" }}>
          Software Engineer &amp; Product Builder
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
