import { ImageResponse } from "next/og";
import { getWorkBySlug, getWorkSlugs } from "@/lib/content/works";

/*
 * Per-slug Open Graph image for work (visual exploration) pages.
 *
 * Renders title, category, year — visually similar to the case study OG image
 * but with "Work" instead of "Case Study" in the kicker so social previews
 * distinguish the two content types.
 */

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getWorkSlugs().map((slug) => ({ slug }));
}

export default async function WorkOGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);

  const title = work?.frontmatter.title ?? "Work";
  const category = work?.frontmatter.category ?? "";
  const year = work?.frontmatter.year != null ? String(work.frontmatter.year) : "";

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        width: "100%",
        height: "100%",
        padding: "80px",
        background: "#09090B",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Wordmark */}
      <span
        style={{
          fontSize: 16,
          fontWeight: 500,
          letterSpacing: "0.1em",
          color: "#71717A",
          textTransform: "uppercase",
          marginBottom: 40,
        }}
      >
        avinro.com · Work
      </span>

      {/* Title */}
      <span
        style={{
          fontSize: 80,
          fontWeight: 700,
          color: "#FAFAFA",
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
          marginBottom: 24,
          maxWidth: 900,
        }}
      >
        {title}
      </span>

      {/* Category · Year */}
      {(category || year) && (
        <span
          style={{
            fontSize: 24,
            fontWeight: 400,
            color: "#71717A",
          }}
        >
          {[category, year].filter(Boolean).join(" · ")}
        </span>
      )}

      {/* Accent rule */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 80,
          width: 48,
          height: 4,
          background: "#2563EB",
          borderRadius: 2,
        }}
      />
    </div>,
    { ...size },
  );
}
