import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <main
          id="main-content"
          style={{
            minHeight: "100dvh",
            display: "grid",
            placeItems: "center",
            padding: "24px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ maxWidth: 480, textAlign: "center" }}>
            <p style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: "0.15em" }}>404</p>
            <h1 style={{ fontSize: "clamp(48px, 18vw, 160px)", lineHeight: 1, margin: 0 }}>404</h1>
            <p>This page does not exist or has moved.</p>
            <Link href="/">Back home</Link>
          </div>
        </main>
      </body>
    </html>
  );
}
