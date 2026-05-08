import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comments — Client Portal",
  robots: { index: false },
};

export default function CommentsPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-foreground text-xl font-bold">Comments</h1>
      <p className="text-muted-foreground mt-2 text-sm">Coming soon.</p>
    </div>
  );
}
