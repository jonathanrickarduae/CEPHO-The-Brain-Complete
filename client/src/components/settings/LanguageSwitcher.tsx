/**
 * LanguageSwitcher — Toggle between English and Arabic
 *
 * Can be rendered in two modes:
 *   - "button" (default): compact toggle button for the header/sidebar
 *   - "select": dropdown select for the settings page
 */
import { Globe } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import type { Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  mode?: "button" | "select";
  className?: string;
}

const LANGUAGES: { code: Lang; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية" },
];

export function LanguageSwitcher({
  mode = "button",
  className,
}: LanguageSwitcherProps) {
  const { lang, setLang, t } = useI18n();

  if (mode === "select") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <label
          htmlFor="language-select"
          className="text-sm font-medium text-foreground"
        >
          {t("settings.language")}
        </label>
        <select
          id="language-select"
          value={lang}
          onChange={e => setLang(e.target.value as Lang)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={t("settings.language")}
        >
          {LANGUAGES.map(l => (
            <option key={l.code} value={l.code}>
              {l.nativeLabel} — {l.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Compact toggle button mode
  const nextLang = lang === "en" ? "ar" : "en";
  const nextLangLabel = LANGUAGES.find(l => l.code === nextLang)?.nativeLabel;

  return (
    <button
      onClick={() => setLang(nextLang)}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium",
        "border border-border bg-background/50 text-muted-foreground",
        "hover:bg-accent hover:text-accent-foreground transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className
      )}
      aria-label={`Switch to ${nextLangLabel}`}
      title={`Switch to ${nextLangLabel}`}
    >
      <Globe className="w-3.5 h-3.5" aria-hidden="true" />
      <span>{lang === "en" ? "EN" : "عر"}</span>
    </button>
  );
}
