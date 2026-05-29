"use client";

import type { CSSProperties } from "react";
import { ChevronDownIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const LOCALES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
] as const;

export function LanguageSwitcher({
  variant,
  className,
  style,
}: {
  variant: "desktop" | "mobile";
  className?: string;
  style?: CSSProperties;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("languageSwitcher");

  const switchLocale = (next: "en" | "es") => {
    if (next !== locale) {
      router.replace(pathname, { locale: next });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("label")}
        className={cn(
          "focus-ring inline-flex items-center gap-1 rounded-sm leading-none transition-colors duration-200 ease-out motion-reduce:transition-none",
          "text-muted-foreground hover:text-foreground font-mono text-xs tracking-wider uppercase",
          variant === "mobile" ? "py-2" : "pt-0 pb-0.5",
          className,
        )}
        style={style}
      >
        {locale}
        <ChevronDownIcon className="size-3 opacity-60" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={variant === "mobile" ? "center" : "end"}>
        {LOCALES.map(({ value, label }) => (
          <DropdownMenuCheckboxItem
            key={value}
            checked={locale === value}
            onCheckedChange={() => {
              switchLocale(value);
            }}
            className="font-mono text-xs tracking-widest uppercase"
          >
            {label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
