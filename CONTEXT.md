# avinro-portfolio — Context Document

## Project Identity

**Owner:** Ary Vincench (Avinro)  
**Email:** avinroart@gmail.com  
**Title:** Product Designer  
**Location:** Madrid, Spain  
**Type:** Personal portfolio website  
**URL:** https://www.avinro.com  
**Status:** Active (ongoing updates)

---

## Purpose

Personal portfolio showcasing:

- Case studies of shipped products and design work
- Design explorations and visual system projects
- Professional background and expertise
- CV and career narrative

The site serves as:

1. **Professional portfolio** — case studies for client/job opportunities
2. **Design system showcase** — demonstrating design-to-code capabilities
3. **Thought leadership** — documenting design decisions and approaches

---

## About Avinro (Ary Vincench)

**Product Designer** with 9+ years of experience designing and shipping **SaaS and multi-sided platforms**.

### Core Expertise

- Product Strategy & Product Management
- UX Architecture & Interaction Design
- Design Systems & Component Architecture
- Front-End Execution (hands-on)
- AI-assisted Product Workflows
- Zero-to-one products and fast-moving environments
- Multi-sided platforms and complex ecosystems

### Current Role

**helloDojo — Product Design Engineer Lead** (Mar 2026 – Present)

- End-to-end product ownership across multi-product ecosystem
- Customer App, Vendor Portal, Driver App, Fleet Manager
- Defining core product areas: rides, bookings, availability, payments
- Design System direction and implementation
- AI-assisted development workflows to reduce design-code gaps

### Previous Experience

- **110 Theory** — Senior Product Designer (Mar 2023 – Nov 2025)
  - Baptist Health mobile app, Smart TV interfaces, hospital systems
- **Alyssum Digital** — Product Designer (Nov 2022 – May 2023)
- **G Estudios Multimedia** — UI/UX & Branding Designer (May 2022 – Oct 2022)
- **Union of Journalists of Cuba** — Branding & Motion Designer (Jan 2018 – Jan 2021)

### Education

**University of Havana, Cuba** — BA Visual Communication Design (2012–2018)

---

## Tech Stack

| Layer              | Technology                               |
| ------------------ | ---------------------------------------- |
| **Framework**      | Next.js 16 (App Router)                  |
| **Language**       | TypeScript 5 (strict mode)               |
| **Styling**        | Tailwind CSS v4 + shadcn/ui (radix-nova) |
| **Typography**     | Geist Sans + Geist Mono (next/font)      |
| **Animation**      | GSAP 3.15 + Lenis (smooth scroll)        |
| **Content CMS**    | MDX filesystem (case-studies, works)     |
| **Analytics**      | PostHog (cookieless)                     |
| **AI Integration** | Gemini 2.0 Flash Lite (Vercel AI SDK)    |
| **Testing**        | Vitest                                   |
| **Deployment**     | Vercel                                   |
| **Runtime**        | Node.js ≥ 24                             |

---

## Project Content

### Case Studies

Real projects and shipped products:

| Project                      | Client         | Role                    | Year | Status          |
| ---------------------------- | -------------- | ----------------------- | ---- | --------------- |
| **helloDojo — Customer App** | helloDojo      | Product Design Engineer | 2026 | TestFlight Beta |
| **UMA**                      | (Confidential) | Product Designer        | 2025 | Shipped         |

**Case Study Details:**

- Full design process and rationale
- Product strategy and UX decisions
- System design and architecture
- Implementation and technical constraints
- Results and impact metrics

### Design Explorations (Works)

Personal projects and visual system explorations:

| Project        | Category                  | Year | Platform              |
| -------------- | ------------------------- | ---- | --------------------- |
| **BlockBind**  | Visual System / Mobile UI | 2024 | iOS & Android concept |
| **DomainPlug** | Interaction design        | 2024 | Web                   |
| **Deks**       | Design exploration        | 2023 | Multi-platform        |
| **PineApp**    | UI exploration            | 2023 | Web                   |

These showcase:

- Visual design capabilities
- Component and system thinking
- Interaction design exploration
- Design tool mastery (Figma)

### Additional Pages

- **About** — Professional background and approach
- **Privacy** — Privacy policy
- **Dev** — (Development/notes section)

---

## Architecture

### Route Structure

