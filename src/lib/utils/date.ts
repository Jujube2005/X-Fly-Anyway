/**
 * Format an ISO 8601 datetime string for display.
 *
 * @example formatDateTime("2026-08-29T14:30:00Z", "th-TH") → "29 ส.ค. 2569 17:30"
 */
export function formatDateTime(
  isoString: string,
  locale: string = "th-TH"
): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

/**
 * Format an ISO 8601 date-only string.
 *
 * @example formatDate("2026-08-29", "th-TH") → "29 ส.ค. 2569"
 */
export function formatDate(
  isoString: string,
  locale: string = "th-TH"
): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(isoString));
}

/**
 * Format flight duration in minutes to a human-readable string.
 *
 * @example formatDuration(145) → "2h 25m"
 */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Returns a YYYY-MM-DD string for today's date (local timezone).
 */
export function todayISODate(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}
