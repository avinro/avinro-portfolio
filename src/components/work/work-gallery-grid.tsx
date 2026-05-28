import { Container } from "@/components/layout/container";
import { WorkGalleryCard } from "./work-gallery-card";
import type { Work } from "@/lib/content/works";

interface WorkGalleryGridProps {
  works: Work[];
}

export function WorkGalleryGrid({ works }: WorkGalleryGridProps) {
  return (
    <Container>
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2" aria-label="Visual work">
        {works.map((work) => (
          <li key={work.frontmatter.slug}>
            <WorkGalleryCard work={work} />
          </li>
        ))}
      </ul>
    </Container>
  );
}
