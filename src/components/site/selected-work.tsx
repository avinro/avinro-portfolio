import { homeContent } from "@/lib/content/home";
import { Container } from "@/components/layout/container";
import { Grid, GridItem } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { WorkCard } from "./work-card";

/*
 * SelectedWork — 2-column case study grid.
 *
 * Grid layout: single column on mobile, 6/6 on lg+ (two equal columns).
 * The Grid component from PRO-12 handles the 12-col breakpoint logic.
 */
export function SelectedWork() {
  const { selectedWork } = homeContent;

  return (
    <Section>
      <Container>
        <div className="flex flex-col gap-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {selectedWork.sectionTitle}
          </h2>

          <Grid gap="default">
            {selectedWork.cases.map((case_) => (
              <GridItem key={case_.slug} lg={6}>
                <WorkCard case_={case_} />
              </GridItem>
            ))}
          </Grid>
        </div>
      </Container>
    </Section>
  );
}
