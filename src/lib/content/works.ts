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

const CONTENT_DIR = path.join(process.cwd(), "content", "works");

function readAllWorkFiles(): Work[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
    const { data, content } = matter(raw);

    const result = WorkFrontmatterSchema.safeParse(data);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `  ${i.path.join(".")}: ${i.message}`)
        .join("\n");
      throw new Error(`Invalid frontmatter in content/works/${file}:\n${issues}`);
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

let _cache: Work[] | null = null;

function getAll(): Work[] {
  _cache ??= readAllWorkFiles().sort((a, b) => a.frontmatter.order - b.frontmatter.order);
  return _cache;
}

export function getAllWorks(): Work[] {
  return getAll();
}

export function getPublishedWorks(): Work[] {
  return getAll().filter((w) => !w.frontmatter.draft);
}

export function getWorkBySlug(slug: string): Work | undefined {
  return getAll().find((w) => w.frontmatter.slug === slug);
}

export interface PublishedWorkNeighbors {
  prev: Work | null;
  next: Work | null;
}

export function getPublishedWorkNeighbors(slug: string): PublishedWorkNeighbors {
  const published = getPublishedWorks();
  const idx = published.findIndex((w) => w.frontmatter.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? published[idx - 1] : null,
    next: idx < published.length - 1 ? published[idx + 1] : null,
  };
}

export function getWorkSlugs(): string[] {
  return getAll().map((w) => w.frontmatter.slug);
}

export interface WorkSitemapEntry {
  slug: string;
  lastModified: Date;
}

export function getPublishedWorksForSitemap(): WorkSitemapEntry[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
      const { data } = matter(raw);
      const result = WorkFrontmatterSchema.safeParse(data);
      if (!result.success || result.data.draft) return null;
      const mtime = fs.statSync(path.join(CONTENT_DIR, file)).mtime;
      return { slug: result.data.slug, lastModified: mtime };
    })
    .filter((entry): entry is WorkSitemapEntry => entry !== null);
}
