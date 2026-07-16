export interface WorkCase {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  gradient: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
}

export interface AboutImage {
  src: string;
  alt: string;
}

export interface HomeContent {
  intro: {
    phrase1: { mobile: string; desktop: string };
    phrase2: string;
  };
  hero: {
    badgeText: string;
    headline: string;
    subheadline: string;
    circularText: string;
    circularTextHover: string;
    primaryCta: string;
    primaryCtaHref: string;
    downloadCta: string;
    downloadCtaHref: string;
    profileImageSrc: string;
  };
  workDivider: {
    text: string;
  };
  selectedWork: {
    sectionTitle: string;
    body: string;
  };
  socialProof: {
    sectionTitle: string;
    testimonial: Testimonial;
    logoCount: number;
  };
  aboutTeaser: {
    sectionTitle: string;
    greeting: string;
    bio: string;
    linkLabel: string;
    linkHref: string;
  };
  finalCta: {
    heading: string;
    linkLabel: string;
    linkHref: string;
  };
  primaryCta: {
    label: string;
    href: string;
  };
  aboutImages: AboutImage[];
}

export const homeContent: HomeContent = {
  intro: {
    phrase1: {
      mobile: "Most ideas die\nbetween\nvision and execution.",
      desktop: "Most ideas die\nbetween vision and execution.",
    },
    phrase2: "I close that gap.",
  },
  hero: {
    badgeText: "Open to Work",
    headline: "Product Designer shipping vision into reality",
    subheadline:
      "I've shipped SaaS products for B2B and B2C teams — from 0→1 discovery to launch. Most projects fail between idea and execution; I help close that gap.",
    circularText: "Strategy & execution · Product design · ",
    circularTextHover: "Get to know me · My Background · ",
    primaryCta: "Explore my work",
    primaryCtaHref: "/work",
    downloadCta: "Download CV",
    downloadCtaHref: "/AryVincench_CV_2026.pdf",
    profileImageSrc: "/images/pfp.jpg",
  },
  workDivider: {
    text: "SELECTED WORK \u2022 ",
  },
  selectedWork: {
    sectionTitle: "Selected work",
    body: "A selection of 0→1 products and multi-app systems. Each one started as an unclear idea — and ended up shipped.",
  },
  socialProof: {
    sectionTitle: "Testimonials",
    testimonial: {
      quote:
        "Working with Ary didn't just improve our product — it helped us define it. The result is something we could actually ship and scale.",
      author: "Client Name",
      role: "CEO, Company",
    },
    logoCount: 4,
  },
  aboutTeaser: {
    sectionTitle: "About",
    greeting: "Hey, I'm Ary",
    bio: "Designer, builder, problem solver. Outside of work, probably traveling, working out, watching anime, or spending time with people I care about.",
    linkLabel: "More about me",
    linkHref: "/about",
  },
  finalCta: {
    heading: "Have something you're trying to build — but not sure how to structure or ship it?",
    linkLabel: "Let's talk",
    linkHref: "/contact",
  },
  primaryCta: {
    label: "Let's talk",
    href: "/contact",
  },
  aboutImages: [
    { src: "/about/lifestyle/01.webp", alt: "" },
    { src: "/about/lifestyle/02.webp", alt: "" },
    { src: "/about/lifestyle/03.webp", alt: "" },
    { src: "/about/lifestyle/04.webp", alt: "" },
    { src: "/about/lifestyle/05.webp", alt: "" },
    { src: "/about/lifestyle/06.webp", alt: "" },
    { src: "/about/lifestyle/07.webp", alt: "" },
    { src: "/about/lifestyle/09.webp", alt: "" },
    { src: "/about/lifestyle/10.webp", alt: "" },
  ],
};
