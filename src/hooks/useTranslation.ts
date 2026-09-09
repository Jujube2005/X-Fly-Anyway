"use client";

import { useLocale } from "@/contexts/LocaleContext";
import { getTranslations } from "@/i18n";

/**
 * Returns the translation dictionary `t` for the current locale,
 * plus the raw locale state.
 *
 * Usage:
 *   const { t, language, currency } = useTranslation();
 *   <p>{t.nav.book}</p>
 */
export function useTranslation() {
  const locale = useLocale();
  const t = getTranslations(locale.language);
  return { t, ...locale };
}
