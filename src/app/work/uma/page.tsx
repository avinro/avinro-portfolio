import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UMA",
  description: "Case study coming soon.",
  robots: { index: false, follow: false },
};

/*
 * Slug reserved for the UMA case study (Phase 1).
 * Intentionally not indexed — prevents premature crawling.
 */
export default function UmaPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl tracking-tight sm:text-3xl">UMA</h1>
      <p className="text-muted-foreground max-w-sm text-sm sm:max-w-md sm:text-base">
        This case study is being prepared. Check back soon.
      </p>
    </main>
  );
}
