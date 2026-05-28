import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { z } from "zod";

const KpiSchema = z
  .object({
    value: z.string().min(1).optional(),
    label: z.string().min(1),
    sublabel: z.string().optional(),
    delta: z.object({ from: z.string().min(1), to: z.string().min(1) }).optional(),
    sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
  })
  .refine((k) => k.value !== undefined || k.delta !== undefined, {
    message: "kpi must have either `value` or `delta`",
  });

export type KpiItem = z.infer<typeof KpiSchema>;

const CaseStudyFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  client: z.string().min(1),
  role: z.string().min(1),
  year: z.number().int().min(2000).max(2100),
  coverage: z.array(z.string()).min(1),
  outcome: z.string().min(1),
  coverImage: z.string().min(1),
  hoverImage: z.string().min(1).optional(),
  order: z.number().int().min(1),
  summary: z.string().min(1),
  tags: z.array(z.string()).min(1),
  gradient: z.string().min(1),
  draft: z.boolean().optional().default(false),
  featured: z.boolean().optional().default(false),
  sector: z.string().min(1),
  softwareType: z.string().min(1),
  kpis: z.array(KpiSchema).max(6).optional(),
});

export type CaseStudyFrontmatter = z.infer<typeof CaseStudyFrontmatterSchema>;

export interface CaseStudy {
  frontmatter: CaseStudyFrontmatter;
  content: string;
  readingTime: {
    text: string;
    minutes: number;
    words: number;
  };
}

const CONTENT_DIR = path.join(process.cwd(), "content", "case-studies");

function readAllCaseStudyFiles(): CaseStudy[] {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
    const { data, content } = matter(raw);

    const result = CaseStudyFrontmatterSchema.safeParse(data);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `  ${i.path.join(".")}: ${i.message}`)
        .join("\n");
      throw new Error(`Invalid frontmatter in content/case-studies/${file}:\n${issues}`);
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

let _cache: CaseStudy[] | null = null;

function getAll(): CaseStudy[] {
  _cache ??= readAllCaseStudyFiles().sort((a, b) => a.frontmatter.order - b.frontmatter.order);
  return _cache;
}

export function getAllCaseStudies(): CaseStudy[] {
  return getAll();
}

export function getPublishedCaseStudies(): CaseStudy[] {
  return getAll().filter((cs) => !cs.frontmatter.draft);
}

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return getAll().find((cs) => cs.frontmatter.slug === slug);
}

export function getCaseStudySlugs(): string[] {
  return getAll().map((cs) => cs.frontmatter.slug);
}

export interface CaseStudySitemapEntry {
  slug: string;
  lastModified: Date;
}

export function getPublishedCaseStudiesForSitemap(): CaseStudySitemapEntry[] {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
      const { data } = matter(raw);
      const result = CaseStudyFrontmatterSchema.safeParse(data);
      if (!result.success || result.data.draft) return null;
      const mtime = fs.statSync(path.join(CONTENT_DIR, file)).mtime;
      return { slug: result.data.slug, lastModified: mtime };
    })
    .filter((entry): entry is CaseStudySitemapEntry => entry !== null);
}
