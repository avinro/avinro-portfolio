import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — Client Portal",
  robots: { index: false },
};

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-foreground text-xl font-bold">Settings</h1>
      <p className="text-muted-foreground mt-2 text-sm">Coming soon.</p>
    </div>
  );
}
