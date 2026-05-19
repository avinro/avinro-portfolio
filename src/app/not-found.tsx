import { SiteChrome } from "@/components/site/site-chrome";
import { NotFoundPageContent } from "@/components/site/not-found-page";

export default function GlobalNotFound() {
  return (
    <SiteChrome minimalChrome>
      <NotFoundPageContent />
    </SiteChrome>
  );
}
