/**
 * Restricted MDX component map for work (visual explorations) pages.
 *
 * Intentionally omits case-study-specific primitives so authors cannot
 * accidentally add narrative complexity to the visual-first format:
 *   - No Stats / KPI blocks
 *   - No FlowChain / FlowSplit / StateGrid / PrincipleGrid / BranchTree
 *   - No MermaidDiagram
 *   - No BeforeAfter / Bar
 *
 * What is allowed: prose typography, links, inline code, and simple images.
 * The gallery itself is rendered from frontmatter, not MDX.
 */

import Image from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import type { MDXComponents } from "mdx/types";
import { cn } from "@/lib/utils";

function P({ className, ...props }: ComponentPropsWithoutRef<"p">) {
  return (
    <p
      className={cn("text-foreground/90 mb-5 text-base leading-relaxed sm:text-lg", className)}
      {...props}
    />
  );
}

function A({ href = "", className, children, ...props }: ComponentPropsWithoutRef<"a">) {
  const isExternal = href.startsWith("http");

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={cn(
          "text-accent decoration-accent/40 hover:decoration-accent focus-visible:ring-ring rounded-sm underline underline-offset-4 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "text-accent decoration-accent/40 hover:decoration-accent focus-visible:ring-ring rounded-sm underline underline-offset-4 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

function Ul({ className, ...props }: ComponentPropsWithoutRef<"ul">) {
  return (
    <ul
      className={cn(
        "text-foreground/90 mb-5 ml-5 list-disc space-y-1.5 text-base sm:text-lg",
        className,
      )}
      {...props}
    />
  );
}

function Ol({ className, ...props }: ComponentPropsWithoutRef<"ol">) {
  return (
    <ol
      className={cn(
        "text-foreground/90 mb-5 ml-5 list-decimal space-y-1.5 text-base sm:text-lg",
        className,
      )}
      {...props}
    />
  );
}

function Li({ className, ...props }: ComponentPropsWithoutRef<"li">) {
  return <li className={cn("leading-relaxed", className)} {...props} />;
}

function Code({ className, ...props }: ComponentPropsWithoutRef<"code">) {
  return (
    <code
      className={cn(
        "bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]",
        className,
      )}
      {...props}
    />
  );
}

function Strong({ className, ...props }: ComponentPropsWithoutRef<"strong">) {
  return <strong className={cn("font-semibold", className)} {...props} />;
}

function Em({ className, ...props }: ComponentPropsWithoutRef<"em">) {
  return <em className={cn("italic", className)} {...props} />;
}

function Img({ src, alt = "", width, height }: ComponentPropsWithoutRef<"img">) {
  if (typeof src !== "string" || !src) return null;
  return (
    <span className="my-4 block">
      <Image
        src={src}
        alt={alt}
        width={typeof width === "string" ? parseInt(width, 10) : (width ?? 1200)}
        height={typeof height === "string" ? parseInt(height, 10) : (height ?? 630)}
        className="rounded-lg"
        loading="lazy"
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 800px"
      />
    </span>
  );
}

export const workMdxComponents: MDXComponents = {
  p: P,
  a: A,
  ul: Ul,
  ol: Ol,
  li: Li,
  code: Code,
  strong: Strong,
  em: Em,
  img: Img,
};
