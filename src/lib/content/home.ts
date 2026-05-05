/*
 * Home page content — centralised placeholder copy.
 *
 * All text lives here so a future "content" issue can swap it for real copy
 * without touching component files.  Each field is explicitly typed so TypeScript
 * will catch missing keys when the shape evolves.
 */

export interface WorkCase {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  /** Tailwind gradient classes applied to the thumbnail placeholder */
  gradient: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export interface HomeContent {
  hero: {
    /** Small mono label above the headline — practice type and year */
    kicker: string;
    headline: string;
    subheadline: string;
    /** Short availability note displayed beside the secondary CTA */
    valueProp: string;
    /** Secondary CTA label (outline/link — not the primary sticky CTA) */
    secondaryCta: string;
    secondaryCtaHref: string;
  };
  selectedWork: {
    sectionTitle: string;
    cases: WorkCase[];
  };
  socialProof: {
    sectionTitle: string;
    testimonial: Testimonial;
    /** Number of decorative client-logo placeholder blocks to render */
    logoCount: number;
  };
  aboutTeaser: {
    sectionTitle: string;
    bio: string;
    linkLabel: string;
    linkHref: string;
  };
  finalCta: {
    heading: string;
    /** Supporting link label (secondary, not primary) */
    linkLabel: string;
    linkHref: string;
  };
  /** Primary CTA rendered in SiteHeader (md+) and MobileCtaBar (<md) */
  primaryCta: {
    label: string;
    href: string;
  };
}

export const homeContent: HomeContent = {
  hero: {
    kicker: "Independent practice · 2026",
    headline: "Product Designer",
    subheadline:
      "Shaping product strategy alongside PMs to turn complex problems into clear, scalable products.",
    valueProp: "Available for new projects",
    secondaryCta: "View work",
    secondaryCtaHref: "/work",
  },
  selectedWork: {
    sectionTitle: "Selected work",
    cases: [
      {
        slug: "uma",
        title: "UMA",
        summary: "Brand identity and UX system for a next-generation wellness platform.",
        tags: ["Brand identity", "UX system", "Mobile"],
        gradient: "from-violet-500 to-purple-700",
      },
      {
        slug: "hello-dojo",
        title: "Hello Dojo",
        summary: "End-to-end product design for an online martial arts learning experience.",
        tags: ["Product design", "Web app", "Design system"],
        gradient: "from-orange-400 to-rose-600",
      },
    ],
  },
  socialProof: {
    sectionTitle: "Trusted by",
    testimonial: {
      quote:
        "Working with Avinro transformed how our team thinks about design. Every screen feels intentional.",
      author: "Client Name",
      role: "CEO, Company",
    },
    logoCount: 4,
  },
  aboutTeaser: {
    sectionTitle: "About",
    bio: "I'm Avinro — a product designer with a background in strategy. I help teams go from blurry problems to polished, scalable products.",
    linkLabel: "More about me",
    linkHref: "/about",
  },
  finalCta: {
    heading: "Have a project in mind?",
    linkLabel: "Let's talk",
    linkHref: "/contact",
  },
  primaryCta: {
    label: "Book a call",
    href: "/contact",
  },
};
