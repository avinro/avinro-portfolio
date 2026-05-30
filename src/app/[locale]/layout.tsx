import type { Metadata } from "next";
import { Google_Sans_Flex, Geist_Mono, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";

import { AnalyticsClickDelegator } from "@/components/analytics/click-delegator";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isLocale, routing } from "@/i18n/routing";
import { INTRO_CHECKING_HTML_CLASS } from "@/lib/intro/constants";
import { OWNER_JOB_TITLE, SITE_NAME, SITE_URL } from "@/lib/seo/site";
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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: safeLocale, namespace: "meta" });

  return {
    title: {
      default: `${SITE_NAME} — ${OWNER_JOB_TITLE}`,
      template: `%s | ${SITE_NAME}`,
    },
    description: t("siteDescription"),
    metadataBase: new URL(SITE_URL),
    openGraph: {
      type: "website",
      locale: safeLocale === "es" ? "es_ES" : "en_US",
      siteName: SITE_NAME,
      images: [SITE_OG_IMAGE],
    },
    twitter: {
      card: SITE_TWITTER_CARD,
      images: [SITE_OG_IMAGE.url],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${googleSansFlex.variable} ${manrope.variable} ${geistMono.variable} ${INTRO_CHECKING_HTML_CLASS} h-full antialiased`}
    >
      <head />
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <PostHogProvider />
          <AnalyticsClickDelegator />
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
