import type { Metadata } from "next";
import { Google_Sans_Flex, Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { AnalyticsClickDelegator } from "@/components/analytics/click-delegator";
import { INTRO_BLOCK_FIRST_PAINT_SCRIPT } from "@/lib/intro/block-first-paint";
import { siteMetaDescription } from "@/lib/content/home";
import { SITE_URL, SITE_NAME, OWNER_JOB_TITLE } from "@/lib/seo/site";
import { SITE_OG_IMAGE, SITE_TWITTER_CARD } from "@/lib/seo/social";

const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  variable: "--font-google-sans-flex",
  axes: ["ROND", "opsz"],
  display: "optional",
  adjustFontFallback: false,
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "optional",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — ${OWNER_JOB_TITLE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: siteMetaDescription,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    images: [SITE_OG_IMAGE],
  },
  twitter: {
    card: SITE_TWITTER_CARD,
    images: [SITE_OG_IMAGE.url],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${googleSansFlex.variable} ${manrope.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_BLOCK_FIRST_PAINT_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <PostHogProvider />
        <AnalyticsClickDelegator />
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
