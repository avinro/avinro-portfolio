import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { getWorkBySlug, getWorkSlugs } from "@/lib/content/works";
import { localizeWorkCategory } from "@/lib/content/work-category";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getWorkSlugs(locale).map((slug) => ({ locale, slug })),
  );
}

export default async function WorkOGImage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const work = getWorkBySlug(slug, locale);
  const t = await getTranslations({ locale, namespace: "work" });

  const title = work?.frontmatter.title ?? "Work";
  const category = work ? localizeWorkCategory(work.frontmatter.category, t) : "";
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
