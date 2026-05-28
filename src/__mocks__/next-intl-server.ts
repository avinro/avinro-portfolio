import enMessages from "../../messages/en.json";

function readMessage(path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => {
    if (value && typeof value === "object" && key in value) {
      return (value as Record<string, unknown>)[key];
    }
    return undefined;
  }, enMessages);
}

type GetTranslationsArg = string | { locale?: string; namespace?: string };

function resolveNamespace(arg?: GetTranslationsArg): string | undefined {
  if (typeof arg === "string") return arg;
  return arg?.namespace;
}

export async function getTranslations(arg?: GetTranslationsArg) {
  await Promise.resolve();
  const namespace = resolveNamespace(arg);

  const translate = (key: string, values?: Record<string, string | number>) => {
    const message = readMessage(namespace ? `${namespace}.${key}` : key);
    const text = typeof message === "string" ? message : key;

    return Object.entries(values ?? {}).reduce(
      (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
      text,
    );
  };

  translate.raw = (key: string) => readMessage(namespace ? `${namespace}.${key}` : key);

  return translate;
}

export async function getMessages() {
  await Promise.resolve();

  return enMessages;
}

export function setRequestLocale() {
  return undefined;
}
