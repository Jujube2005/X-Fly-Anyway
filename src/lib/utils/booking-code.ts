/**
 * Generates a unique booking reference code.
 * Format: XFA-YYYYMMDD-XXXX (X = alphanumeric)
 *
 * @example "XFA-20260829-A3K7"
 */
export function generateBookingCode(): string {
  const date = new Date();
  const dateStr = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // unambiguous chars
  const suffix = Array.from({ length: 4 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");

  return `XFA-${dateStr}-${suffix}`;
}

/**
 * Validates that a booking reference code matches the expected format.
 */
export function isValidBookingCode(ref: string): boolean {
  return /^XFA-\d{8}-[A-Z2-9]{4}$/.test(ref);
}
