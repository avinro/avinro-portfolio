import { useTranslations } from "next-intl";

import { NotFoundPage } from "@/components/site/not-found-page";
import { SiteChrome } from "@/components/site/site-chrome";

export default function LocaleNotFound() {
  const t = useTranslations("notFound");

  return (
    <SiteChrome>
      <NotFoundPage kicker={t("kicker")} body={t("body")} cta={t("cta")} />
    </SiteChrome>
  );
}