```
src/app/(site)/
├── page.tsx              # Home / portfolio grid
├── layout.tsx            # Site layout (header, footer, CTA)
├── template.tsx          # Page transitions (GSAP)
├── about/page.tsx        # About page
├── privacy/page.tsx      # Privacy policy
├── case-studies/
│   └── [slug]/page.tsx   # Dynamic case study pages
└── work/
    └── [slug]/page.tsx   # Dynamic work/exploration pages
```

### Content Layer (MDX File-System CMS)

**Case Studies:** `content/case-studies/*.mdx`

- Structured frontmatter (title, slug, client, role, year, coverage, outcome, KPIs)
- Markdown body with MDX components
- Images and media assets organized per project

**Works/Explorations:** `content/works/*.mdx`

- Similar structure, lighter frontmatter
- Visual system documentation
- Design exploration process

**CV:** `content/Ary_Vincench_CV.md`

- Professional background
- Work history
- Skills and tools
- Languages

### Component Architecture

```
src/components/
├── ui/                  # shadcn/ui primitives
├── layout/              # Container, Section, Grid
├── motion/              # GSAP animations (page transitions)
├── site/                # Marketing chrome (header, footer, CTAs)
├── work/                # Work grid, gallery components
├── case-study/          # Case study layout (sidebar TOC, body, related)
├── mdx/                 # MDX component map (Figure, Stats, etc.)
└── analytics/           # PostHog integration

src/lib/
├── content/             # MDX readers & content layer
├── mdx/                 # MDX pipeline (rehype, remark plugins)
├── analytics/           # Event tracking
└── utils.ts             # Helper functions
```

### Design System (Tailwind v4)

All tokens defined in `src/app/globals.css`:

- **Colors:** OKLCH color space, light/dark modes
- **Typography:** Type scale, font families
- **Spacing:** Consistent spacing system
- **Layout:** Breakpoints and responsive utilities
- **Animation:** Custom timing functions for GSAP

---

## Content Strategy

### Case Studies

Each case study demonstrates:

- **Problem Statement** — What were we solving?
- **Process** — How did we approach it?
- **Design Decisions** — Key choices and rationale
- **System & Components** — Design system applied
- **Results & Impact** — Outcomes and metrics
- **Visual Documentation** — Figures, before/afters, visual systems

**Frontmatter Contract:**

```yaml
title: Project Name
slug: project-slug
client: Client Name
role: Your Role
year: 2026
coverage:
  - product strategy
  - ux architecture
  - design system
outcome: "Brief summary of what was shipped"
coverImage: /case-studies/project/cover.jpg
summary: "Extended summary for grid previews"
gradient: from-orange-400 to-rose-600
featured: true
kpis:
  - value: "3"
    label: Key metric
```

### SEO & Metadata

- Sitemap: `src/app/sitemap.ts`
- Robots: `src/app/robots.ts`
- OG images: Colocated `opengraph-image.tsx` per route
- Metadata: Dynamic per page (layout.tsx)

---

## Code Conventions

### ✅ Enforced Rules

1. **Mobile-First CSS** — Base classes target 375px; breakpoints scale upward
2. **English Comments** — All comments in English, concise and purpose-driven
3. **Conventional Commits** — Format: `<type>(<scope>): <subject>`
4. **Strict TypeScript** — No `// @ts-ignore`, strict mode enforced
5. **No Secrets** — Only `.env.local.example` committed, no real credentials
6. **Component Isolation** — Components always inside Sections/Frames, never on blank canvas

### UI/CTA Pattern

- **SiteHeader** and **MobileCtaBar** — Only elements with `variant="default"` (filled buttons)
- **In-page CTAs** — Use `variant="outline"` or text links only
- **Single CTA contract** — Prevents visual hierarchy chaos

### Animation Guidelines

- GSAP for page transitions and scroll-triggered animations
- Lenis for smooth scrolling (provider wraps ScrollTrigger usage)
- All motion components SSR-safe, respect `prefers-reduced-motion`
- Loaded via `next/dynamic({ ssr: false })` to prevent hydration issues

### Analytics Pattern

**Click Delegator** — Single `document` listener reads `data-cta-*` attributes:

```tsx
<button data-cta-name="contact" data-cta-location="hero">
  Contact
</button>
```

**Typed Events** — Use discriminated union from `src/lib/analytics/events.ts`:

```ts
// Never raw posthog.capture()
trackEvent({ type: "case-study-opened", project: "hello-dojo" });
```

