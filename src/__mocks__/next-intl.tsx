import type { ReactNode } from "react";

import enMessages from "../../messages/en.json";

function readMessage(path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => {
    if (value && typeof value === "object" && key in value) {
      return (value as Record<string, unknown>)[key];
    }
    return undefined;
  }, enMessages);
}

export function useTranslations(namespace?: string) {
  const translate = (key: string, values?: Record<string, string>) => {
    const path = namespace ? `${namespace}.${key}` : key;
    const message = readMessage(path);
    const text = typeof message === "string" ? message : key;

    return Object.entries(values ?? {}).reduce(
      (result, [name, value]) => result.replaceAll(`{${name}}`, value),
      text,
    );
  };

  translate.raw = (key: string) => readMessage(namespace ? `${namespace}.${key}` : key);

  return translate;
}

export function useLocale() {
  return "en";
}

export function useMessages() {
  return enMessages;
}

export function NextIntlClientProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
