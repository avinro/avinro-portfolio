import { Skeleton } from "@/components/ui/skeleton";

/**
 * Client portal loading skeleton.
 *
 * Matches the shell silhouette so there is no content layout shift between
 * the loading state and the rendered portal. Uses Skeleton which applies
 * animate-pulse internally — gated by prefers-reduced-motion in globals.css
 * (Tailwind generates motion-safe:animate-pulse via the Skeleton component).
 *
 * Structure mirrors ClientPortalShell:
 * - Sticky header bar
 * - Sidebar rail placeholder (md+)
 * - Main content area with card skeletons
 * - Bottom tab bar placeholder (<md)
 */
export default function ClientPortalLoading() {
  return (
    <div className="flex min-h-dvh w-full">
      {/* Sidebar rail placeholder — visible md+ */}
      <aside className="border-border hidden w-12 shrink-0 flex-col border-r md:flex">
        <div className="border-border flex h-14 items-center border-b px-3">
          <Skeleton className="h-5 w-5 rounded-md" />
        </div>
        <div className="flex flex-1 flex-col gap-2 px-2 py-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </div>
      </aside>

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header skeleton */}
        <div className="border-border flex h-14 items-center gap-3 border-b px-4">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-5 w-32 rounded" />
          <div className="ml-auto flex gap-2">
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>

        {/* Page content skeleton */}
        <main className="flex flex-1 flex-col gap-6 p-4 pb-20 md:p-6 md:pb-6">
          {/* Page heading */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-7 w-48 rounded" />
            <Skeleton className="h-4 w-36 rounded" />
          </div>

          {/* Summary card */}
          <Skeleton className="h-32 w-full rounded-xl" />

          {/* Secondary cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </main>

        {/* Bottom nav placeholder — visible <md */}
        <div className="border-border bg-background fixed inset-x-0 bottom-0 flex h-16 items-center justify-around border-t px-4 md:hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
