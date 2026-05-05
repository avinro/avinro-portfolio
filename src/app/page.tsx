import type { Metadata } from "next";

import { HomeHero } from "@/components/site/home-hero";
import { SelectedWork } from "@/components/site/selected-work";
import { SocialProof } from "@/components/site/social-proof";
import { AboutTeaser } from "@/components/site/about-teaser";
import { FinalCta } from "@/components/site/final-cta";

/*
 * Home page metadata — Open Graph and Twitter cards are wired to the
 * dynamic opengraph-image.tsx handler in this directory so they update
 * automatically whenever the handler changes.
 */
export const metadata: Metadata = {
  title: "Avinro — Product Designer",
  description:
    "Product designer crafting thoughtful UX systems, brand identities, and digital products.",
  openGraph: {
    title: "Avinro — Product Designer",
    description:
      "Product designer crafting thoughtful UX systems, brand identities, and digital products.",
    url: "https://avinro.com",
    siteName: "Avinro",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Avinro — Product Designer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Avinro — Product Designer",
    description:
      "Product designer crafting thoughtful UX systems, brand identities, and digital products.",
    images: ["/opengraph-image"],
  },
};

/*
 * Home page — public portfolio landing.
 *
 * Sections:
 *   1. HomeHero    — headline, sub, secondary CTA
 *   2. SelectedWork — 2 case study cards
 *   3. SocialProof — testimonial + decorative logo row
 *   4. AboutTeaser — short bio + link to /about
 *   5. FinalCta    — closing heading + secondary supporting CTA
 *
 * The <main> id="main-content" is the target for the skip link rendered in
 * SiteHeader, allowing keyboard users to bypass navigation directly.
 */
export default function Home() {
  return (
    <main id="main-content">
      <HomeHero />
      <SelectedWork />
      <SocialProof />
      <AboutTeaser />
      <FinalCta />
    </main>
  );
}
