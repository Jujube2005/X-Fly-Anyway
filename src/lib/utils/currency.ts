const MOCK_RATES: Record<string, number> = {
  THB: 1,
  USD: 0.029, // ~ 1/35
  EUR: 0.026, // ~ 1/38
  GBP: 0.023, // ~ 1/44
  JPY: 4.25,  // ~ 1 THB = 4.25 JPY
  CNY: 0.20,  // ~ 1/5
  AUD: 0.043, // ~ 1/23
  SGD: 0.038, // ~ 1/26
};

/**
 * Format a number as a currency string, with mock conversion.
 * Assume the base amount is in THB unless specified.
 */
export function formatCurrency(
  amount: number,
  currency: string = "THB",
  locale: string = "th-TH",
  baseCurrency: string = "THB"
): string {
  const rateFrom = MOCK_RATES[baseCurrency] || 1;
  const rateTo = MOCK_RATES[currency] || 1;
  const convertedAmount = (amount / rateFrom) * rateTo;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: currency === "JPY" || currency === "THB" ? 0 : 2,
  }).format(convertedAmount);
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
