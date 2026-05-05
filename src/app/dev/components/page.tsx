import { Loader2 } from "lucide-react";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

/*
 * Production guard explanation:
 *   force-dynamic — prevents static pre-rendering so no HTML is generated.
 *   notFound()    — called INSIDE the component (not at module level) so
 *                   Next.js can safely import the module during build for
 *                   configuration collection, while the page returns 404
 *                   at request time in production.
 * Add `Disallow: /dev` to robots.txt when F1-9 (SEO) is tackled.
 */
export const dynamic = "force-dynamic";

/* ─── Token catalogue ──────────────────────────────────────────────── */

interface Swatch {
  label: string;
  bg: string;
  fg: string;
  note?: string;
}

const swatches: Swatch[] = [
  { label: "background", bg: "bg-background", fg: "text-foreground", note: "Surface base" },
  { label: "foreground", bg: "bg-foreground", fg: "text-background", note: "≈17:1 on bg" },
  { label: "card", bg: "bg-card", fg: "text-card-foreground", note: "Elevated surface" },
  { label: "primary", bg: "bg-primary", fg: "text-primary-foreground", note: "CTA: black→white" },
  {
    label: "secondary",
    bg: "bg-secondary",
    fg: "text-secondary-foreground",
    note: "Subtle container",
  },
  { label: "muted", bg: "bg-muted", fg: "text-muted-foreground", note: "Muted fg ≈6:1" },
  { label: "accent", bg: "bg-accent", fg: "text-accent-foreground", note: "Blue-600 ≈5:1" },
  {
    label: "destructive",
    bg: "bg-destructive",
    fg: "text-destructive-foreground",
    note: "Red-600",
  },
  { label: "success", bg: "bg-success", fg: "text-success-foreground", note: "Green-600" },
  { label: "warning", bg: "bg-warning", fg: "text-warning-foreground", note: "Amber-600" },
  { label: "info", bg: "bg-info", fg: "text-info-foreground", note: "Blue (=accent)" },
  { label: "border", bg: "bg-border", fg: "text-foreground", note: "Zinc-200 / 10%" },
  { label: "ring", bg: "bg-ring", fg: "text-background", note: "Focus indicator" },
];

function SwatchGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {swatches.map(({ label, bg, fg, note }) => (
        <div key={label} className={`${bg} ${fg} rounded-lg p-3`}>
          {" "}
          {}
          <p className="font-mono text-xs font-medium">{label}</p>
          {note && <p className="mt-0.5 font-sans text-xs opacity-70">{note}</p>}
        </div>
      ))}
    </div>
  );
}

/* ─── Typography specimen ──────────────────────────────────────────── */

const typeScale = [
  { label: "text-xs", cls: "text-xs", text: "Caption / metadata (12 px)" },
  { label: "text-sm", cls: "text-sm", text: "Small body / labels (14 px)" },
  { label: "text-base", cls: "text-base", text: "Body copy — Manrope (16 px, lh 1.55)" },
  { label: "text-lg", cls: "text-lg", text: "Large body (18 px)" },
  { label: "text-xl", cls: "text-xl font-display", text: "Subheading — Display (20 px)" },
  { label: "text-2xl", cls: "text-2xl font-display", text: "Section heading (24 px)" },
  { label: "text-3xl", cls: "text-3xl font-display", text: "Page heading (30 px)" },
  { label: "text-4xl", cls: "text-4xl font-display", text: "Hero heading (36 px)" },
];

function TypographySpecimen() {
  return (
    <div className="flex flex-col gap-4">
      {typeScale.map(({ label, cls, text }) => (
        <div key={label} className="flex flex-col gap-0.5">
          <span className={cls}>{text}</span>
          <span className="text-muted-foreground font-mono text-xs">{label}</span>
        </div>
      ))}
      <Separator />
      <div>
        <p className="text-muted-foreground mb-2 font-mono text-xs">Monospace (Geist Mono)</p>
        <code className="font-mono text-sm">const value = oklch(0.508 0.235 265);</code>
      </div>
    </div>
  );
}

/* ─── Component state matrices ─────────────────────────────────────── */

