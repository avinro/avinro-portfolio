import type { Metadata } from "next";
import { Google_Sans_Flex, Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

/*
 * Google Sans Flex — variable display/heading font (OFL).
 * Expose the ROND (roundness) axis in addition to weight so headings
 * can leverage optical roundness in Phase 1 if needed.
 */
const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["ROND"],
  // Next.js does not have fallback metrics for Google Sans Flex yet;
  // disabling fallback generation avoids a build warning while the
  // variable font itself loads via <link> as normal.
  adjustFontFallback: false,
});

/*
 * Manrope — variable humanist sans for body/UI copy (OFL).
 * Loaded as a variable weight so a single file covers 200–800.
 */
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

/*
 * Geist Mono — kept for code blocks, data IDs, and timestamps.
 * Avoids an extra font download for body copy since Manrope covers it.
 */
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Avinro — Product Designer",
    template: "%s | Avinro",
  },
  description:
    "Product designer crafting thoughtful UX systems, brand identities, and digital products.",
  metadataBase: new URL("https://avinro.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /*
   * Font CSS variables live on <html> so Tailwind's @theme inline
   * and any component using var(--font-*) inherit them correctly.
   * min-h-dvh avoids the iOS 100vh toolbar overlap (skill: viewport-units).
   */
  return (
    <html
      lang="en"
      className={`${googleSansFlex.variable} ${manrope.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
