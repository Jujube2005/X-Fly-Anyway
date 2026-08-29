/**
 * Format a number as a currency string.
 *
 * @example formatCurrency(1299.50, "THB", "th-TH") → "฿1,299.50"
 */
export function formatCurrency(
  amount: number,
  currency: string = "THB",
  locale: string = "th-TH"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number as a plain number with thousands separators.
 */
export function formatNumber(
  value: number,
  locale: string = "th-TH"
): string {
  return new Intl.NumberFormat(locale).format(value);
}
