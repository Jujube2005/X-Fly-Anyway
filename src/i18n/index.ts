import { th } from "./th";
import { en } from "./en";
import { zhCN } from "./zh-CN";
import { zhTW } from "./zh-TW";
import { ja } from "./ja";
import { ko } from "./ko";

export type { Translations } from "./th";

/**
 * Returns the translation dictionary for the given BCP-47 language code.
 * Falls back to English for any language without a dedicated translation.
 */
export function getTranslations(language: string) {
  if (language === "th" || language === "th-TH") return th;
  if (language.startsWith("en")) return en;
  if (language === "zh-CN") return zhCN;
  if (language === "zh-TW") return zhTW;
  if (language === "ja") return ja;
  if (language === "ko") return ko;
  // All other languages → English as fallback
  return en;
}

export { th, en, zhCN, zhTW, ja, ko };
