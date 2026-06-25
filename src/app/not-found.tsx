import { Geist_Mono, Google_Sans_Flex, Manrope } from "next/font/google";
import Link from "next/link";

import LetterGlitch from "@/components/motion/letter-glitch";
import { Button } from "@/components/ui/button";

// Mirror the locale layout fonts so this standalone fallback (rendered for any
// unmatched URL, outside the [locale] tree) still uses the site type system.
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

/**
 * Global 404. In the App Router an unmatched URL renders this root not-found
 * (the nested [locale] not-found only renders on an explicit notFound() call),
 * so this is the primary 404 surface. The root layout only imports globals.css
 * and returns children, so this file owns its own <html>/<body>.
 */
export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      className={`${googleSansFlex.variable} ${manrope.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex h-dvh flex-col overflow-hidden">
        <main
          id="main-content"
          className="relative flex flex-1 flex-col items-center justify-center px-6 text-center"
        >
          {/* Decorative matrix backdrop pinned to the full viewport; center
              vignette clears a calm zone so the 404 and CTA stay legible. */}
          <div aria-hidden="true" className="pointer-events-none fixed inset-0">
            <LetterGlitch className="opacity-70 dark:opacity-60" centerVignette outerVignette />
          </div>

          <div className="relative flex flex-col items-center gap-6">
            <p className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
              You got lost in the matrix
            </p>
            <h1
              className="font-display text-foreground font-black tracking-tight tabular-nums"
              style={{ fontSize: "clamp(6rem, 28vh, 18rem)", lineHeight: 1 }}
            >
              404
            </h1>
            <p className="text-muted-foreground max-w-md text-base sm:text-lg">
              This page slipped through a crack in the simulation.
            </p>
            <Button asChild variant="outline" size="lg" className="min-h-[44px]">
              <Link href="/">Back to reality</Link>
            </Button>
          </div>
        </main>
      </body>
    </html>
  );
}
