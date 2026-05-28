import { OWNER_JOB_TITLE, SITE_NAME } from "@/lib/seo/site";

export const SITE_OG_IMAGE_PATH = "/images/og.jpg";

export const SITE_OG_IMAGE = {
  url: SITE_OG_IMAGE_PATH,
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} — ${OWNER_JOB_TITLE}`,
} as const;

export const SITE_TWITTER_CARD = "summary_large_image" as const;