---

## Development Workflow

### Commands

```bash
# Setup
npm install

# Development
npm run dev              # Next.js dev (Turbopack)
npm run build           # Production build
npm run start           # Production server

# Code Quality
npm run typecheck       # TypeScript check
npm run lint            # ESLint
npm run lint:fix        # ESLint with --fix
npm run format          # Prettier write
npm run format:check    # Prettier check

# Testing
npm run test            # Vitest (run once)
npm run test:watch      # Vitest (watch mode)

# Performance
npm run lighthouse:preview  # Lighthouse audit

# Brand Assets
npm run generate:brand-assets  # Generate from config
```

### Environment Setup

Copy `.env.local.example` to `.env.local`:

| Variable                   | Purpose          | Required |
| -------------------------- | ---------------- | -------- |
| `NEXT_PUBLIC_POSTHOG_KEY`  | Analytics        | ✅       |
| `NEXT_PUBLIC_POSTHOG_HOST` | Analytics ingest | ✅       |
| `GEMINI_API_KEY`           | AI features      | ❌       |
| `NEXT_PUBLIC_AI_ENABLED`   | Enable AI        | ❌       |

### Adding New Case Studies

1. Create new file: `content/case-studies/project-slug.mdx`
2. Add frontmatter with required fields (title, slug, client, role, year, etc.)
3. Write markdown with MDX components (`<Figure />`, `<Stats />`, etc.)
4. Add images to `public/case-studies/project-slug/`
5. Static generation happens automatically via `[slug]/page.tsx`

### Adding New Works

1. Create `content/works/project-slug.mdx`
2. Simpler frontmatter (category, platform, status, etc.)
3. Markdown with visual documentation
4. Images to `public/works/project-slug/`

---

## Deployment

| Target         | Branch | URL                |
| -------------- | ------ | ------------------ |
| **Production** | `main` | https://avinro.com |
| **Preview**    | Any PR | `*.vercel.app`     |

- **Security headers** declared in `vercel.json` (HSTS, CSP, etc.)
- **Preview deploys** automatic for every PR
- **Production** triggered only by `main` pushes

---

## Git & Version Control

- **Repository:** Git (GitHub)
- **Branch format:** Conventional (feature/, fix/, docs/, etc.)
- **Commits:** Enforced by commitlint (`commitlint` + `husky`)
- **Pre-commit hooks:** Lint-staged (ESLint + Prettier)

---

## Performance Targets

- **Lighthouse** — Mobile: 90+, Desktop: 95+
- **Core Web Vitals** — LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Image optimization** — Next.js `<Image />` with `sharp`
- **Code splitting** — GSAP/motion components lazy-loaded

---

## Tools & Stack

### Design & Tools

- **Figma** — Design source of truth
- **Cursor** — AI-assisted code editing
- **Illustrator** — Vector design
- **Photoshop** — Image editing
- **After Effects** — Motion design

### Development Tools

- **VS Code / IDE** — Code editing
- **Next.js 16** — Framework
- **TypeScript** — Language
- **Tailwind CSS v4** — Styling
- **Vitest** — Testing
- **Linear** — Issue tracking
- **GitHub** — Version control

---

## Next Steps & Roadmap

### Current Priority

- Expand case study documentation (helloDojo, UMA)
- Refine visual hierarchy and information architecture
- Optimize performance (Lighthouse, Core Web Vitals)
- Expand design explorations (Works section)

### Future Enhancements

- Interactive design system showcase
- Live component library
- Blog/articles on design thinking
- Client testimonials section
- Contact/collaboration inquiry form

---

## Notes for Contributors & AI Agents

1. **Portfolio First** — All changes should enhance the portfolio, not distract
2. **Case Study Integrity** — Don't oversimplify complex design decisions
3. **Visual Consistency** — Designs reflect Avinro's own visual standards
4. **Performance Critical** — Portfolio is a design tool; performance matters
5. **Mobile Experience** — Test thoroughly on mobile (reflects design expertise)
6. **Content Authenticity** — All text and imagery must be accurate and current
7. **Accessibility** — All case studies must be perceivable and usable by all

---

**Last Updated:** 2026-05-25  
**Owner:** Ary Vincench (Avinro)  
**Repository:** `/Users/avinro/avinro-workspace/avinro-portfolio/`
