"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface MermaidDiagramProps {
  source: string;
  className?: string;
}

function extractLabel(src: string): string {
  const match = /%%\s*(.+)/.exec(src);
  return match ? match[1].trim() : "Diagram";
}

type MermaidRenderResult = { svg: string } | { bindFunctions?: (el: Element) => void; svg: string };

export function MermaidDiagram({ source, className }: MermaidDiagramProps) {
  const t = useTranslations("mdx");
  const decoded = Buffer.from(source, "base64").toString("utf-8");
  const label = extractLabel(decoded);
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const { default: mermaid } = await import("mermaid");

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          ...(prefersReducedMotion ? { flowchart: { useMaxWidth: true } } : {}),
          securityLevel: "strict",
        });

        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const result: MermaidRenderResult = await mermaid.render(id, decoded);

        if (!cancelled) {
          setSvg(result.svg);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Diagram error");
        }
      }
    }

    void render();
    return () => {
      cancelled = true;
    };
  }, [decoded]);

  if (error) {
    return (
      <div
        role="img"
        aria-label={label}
        className={cn(
          "border-destructive/30 bg-destructive/5 text-destructive rounded border p-4 font-mono text-sm",
          className,
        )}
      >
        <p className="font-semibold">Diagram error</p>
        <pre className="mt-1 text-xs whitespace-pre-wrap">{error}</pre>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative my-8", className)}>
      <pre className="sr-only">{decoded}</pre>

      {svg ? (
        <div
          role="img"
          aria-label={label}
          dangerouslySetInnerHTML={{ __html: svg }}
          className="overflow-x-auto"
        />
      ) : (
        <div
          aria-busy="true"
          aria-label={t("loadingDiagram")}
          className="bg-muted animate-pulse rounded"
          style={{ aspectRatio: "16 / 5", minHeight: "120px" }}
        />
      )}
    </div>
  );
}
