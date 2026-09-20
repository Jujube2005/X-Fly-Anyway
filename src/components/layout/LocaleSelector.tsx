"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { useTranslation } from "@/hooks/useTranslation";
import "./LocaleSelector.css";

/* ── Data ─────────────────────────────────────────────────────── */

const LANGUAGES = [
  { code: "th",    flag: "🇹🇭", label: "ภาษาไทย" },
  { code: "en",    flag: "🇪🇬",  label: "English" },
  { code: "en-TH", flag: "🇹🇭", label: "English (Thailand)" },
  { code: "zh-TW", flag: "🇹🇼", label: "繁體中文" },
  { code: "zh-CN", flag: "🇨🇳", label: "简体中文" },
  { code: "ja",    flag: "🇯🇵", label: "日本語" },
  { code: "ko",    flag: "🇰🇷", label: "한국어" },
  { code: "uk",    flag: "🇺🇦", label: "Українська" },
  { code: "ar",    flag: "🇦🇷",  label: "العربية" },
  { code: "id",    flag: "🇮🇩", label: "Bahasa Indonesia" },
  { code: "ms",    flag: "🇲🇾", label: "Bahasa Melayu" },
  { code: "da",    flag: "🇩🇰", label: "Dansk" },
  { code: "de",    flag: "🇩🇪", label: "Deutsch" },
  { code: "es",    flag: "🇪🇸", label: "Español" },
  { code: "fr",    flag: "🇫🇷", label: "Français" },
  { code: "it",    flag: "🇮🇹", label: "Italiano" },
  { code: "nl",    flag: "🇳🇱", label: "Nederlands" },
  { code: "pl",    flag: "🇵🇱", label: "Polski" },
  { code: "pt-BR", flag: "🇧🇷", label: "Português (Brasil)" },
  { code: "pt-PT", flag: "🇵🇹", label: "Português (Portugal)" },
  { code: "fi",    flag: "🇫🇮", label: "Suomi" },
  { code: "sv",    flag: "🇸🇪", label: "Svenska" },
  { code: "vi",    flag: "🇻🇳", label: "Tiếng Việt" },
  { code: "tr",    flag: "🇹🇷", label: "Türkçe" },
  { code: "el",    flag: "🇬🇷", label: "Ελληνικά" },
  { code: "ru",    flag: "🇷🇺", label: "Русский" },
  { code: "hi",    flag: "🇮🇳", label: "हिन्दी" },
  { code: "bn",    flag: "🇧🇩", label: "বাংলা" },
  { code: "ur",    flag: "🇵🇰", label: "اردو" },
  { code: "fa",    flag: "🇮🇷", label: "فارسی" },
  { code: "he",    flag: "🇮🇱", label: "עברית" },
  { code: "cs",    flag: "🇨🇿", label: "Čeština" },
  { code: "sk",    flag: "🇸🇰", label: "Slovenčina" },
  { code: "ro",    flag: "🇷🇴", label: "Română" },
  { code: "hu",    flag: "🇭🇺", label: "Magyar" },
  { code: "bg",    flag: "🇧🇬", label: "Български" },
  { code: "hr",    flag: "🇭🇷", label: "Hrvatski" },
  { code: "sr",    flag: "🇷🇸", label: "Српски" },
  { code: "ca",    flag: "🇪🇸", label: "Català" },
  { code: "lt",    flag: "🇱🇹", label: "Lietuvių" },
  { code: "lv",    flag: "🇱🇻", label: "Latviešu" },
  { code: "et",    flag: "🇪🇪", label: "Eesti" },
  { code: "sl",    flag: "🇸🇮", label: "Slovenščina" },
  { code: "mk",    flag: "🇲🇰", label: "Македонски" },
  { code: "sq",    flag: "🇦🇱", label: "Shqip" },
  { code: "ka",    flag: "🇬🇪", label: "ქართული" },
  { code: "hy",    flag: "🇦🇲", label: "Հայերեն" },
  { code: "az",    flag: "🇦🇿", label: "Azərbaycan" },
  { code: "kk",    flag: "🇰🇿", label: "Қазақша" },
  { code: "uz",    flag: "🇺🇿", label: "O'zbek" },
  { code: "mn",    flag: "🇲🇳", label: "Монгол" },
  { code: "km",    flag: "🇰🇭", label: "ខ្មែរ" },
  { code: "lo",    flag: "🇱🇦", label: "ລາວ" },
  { code: "my",    flag: "🇲🇲", label: "မြန်မာဘာသာ" },
  { code: "tl",    flag: "🇵🇭", label: "Filipino" },
  { code: "ne",    flag: "🇳🇵", label: "नेपाली" },
  { code: "si",    flag: "🇱🇰", label: "සිංහල" },
  { code: "ta",    flag: "🇮🇳", label: "தமிழ்" },
  { code: "te",    flag: "🇮🇳", label: "తెలుగు" },
  { code: "ml",    flag: "🇮🇳", label: "മലയാളം" },
  { code: "gu",    flag: "🇮🇳", label: "ગુજરાતી" },
  { code: "pa",    flag: "🇮🇳", label: "ਪੰਜਾਬੀ" },
  { code: "sw",    flag: "🇰🇪", label: "Kiswahili" },
  { code: "af",    flag: "🇿🇦", label: "Afrikaans" },
  { code: "am",    flag: "🇪🇹", label: "አማርኛ" },
  { code: "yo",    flag: "🇳🇬", label: "Yorùbá" },
  { code: "ha",    flag: "🇳🇬", label: "Hausa" },
  { code: "is",    flag: "🇮🇸", label: "Íslenska" },
  { code: "mt",    flag: "🇲🇹", label: "Malti" },
  { code: "cy",    flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", label: "Cymraeg" },
  { code: "ga",    flag: "🇮🇪", label: "Gaeilge" },
  { code: "eu",    flag: "🇪🇸", label: "Euskara" },
  { code: "gl",    flag: "🇪🇸", label: "Galego" },
];

const CURRENCIES = [
  // Popular (shown first)
  { code: "THB", symbol: "฿",    name: "บาทไทย",                     popular: true },
  { code: "USD", symbol: "$",    name: "ดอลลาร์สหรัฐ",               popular: true },
  { code: "EUR", symbol: "€",   name: "ยูโร",                        popular: true },
  { code: "GBP", symbol: "£",   name: "ปอนด์สเตอร์ลิง",             popular: true },
  { code: "JPY", symbol: "¥",   name: "เยนญี่ปุ่น",                  popular: true },
  { code: "CNY", symbol: "¥",   name: "หยวนจีน",                     popular: true },
  { code: "SGD", symbol: "S$",  name: "ดอลลาร์สิงคโปร์",            popular: true },
  { code: "AUD", symbol: "A$",  name: "ดอลลาร์ออสเตรเลีย",          popular: true },
  // All currencies
  { code: "AED", symbol: "د.إ", name: "เดอร์แฮมสหรัฐอาหรับเอมิเรตส์", popular: false },
  { code: "AFN", symbol: "؋",   name: "อัฟกานีอัฟกานิสถาน",         popular: false },
  { code: "ALL", symbol: "L",   name: "เลกแอลเบเนีย",               popular: false },
  { code: "AMD", symbol: "֏",   name: "ดรัมอาร์เมเนีย",              popular: false },
  { code: "ANG", symbol: "ƒ",   name: "กิลเดอร์เนเธอร์แลนด์แอนทิลลีส", popular: false },
  { code: "AOA", symbol: "Kz",  name: "กวันซาแองโกลา",              popular: false },
  { code: "ARS", symbol: "$",   name: "เปโซอาร์เจนตินา",            popular: false },
  { code: "AWG", symbol: "ƒ",   name: "ฟลอรินอารูบา",               popular: false },
  { code: "AZN", symbol: "₼",   name: "มานัตอาเซอร์ไบจาน",          popular: false },
  { code: "BAM", symbol: "KM",  name: "มาร์กาที่แปลงสภาพได้บอสเนีย", popular: false },
  { code: "BBD", symbol: "$",   name: "ดอลลาร์บาร์เบโดส",           popular: false },
  { code: "BDT", symbol: "৳",   name: "ตากาบังกลาเทศ",              popular: false },
  { code: "BGN", symbol: "лв",  name: "เลฟบัลแกเรีย",              popular: false },
  { code: "BHD", symbol: "BD",  name: "ดีนาร์บาห์เรน",              popular: false },
  { code: "BMD", symbol: "$",   name: "ดอลลาร์เบอร์มิวดา",         popular: false },
  { code: "BND", symbol: "$",   name: "ดอลลาร์บรูไน",               popular: false },
  { code: "BOB", symbol: "Bs.", name: "โบลิเวียโน",                  popular: false },
  { code: "BRL", symbol: "R$",  name: "เรียลบราซิล",                popular: false },
  { code: "BSD", symbol: "$",   name: "ดอลลาร์บาฮามาส",             popular: false },
  { code: "BTN", symbol: "Nu",  name: "งุลตรัมภูฏาน",               popular: false },
  { code: "BWP", symbol: "P",   name: "ปูลาบอตสวานา",               popular: false },
  { code: "BYN", symbol: "Br",  name: "รูเบิลเบลารุส",              popular: false },
  { code: "BZD", symbol: "$",   name: "ดอลลาร์เบลีซ",               popular: false },
  { code: "CAD", symbol: "C$",  name: "ดอลลาร์แคนาดา",             popular: false },
  { code: "CHF", symbol: "Fr",  name: "ฟรังก์สวิส",                 popular: false },
  { code: "CLP", symbol: "CLP$", name: "เปโซชิลี",                  popular: false },
  { code: "COP", symbol: "COL$", name: "เปโซโคลอมเบีย",             popular: false },
  { code: "CRC", symbol: "₡",   name: "โคลอนคอสตาริกา",             popular: false },
  { code: "CZK", symbol: "Kč",  name: "โครนาเช็ก",                  popular: false },
  { code: "DKK", symbol: "kr",  name: "โครนเดนมาร์ก",               popular: false },
  { code: "DOP", symbol: "RD$", name: "เปโซสาธารณรัฐโดมินิกัน",    popular: false },
  { code: "DZD", symbol: "DA",  name: "ดีนาร์แอลจีเรีย",            popular: false },
  { code: "EGP", symbol: "E£",  name: "ปอนด์อียิปต์",               popular: false },
  { code: "ETB", symbol: "Br",  name: "เบอร์อิธิโอเปีย",            popular: false },
  { code: "FJD", symbol: "FJ$", name: "ดอลลาร์ฟิจิ",               popular: false },
  { code: "GEL", symbol: "₾",   name: "ลารีจอร์เจีย",               popular: false },
  { code: "GHS", symbol: "₵",   name: "เซดีกานา",                   popular: false },
  { code: "GMD", symbol: "D",   name: "ดาลาซีแกมเบีย",              popular: false },
  { code: "GTQ", symbol: "Q",   name: "เกตซัลกัวเตมาลา",            popular: false },
  { code: "HKD", symbol: "HK$", name: "ดอลลาร์ฮ่องกง",             popular: false },
  { code: "HNL", symbol: "L",   name: "เลมปิราฮอนดูรัส",            popular: false },
  { code: "HUF", symbol: "Ft",  name: "ฟอรินต์ฮังการี",             popular: false },
  { code: "IDR", symbol: "Rp",  name: "รูเปียห์อินโดนีเซีย",        popular: false },
  { code: "ILS", symbol: "₪",   name: "นิวเชเกลอิสราเอล",           popular: false },
  { code: "INR", symbol: "₹",   name: "รูปีอินเดีย",                popular: false },
  { code: "IQD", symbol: "ID",  name: "ดีนาร์อิรัก",               popular: false },
  { code: "IRR", symbol: "﷼",   name: "เรียลอิหร่าน",               popular: false },
  { code: "ISK", symbol: "kr",  name: "โครนาไอซ์แลนด์",             popular: false },
  { code: "JMD", symbol: "J$",  name: "ดอลลาร์จาเมกา",              popular: false },
  { code: "JOD", symbol: "JD",  name: "ดีนาร์จอร์แดน",             popular: false },
  { code: "KES", symbol: "KSh", name: "ชิลลิงเคนยา",                popular: false },
  { code: "KGS", symbol: "лв",  name: "ซอมคีร์กีซสถาน",             popular: false },
  { code: "KHR", symbol: "៛",   name: "เรียลกัมพูชา",               popular: false },
  { code: "KRW", symbol: "₩",   name: "วอนเกาหลี",                  popular: false },
  { code: "KWD", symbol: "K.D", name: "ดีนาร์คูเวต",               popular: false },
  { code: "KYD", symbol: "$",   name: "ดอลลาร์หมู่เกาะเคย์แมน",    popular: false },
  { code: "KZT", symbol: "₸",   name: "เทงเกคาซัคสถาน",             popular: false },
  { code: "LAK", symbol: "₭",   name: "กีบลาว",                     popular: false },
  { code: "LBP", symbol: "L£",  name: "ปอนด์เลบานอน",              popular: false },
  { code: "LKR", symbol: "₨",   name: "รูปีศรีลังกา",               popular: false },
  { code: "LYD", symbol: "LD",  name: "ดีนาร์ลิเบีย",              popular: false },
  { code: "MAD", symbol: "MAD", name: "ดิรฮัมโมร็อกโก",             popular: false },
  { code: "MDL", symbol: "lei", name: "เลอุมอลโดวา",                popular: false },
  { code: "MKD", symbol: "ден", name: "ดีนาร์มาซิโดเนีย",           popular: false },
  { code: "MMK", symbol: "K",   name: "จ๊าตพม่า",                   popular: false },
  { code: "MNT", symbol: "₮",   name: "ทูกรึกมองโกเลีย",            popular: false },
  { code: "MUR", symbol: "₨",   name: "รูปีมอริเชียส",              popular: false },
  { code: "MVR", symbol: "Rf",  name: "รูฟิยาห์มัลดีฟส์",           popular: false },
  { code: "MWK", symbol: "MK",  name: "กวาชามาลาวี",                popular: false },
  { code: "MXN", symbol: "$",   name: "เปโซเม็กซิโก",              popular: false },
  { code: "MYR", symbol: "RM",  name: "ริงกิตมาเลเซีย",             popular: false },
  { code: "MZN", symbol: "MT",  name: "เมติคัลโมซัมบิก",            popular: false },
  { code: "NAD", symbol: "N$",  name: "ดอลลาร์นามิเบีย",            popular: false },
  { code: "NGN", symbol: "₦",   name: "ไนราไนจีเรีย",               popular: false },
  { code: "NIO", symbol: "C$",  name: "คอร์โดบานิการากัว",           popular: false },
  { code: "NOK", symbol: "kr",  name: "โครนนอร์เวย์",               popular: false },
  { code: "NPR", symbol: "₨",   name: "รูปีเนปาล",                  popular: false },
  { code: "NZD", symbol: "NZ$", name: "ดอลลาร์นิวซีแลนด์",         popular: false },
  { code: "OMR", symbol: "RO",  name: "ริยาลโอมาน",                 popular: false },
  { code: "PAB", symbol: "B/.", name: "บัลบัวปานามา",               popular: false },
  { code: "PEN", symbol: "S/",  name: "โซลเปรู",                    popular: false },
  { code: "PGK", symbol: "K",   name: "กีนาปาปัวนิวกินี",           popular: false },
  { code: "PHP", symbol: "₱",   name: "เปโซฟิลิปปินส์",             popular: false },
  { code: "PKR", symbol: "₨",   name: "รูปีปากีสถาน",               popular: false },
  { code: "PLN", symbol: "zł",  name: "ซลอตีโปแลนด์",              popular: false },
  { code: "PYG", symbol: "₲",   name: "กวารานีปารากวัย",             popular: false },
  { code: "QAR", symbol: "QR",  name: "ริยาลกาตาร์",               popular: false },
  { code: "RON", symbol: "lei", name: "เลวโรมาเนีย",                popular: false },
  { code: "RSD", symbol: "дин", name: "ดีนาร์เซอร์เบีย",            popular: false },
  { code: "RUB", symbol: "₽",   name: "รูเบิลรัสเซีย",              popular: false },
  { code: "RWF", symbol: "RF",  name: "ฟรังก์รวันดา",               popular: false },
  { code: "SAR", symbol: "﷼",   name: "ริยาลซาอุดีอาระเบีย",        popular: false },
  { code: "SBD", symbol: "SI$", name: "ดอลลาร์หมู่เกาะโซโลมอน",   popular: false },
  { code: "SDG", symbol: "SDG", name: "ปอนด์ซูดาน",                 popular: false },
  { code: "SEK", symbol: "kr",  name: "โครนสวีเดน",                 popular: false },
  { code: "SOS", symbol: "S",   name: "ชิลลิงโซมาลี",              popular: false },
  { code: "SYP", symbol: "S£",  name: "ปอนด์ซีเรีย",               popular: false },
  { code: "TND", symbol: "DT",  name: "ดีนาร์ตูนิเซีย",             popular: false },
  { code: "TOP", symbol: "T$",  name: "ปาอังกาตองกา",               popular: false },
  { code: "TRY", symbol: "₺",   name: "ลีราตุรกี",                  popular: false },
  { code: "TTD", symbol: "TT$", name: "ดอลลาร์ตรินิแดดและโตเบโก",  popular: false },
  { code: "TWD", symbol: "NT$", name: "ดอลลาร์ไต้หวัน",            popular: false },
  { code: "TZS", symbol: "TSh", name: "ชิลลิงแทนซาเนีย",            popular: false },
  { code: "UAH", symbol: "₴",   name: "ริฟนาห์ยูเครน",              popular: false },
  { code: "UGX", symbol: "USh", name: "ชิลลิงยูกันดา",              popular: false },
  { code: "UYU", symbol: "$U",  name: "เปโซอุรุกวัย",               popular: false },
  { code: "UZS", symbol: "сум", name: "ซอมอุซเบกิสถาน",             popular: false },
  { code: "VND", symbol: "₫",   name: "ด่งเวียดนาม",                popular: false },
  { code: "VUV", symbol: "VT",  name: "วาตูวานูอาตู",               popular: false },
  { code: "WST", symbol: "T",   name: "ทาลาซามัว",                  popular: false },
  { code: "XAF", symbol: "Fr",  name: "ฟรังก์แอฟริกากลาง CFA",     popular: false },
  { code: "XOF", symbol: "Fr",  name: "ฟรังก์แอฟริกาตะวันตก CFA",  popular: false },
  { code: "YER", symbol: "﷼",   name: "ริยาลเยเมน",                 popular: false },
  { code: "ZAR", symbol: "R",   name: "แรนด์แอฟริกาใต้",            popular: false },
  { code: "ZMW", symbol: "K",   name: "กวาชาแซมเบีย",               popular: false },
];





/* ── Component ────────────────────────────────────────────────── */
interface LocaleSelectorProps {
  /** CSS color token for text; varies by header variant */
  textColor: string;
}

export function LocaleSelector({ textColor }: LocaleSelectorProps) {
  const { language, currency, setLanguage, setCurrency } = useLocale();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"lang" | "currency">("lang");
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const selectLanguage = useCallback((code: string) => {
    setLanguage(code);
    setOpen(false);
  }, [setLanguage]);

  const selectCurrency = useCallback((code: string) => {
    setCurrency(code);
  }, [setCurrency]);

  const currentLang = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];
  const currentCurrency = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];
  const popularCurrencies = CURRENCIES.filter((c) => c.popular);

  return (
    <>
      {/* ── Trigger button ── */}
      <button
        onClick={() => { setOpen(true); setActiveTab("lang"); }}
        className={`locale-trigger ${textColor}`}
        aria-label="เปลี่ยนภาษาหรือสกุลเงิน"
        aria-haspopup="dialog"
        id="locale-selector-trigger"
        suppressHydrationWarning
      >
        {/* Globe icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className={`locale-trigger-text ${textColor}`}>
          {currentLang.label}
        </span>
        <span className="locale-trigger-sep" style={{ color: "inherit" }}>|</span>
        <span className={`locale-trigger-text ${textColor}`}>
          {currentCurrency.code}
        </span>
      </button>

      {/* ── Modal ── */}
      {open && (
        <div
          ref={overlayRef}
          className="locale-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="เลือกภาษาและสกุลเงิน"
          onClick={(e) => { if (e.target === overlayRef.current) setOpen(false); }}
        >
          <div className="locale-panel">
            {/* Tab header */}
            <div className="locale-header">
              <button
                className={`locale-tab-btn ${activeTab === "lang" ? "active" : ""}`}
                onClick={() => setActiveTab("lang")}
                id="locale-tab-lang"
              >
                {t.locale.language}
              </button>
              <button
                className={`locale-tab-btn ${activeTab === "currency" ? "active" : ""}`}
                onClick={() => setActiveTab("currency")}
                id="locale-tab-currency"
              >
                {t.locale.currency}
              </button>
              <button
                className="locale-close-btn"
                onClick={() => setOpen(false)}
                aria-label="ปิด"
                id="locale-close-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="locale-body">
              {/* ── Language tab ── */}
              {activeTab === "lang" && (
                <>
                  <p className="locale-section-label">{t.locale.currentLanguage}</p>
                  <div className="locale-grid" style={{ marginBottom: "8px" }}>
                    <button className="locale-item selected">
                      <span className="locale-item-label">{currentLang.label}</span>
                    </button>
                  </div>

                  <p className="locale-section-label">{t.locale.allLanguages}</p>
                  <div className="locale-grid">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                      className={`locale-item ${language === lang.code ? "selected" : ""}`}
                        onClick={() => selectLanguage(lang.code)}
                        id={`locale-lang-${lang.code}`}
                      >
                        <span className="locale-item-label">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* ── Currency tab ── */}
              {activeTab === "currency" && (
                <>
                  <p className="locale-section-label">{t.locale.popularCurrencies}</p>
                  <div className="locale-grid">
                    {popularCurrencies.map((cur) => (
                      <button
                        key={cur.code}
                        className={`locale-item ${currency === cur.code ? "selected" : ""}`}
                        onClick={() => selectCurrency(cur.code)}
                        id={`locale-cur-popular-${cur.code}`}
                      >
                        <span className="locale-item-code">{cur.code}</span>
                        <span className="locale-item-label">- {cur.name}</span>
                      </button>
                    ))}
                  </div>

                  <p className="locale-section-label">{t.locale.allCurrencies}</p>
                  <div className="locale-grid">
                    {CURRENCIES.map((cur) => (
                      <button
                        key={cur.code}
                        className={`locale-item ${currency === cur.code ? "selected" : ""}`}
                        onClick={() => selectCurrency(cur.code)}
                        id={`locale-cur-${cur.code}`}
                      >
                        <span className="locale-item-code">{cur.code}</span>
                        <span className="locale-item-label">- {cur.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
