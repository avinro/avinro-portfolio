import type { CompileOptions } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import type { Options as PrettyCodeOptions } from "rehype-pretty-code";
import { remarkMermaidToComponent } from "./remark-mermaid";

const prettyCodeOptions: PrettyCodeOptions = {
  theme: {
    light: "github-light",
    dark: "github-dark",
  },
  keepBackground: false,
};

const autolinkOptions = {
  behavior: "append" as const,
  properties: {
    className: [
      "ml-2",
      "opacity-0",
      "transition-opacity",
      "focus-visible:opacity-100",
      "focus-visible:outline-none",
      "focus-visible:ring-2",
      "focus-visible:ring-ring",
      "focus-visible:ring-offset-2",
      "rounded-sm",
      "inline-flex",
      "items-center",
      "justify-center",
      "min-h-[44px]",
      "min-w-[44px]",
      "text-muted-foreground",
      "hover:text-foreground",
      "no-underline",
    ],
    "aria-label": "Link to this section",
  },
  content: {
    type: "element",
    tagName: "span",
    properties: { "aria-hidden": "true" },
    children: [{ type: "text", value: "#" }],
  },
};

import type { Pluggable } from "unified";

const compileMdxOptions: CompileOptions = {
  remarkPlugins: [remarkGfm, remarkMermaidToComponent],
  rehypePlugins: [
    [rehypePrettyCode, prettyCodeOptions] as Pluggable,
    rehypeSlug as Pluggable,
    [rehypeAutolinkHeadings, autolinkOptions] as Pluggable,
  ],
};

export const mdxOptions = {
  mdxOptions: compileMdxOptions,
  /**
   * Preserve JSX attribute expressions in MDX (e.g. `width={1920}` on <Figure>).
   * next-mdx-remote defaults to `blockJS: true`, which runs `removeJavaScriptExpressions`
   * and strips those attributes — figures then lose intrinsic dimensions and fall back
   * to fill + default 16/9 aspect. Content is trusted (repo-owned MDX only).
   */
  blockJS: false,
};
