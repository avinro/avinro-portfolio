import { getRequestConfig } from "next-intl/server";
import type { AbstractIntlMessages } from "use-intl/core";

import { isLocale, routing } from "@/i18n/routing";
import enMessages from "../../messages/en.json";
import esMessages from "../../messages/es.json";

const messagesByLocale = {
  en: enMessages as unknown as AbstractIntlMessages,
  es: esMessages as unknown as AbstractIntlMessages,
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && isLocale(requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: messagesByLocale[locale],
  };
});
