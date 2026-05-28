import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { z } from "zod";

const GalleryItemSchema = z
  .object({
    src: z.string().min(1),
    alt: z.string().min(1),
    caption: z.string().optional(),
    aspect: z.enum(["portrait", "square", "landscape", "wide", "natural"]).optional(),
    intrinsicWidth: z.number().int().positive().optional(),
    intrinsicHeight: z.number().int().positive().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.aspect === "natural") {
      if (data.intrinsicWidth == null) {
        ctx.addIssue({
          code: "custom",
          message: "intrinsicWidth is required when aspect is natural",
          path: ["intrinsicWidth"],
        });
      }
      if (data.intrinsicHeight == null) {
        ctx.addIssue({
          code: "custom",
          message: "intrinsicHeight is required when aspect is natural",
          path: ["intrinsicHeight"],
        });
      }
    }
  });

export type GalleryItem = z.infer<typeof GalleryItemSchema>;

const WorkProjectMetaSchema = z
  .object({
    type: z.string().min(1).optional(),
    industry: z.string().min(1).optional(),
    platform: z.string().min(1).optional(),
    status: z.string().min(1).optional(),
    role: z.string().min(1).optional(),
    yearLabel: z.string().min(1).optional(),
  })
  .default({});

export type WorkProjectMeta = z.infer<typeof WorkProjectMetaSchema>;

const WorkFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  year: z.number().int().min(2000).max(2100),
  category: z.enum([
    "UI exploration",
    "Concept",
    "Visual system",
    "Mobile UI",
    "Flow Improvement",
    "UX Redesign",
    "Branding",
    "Microinteraction",
  ]),
  summary: z.string().min(1).max(180),
  coverImage: z.string().min(1),
  resultImage: z.string().min(1).optional(),
  coverAspect: z.enum(["portrait", "square", "landscape"]).default("portrait"),
  gallery: z.array(GalleryItemSchema).max(20).default([]),
  tools: z.array(z.string()).max(8).default([]),
  client: z.string().optional(),
  meta: WorkProjectMetaSchema,
  externalLink: z.url().optional(),
  tags: z.array(z.string()).max(6).default([]),
  order: z.number().int(),
  featuredOrder: z.number().int().optional(),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
});

export type WorkFrontmatter = z.infer<typeof WorkFrontmatterSchema>;

export interface Work {
  frontmatter: WorkFrontmatter;
  content: string;
  readingTime: {
    text: string;
    minutes: number;
    words: number;
  };
}

const CONTENT_ROOT = path.join(process.cwd(), "content", "works");

function contentDir(locale: string): string {
  return path.join(CONTENT_ROOT, locale);
}

function readAllWorkFiles(locale: string): Work[] {
  const dir = contentDir(locale);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const { data, content } = matter(raw);

    const result = WorkFrontmatterSchema.safeParse(data);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `  ${i.path.join(".")}: ${i.message}`)
        .join("\n");
      throw new Error(`Invalid frontmatter in content/works/${locale}/${file}:\n${issues}`);
    }

    const rt = readingTime(content);

    return {
      frontmatter: result.data,
      content,
      readingTime: {
        text: rt.text,
        minutes: rt.minutes,
        words: rt.words,
      },
    };
  });
}

const _cache = new Map<string, Work[]>();

function getAll(locale = "en"): Work[] {
  if (!_cache.has(locale)) {
    _cache.set(
      locale,
      readAllWorkFiles(locale).sort((a, b) => a.frontmatter.order - b.frontmatter.order),
    );
  }
  return _cache.get(locale) ?? [];
}

export function getAllWorks(locale = "en"): Work[] {
  return getAll(locale);
}

export function getPublishedWorks(locale = "en"): Work[] {
  return getAll(locale).filter((w) => !w.frontmatter.draft);
}

export function getWorkBySlug(slug: string, locale = "en"): Work | undefined {
  return getAll(locale).find((w) => w.frontmatter.slug === slug);
}

export interface PublishedWorkNeighbors {
  prev: Work | null;
  next: Work | null;
}

export function getPublishedWorkNeighbors(slug: string, locale = "en"): PublishedWorkNeighbors {
  const published = getPublishedWorks(locale);
  const idx = published.findIndex((w) => w.frontmatter.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? published[idx - 1] : null,
    next: idx < published.length - 1 ? published[idx + 1] : null,
  };
}

export function getWorkSlugs(locale = "en"): string[] {
  return getAll(locale).map((w) => w.frontmatter.slug);
}

export interface WorkSitemapEntry {
  slug: string;
  lastModified: Date;
}

export function getPublishedWorksForSitemap(locale = "en"): WorkSitemapEntry[] {
  const dir = contentDir(locale);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data } = matter(raw);
      const result = WorkFrontmatterSchema.safeParse(data);
      if (!result.success || result.data.draft) return null;
      const mtime = fs.statSync(path.join(dir, file)).mtime;
      return { slug: result.data.slug, lastModified: mtime };
    })
    .filter((entry): entry is WorkSitemapEntry => entry !== null);
}
