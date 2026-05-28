"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

import type { Testimonial } from "@/lib/content/testimonials";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

const PIXELS_PER_SECOND = 40;

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
  total: number;
  decorative?: boolean;
}

function TestimonialCard({ testimonial, index, total, decorative }: TestimonialCardProps) {
  const fullName = `${testimonial.firstName} ${testimonial.lastName}`;

  return (
    <article
      role={decorative ? undefined : "group"}
      aria-roledescription={decorative ? undefined : "slide"}
      aria-label={
        decorative ? undefined : `Testimonial ${String(index + 1)} of ${String(total)}: ${fullName}`
      }
      aria-hidden={decorative ? true : undefined}
      className="w-[70vw] flex-shrink-0 sm:w-[400px] lg:w-[360px]"
    >
      <div className="border-border/40 flex h-full flex-col gap-6 rounded-xl border p-6 sm:p-8">
        <blockquote>
          <p
            className="text-foreground text-base leading-relaxed text-balance sm:text-lg"
            lang={testimonial.quoteLang}
          >
            &ldquo;{testimonial.quote}&rdquo;
          </p>
        </blockquote>
        <figcaption className="mt-auto flex items-center gap-3">
          {testimonial.avatar && (
            <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
              <Image
                src={testimonial.avatar}
                alt={fullName}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex flex-col gap-[4px]">
            {testimonial.linkedInUrl ? (
              <a
                href={testimonial.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring text-foreground w-fit max-w-full rounded-sm text-sm font-medium underline-offset-2 hover:underline"
              >
                {fullName}
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            ) : (
              <span className="text-foreground text-sm font-medium">{fullName}</span>
            )}
            <span className="text-muted-foreground font-mono text-xs tracking-wider uppercase">
              {testimonial.role} · {testimonial.company}
            </span>
          </div>
        </figcaption>
      </div>
    </article>
  );
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

export function TestimonialsCarousel({ testimonials: items }: TestimonialsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const speedRef = useRef(1);
  const offsetRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      offsetRef.current -= PIXELS_PER_SECOND * speedRef.current * dt;

      const halfWidth = track.scrollWidth / 2;
      if (offsetRef.current <= -halfWidth) {
        offsetRef.current += halfWidth;
      }

      track.style.transform = `translateX(${String(offsetRef.current)}px)`;

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleMouseEnter = () => {
    speedRef.current = 0.1;
  };
  const handleMouseLeave = () => {
    speedRef.current = 1;
  };

  if (!items.length) return null;

  return (
    <Section>
      <Container>
        <p className="text-muted-foreground w-full text-center font-mono text-xs tracking-[0.15em] uppercase">
          Testimonials
        </p>
        <div
          className="relative -mx-4 mt-8 overflow-hidden sm:-mx-6 lg:-mx-8"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            aria-hidden="true"
            className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r to-transparent sm:w-24"
          />
          <div
            aria-hidden="true"
            className="from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l to-transparent sm:w-24"
          />
          <div
            ref={trackRef}
            role="region"
            aria-label="Client testimonials"
            aria-roledescription="carousel"
            className="flex w-max gap-4 sm:gap-6"
          >
            {items.map((t, i) => (
              <TestimonialCard key={t.id} testimonial={t} index={i} total={items.length} />
            ))}
            {items.map((t) => (
              <TestimonialCard
                key={`${t.id}-dupe`}
                testimonial={t}
                index={0}
                total={0}
                decorative
              />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
