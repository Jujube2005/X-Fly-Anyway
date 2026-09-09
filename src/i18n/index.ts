import { th } from "./th";
import { en } from "./en";
export type { Translations } from "./th";

/**
 * Returns the translation dictionary for the given BCP-47 language code.
 * Falls back to English for any language other than Thai.
 */
export function getTranslations(language: string) {
  if (language === "th" || language === "th-TH") return th;
  // English variants
  if (language.startsWith("en")) return en;
  // All other languages → English as fallback until dedicated translations are added
  return en;
}

export { th, en };
