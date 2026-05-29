import { getTranslations } from "next-intl/server";

import { Container } from "@/components/layout/container";
import { WorkGalleryCard } from "./work-gallery-card";
import { localizeWorkCategory } from "@/lib/content/work-category";
import type { Work } from "@/lib/content/works";

interface WorkGalleryGridProps {
  works: Work[];
}

export async function WorkGalleryGrid({ works }: WorkGalleryGridProps) {
  const t = await getTranslations("work");
  return (
    <Container>
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2" aria-label={t("galleryAria")}>
        {works.map((work) => (
          <li key={work.frontmatter.slug}>
            <WorkGalleryCard
              work={work}
              categoryLabel={localizeWorkCategory(work.frontmatter.category, t)}
            />
          </li>
        ))}
      </ul>
    </Container>
  );
}
