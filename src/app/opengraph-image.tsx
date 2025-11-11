import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OgImage() {
  const title = "African Ethnicities Dictionary";
  const subtitle =
    "Explore ethnic groups across 55 African countries • Multilingual • Open Source";

  // Try to load africa.png from the public folder. Fallback to no image.
  let africaSrc: string | undefined = undefined;
  try {
    const imgRes = await fetch(
      new URL("../../public/africa.png", import.meta.url)
    );
    if (imgRes.ok) {
      const buf = Buffer.from(await imgRes.arrayBuffer());
      africaSrc = `data:image/png;base64,${buf.toString("base64")}`;
    }
  } catch {
    // ignore - image optional
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 35%, #111827 100%)",
          color: "white",
          padding: "48px",
        }}
      >
        {africaSrc ? (
          <img
            src={africaSrc}
            alt="Africa"
            style={{
              position: "absolute",
              right: 32,
              bottom: 32,
              width: 300,
              height: 300,
              opacity: 0.15,
              filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2))",
            }}
          />
        ) : null}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 999,
              background: "#FBBF24",
            }}
          />
          <div style={{ fontSize: 20, opacity: 0.9 }}>
            Dictionnaire des Ethnies d’Afrique
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: -1,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 28, opacity: 0.9 }}>{subtitle}</div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            opacity: 0.9,
          }}
        >
          <div>ethniafrique-atlas.vercel.app</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ fontWeight: 900, color: "#FBBF24" }}>BIG</div>
            <div style={{ fontWeight: 900 }}>EMOTION</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
