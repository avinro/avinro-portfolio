"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

const ScrollVelocity = dynamic(
  () => import("@/components/motion/scroll-velocity").then((m) => m.ScrollVelocity),
  {
    ssr: false,
    loading: () => <div className="h-10 w-full" aria-hidden="true" />,
  },
);

interface WorkDividerProps {
  direction?: "left" | "right";
}

export function WorkDivider({ direction = "left" }: WorkDividerProps = {}) {
  const t = useTranslations("home");
  const velocity = direction === "left" ? 50 : -50;

  return (
    <div aria-hidden="true" className="overflow-hidden py-2 md:py-3">
      <ScrollVelocity
        texts={[t("workDivider.text")]}
        velocity={velocity}
        numCopies={20}
        className="text-foreground/40 font-mono text-xs tracking-widest uppercase"
        scrollerClassName=""
        parallaxClassName="py-2 md:py-2.5"
      />
    </div>
  );
}
