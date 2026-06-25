import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

/**
 * robots.txt via the native App Router handler.
 *
 * Allows all crawlers on the public portfolio while blocking:
 *   /admin    — future private back-office (PRO-20 AC)
 *   /outreach — Phase 2 private backoffice (PRO-20 AC)
 *   /dev      — dev-only component playground (returns 404 in production)
 *   /_next/static/media/ — content-hashed fonts/assets whose hash rotates each
 *     deploy. Google crawls the preloaded woff2 URLs and reports stale ones as
 *     404 in Search Console; blocking the crawl removes that noise. JS/CSS under
 *     /_next/static/{chunks,css} stays crawlable so rendering is unaffected, and
 *     the favicon is served from /icon.png (not this path).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/outreach", "/dev", "/_next/static/media/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
