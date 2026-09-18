import { th } from "./th";
import { en } from "./en";
import { zhCN } from "./zh-CN";
import { zhTW } from "./zh-TW";
import { ja } from "./ja";
import { ko } from "./ko";
import { ar } from "./ar";
import { de } from "./de";
import { es } from "./es";
import { fr } from "./fr";
import { hi } from "./hi";
import { id, ms } from "./id-ms";
import { it } from "./it";
import { nl } from "./nl";
import { pl } from "./pl";
import { ptBR, ptPT } from "./pt";
import { ru } from "./ru";
import { tr } from "./tr";
import { uk } from "./uk";
import { vi } from "./vi";
import { sv, da, fi } from "./nordic";
import { el, ro, cs, hu } from "./eu-east";
import { sk, bg, hr, ca, fa, he, bn, ur, lt, lv } from "./misc-1";
import { et, sr, sw, tl, ka } from "./misc-2";
import { km, lo, my, ne, si, ta, te, ml, gu, pa } from "./misc-3";
import { sl, mk, sq, hy, az, kk, uz, mn } from "./misc-4";
import { af, am, yo, ha, is, mt, cy, ga, eu, gl } from "./misc-5";

export type { Translations } from "./th";

const translationsMap: Record<string, any> = {
  th,
  "th-TH": th,
  en,
  "en-TH": en,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  ja,
  ko,
  ar,
  de,
  es,
  fr,
  hi,
  id,
  ms,
  it,
  nl,
  pl,
  "pt-BR": ptBR,
  "pt-PT": ptPT,
  ru,
  tr,
  uk,
  vi,
  sv,
  da,
  fi,
  el,
  ro,
  cs,
  hu,
  sk,
  bg,
  hr,
  ca,
  fa,
  he,
  bn,
  ur,
  lt,
  lv,
  et,
  sr,
  sw,
  tl,
  ka,
  km,
  lo,
  my,
  ne,
  si,
  ta,
  te,
  ml,
  gu,
  pa,
  sl,
  mk,
  sq,
  hy,
  az,
  kk,
  uz,
  mn,
  af,
  am,
  yo,
  ha,
  is,
  mt,
  cy,
  ga,
  eu,
  gl,
};

function deepMerge(target: any, source: any): any {
  if (!source) return target;
  const output = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

/**
 * Returns the translation dictionary for the given BCP-47 language code.
 * Falls back to English for any language without a dedicated translation or missing keys.
 */
export function getTranslations(language: string): import("./th").Translations {
  const dict = translationsMap[language] || translationsMap[language.split("-")[0]];
  if (!dict || dict === en) return en;
  if (dict === th) return th;
  return deepMerge(en, dict);
}

export {
  th, en, zhCN, zhTW, ja, ko, ar, de, es, fr, hi, id, ms, it, nl, pl,
  ptBR, ptPT, ru, tr, uk, vi, sv, da, fi, el, ro, cs, hu, sk, bg, hr,
  ca, fa, he, bn, ur, lt, lv, et, sr, sw, tl, ka, km, lo, my, ne, si,
  ta, te, ml, gu, pa, sl, mk, sq, hy, az, kk, uz, mn, af, am, yo, ha,
  is, mt, cy, ga, eu, gl,
};

