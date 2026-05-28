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

const CONTENT_ROOT = path.join(process.cwd(), "content", "case-studies");

function contentDir(locale: string): string {
  return path.join(CONTENT_ROOT, locale);
}

function readAllCaseStudyFiles(locale: string): CaseStudy[] {
  const dir = contentDir(locale);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const { data, content } = matter(raw);

    const result = CaseStudyFrontmatterSchema.safeParse(data);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `  ${i.path.join(".")}: ${i.message}`)
        .join("\n");
      throw new Error(`Invalid frontmatter in content/case-studies/${locale}/${file}:\n${issues}`);
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

const _cache = new Map<string, CaseStudy[]>();

function getAll(locale = "en"): CaseStudy[] {
  if (!_cache.has(locale)) {
    _cache.set(
      locale,
      readAllCaseStudyFiles(locale).sort((a, b) => a.frontmatter.order - b.frontmatter.order),
    );
  }
  return _cache.get(locale) ?? [];
}

export function getAllCaseStudies(locale = "en"): CaseStudy[] {
  return getAll(locale);
}

export function getPublishedCaseStudies(locale = "en"): CaseStudy[] {
  return getAll(locale).filter((cs) => !cs.frontmatter.draft);
}

export function getCaseStudyBySlug(slug: string, locale = "en"): CaseStudy | undefined {
  return getAll(locale).find((cs) => cs.frontmatter.slug === slug);
}

export function getCaseStudySlugs(locale = "en"): string[] {
  return getAll(locale).map((cs) => cs.frontmatter.slug);
}

export interface CaseStudySitemapEntry {
  slug: string;
  lastModified: Date;
}

export function getPublishedCaseStudiesForSitemap(locale = "en"): CaseStudySitemapEntry[] {
  const dir = contentDir(locale);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data } = matter(raw);
      const result = CaseStudyFrontmatterSchema.safeParse(data);
      if (!result.success || result.data.draft) return null;
      const mtime = fs.statSync(path.join(dir, file)).mtime;
      return { slug: result.data.slug, lastModified: mtime };
    })
    .filter((entry): entry is CaseStudySitemapEntry => entry !== null);
}
