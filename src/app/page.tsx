import { Button } from "@/components/ui/button";

/*
 * Placeholder landing page — replaced in Phase 1 (F1-* portfolio issues).
 * Verifies the full token system is wired correctly after PRO-7:
 *   — Google Sans Flex heading font via font-display
 *   — Manrope body font via font-sans (html default)
 *   — bg-primary = near-black (light) / near-white (dark)
 *   — shadcn Button renders with the new palette
 *   — Mobile-first layout: base targets 375 px, breakpoints expand upward
 */
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      {/* Wordmark placeholder */}
      <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold select-none">
        A
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl tracking-tight sm:text-3xl">Avinro — Product Designer</h1>
        <p className="text-muted-foreground max-w-sm text-sm sm:max-w-md sm:text-base">
          Strategic design leadership — brand identity, UX systems, and client portals.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button>Get in touch</Button>
        <Button variant="outline">View work</Button>
      </div>
    </main>
  );
}