function ButtonMatrix() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
        Button — default | secondary | outline | ghost | destructive | link
      </p>
      <div className="flex flex-wrap gap-2">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>
      <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Sizes</p>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="xs">xs</Button>
        <Button size="sm">sm</Button>
        <Button>default</Button>
        <Button size="lg">lg</Button>
      </div>
      <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
        States — disabled / loading / icon
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button disabled>Disabled</Button>
        <Button disabled variant="outline">
          Disabled outline
        </Button>
        <Button aria-busy="true" disabled>
          <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          Loading
        </Button>
      </div>
    </div>
  );
}

function InputMatrix() {
  return (
    <div className="flex max-w-sm flex-col gap-3">
      <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
        Input — default | focus | disabled | invalid
      </p>
      <Input placeholder="Default input" />
      <Input placeholder="With value" defaultValue="Avinro" />
      <Input placeholder="Disabled" disabled />
      <Input placeholder="Error state" aria-invalid="true" />
      <Input type="email" placeholder="email@example.com" />
      <Input type="password" placeholder="Password" />
    </div>
  );
}

function BadgeMatrix() {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="destructive">Destructive</Badge>
      {/* Semantic — using custom bg until shadcn supports them natively */}
      <span className="bg-success text-success-foreground inline-flex h-5 items-center rounded-full px-2 text-xs font-medium">
        Success
      </span>
      <span className="bg-warning text-warning-foreground inline-flex h-5 items-center rounded-full px-2 text-xs font-medium">
        Warning
      </span>
      <span className="bg-info text-info-foreground inline-flex h-5 items-center rounded-full px-2 text-xs font-medium">
        Info
      </span>
    </div>
  );
}

function CardMatrix() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Card title</CardTitle>
          <CardDescription>Card description text using muted-foreground token.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Card body content. Uses bg-card + ring-1 ring-foreground/10.</p>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardHeader>
          <CardTitle>Small card</CardTitle>
          <CardDescription>Compact variant (size=sm).</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">Tag</Badge>
        </CardContent>
      </Card>
    </div>
  );
}

function SkeletonMatrix() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
        Skeleton — loading placeholders
      </p>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

/* ─── Section wrapper ──────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
        {title}
      </h2>
      {children}
      <Separator />
    </section>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────── */

export default function ComponentsPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* ── Light mode ─────────────────────────────────────────────── */}
      <div className="px-4 py-12 sm:px-8">
        <header className="mb-10">
          <p className="text-muted-foreground mb-1 font-mono text-xs">PRO-7 · Design system</p>
          <h1 className="text-4xl">Component library</h1>
          <p className="text-muted-foreground mt-2 max-w-prose text-base">
            Visual reference for all base tokens and components. Rendered twice — light then dark —
            to verify both palettes. Dev-only: returns 404 in production.
          </p>
        </header>

        <div className="flex flex-col gap-10">
          <Section title="Color tokens">{<SwatchGrid />}</Section>
          <Section title="Typography">{<TypographySpecimen />}</Section>
          <Section title="Button">{<ButtonMatrix />}</Section>
          <Section title="Input">{<InputMatrix />}</Section>
          <Section title="Badge">{<BadgeMatrix />}</Section>
          <Section title="Card">{<CardMatrix />}</Section>
          <Section title="Skeleton">{<SkeletonMatrix />}</Section>
        </div>
      </div>

      {/* ── Dark mode — scoped .dark wrapper, no provider needed ─────── */}
      <div className="dark bg-background text-foreground px-4 py-12 sm:px-8">
        <header className="mb-10">
          <p className="text-muted-foreground mb-1 font-mono text-xs">Dark mode</p>
          <h1 className="text-4xl">Component library</h1>
          <p className="text-muted-foreground mt-2 max-w-prose text-base">
            Same components rendered with the .dark palette. Verify contrast, focus rings, and hover
            states independently from the light theme.
          </p>
        </header>

        <div className="flex flex-col gap-10">
          <Section title="Color tokens">{<SwatchGrid />}</Section>
          <Section title="Typography">{<TypographySpecimen />}</Section>
          <Section title="Button">{<ButtonMatrix />}</Section>
          <Section title="Input">{<InputMatrix />}</Section>
          <Section title="Badge">{<BadgeMatrix />}</Section>
          <Section title="Card">{<CardMatrix />}</Section>
          <Section title="Skeleton">{<SkeletonMatrix />}</Section>
        </div>
      </div>
    </div>
  );
}
