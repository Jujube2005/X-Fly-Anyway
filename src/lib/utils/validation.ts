/**
 * Validate an email address format.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validate a Thai phone number (10 digits, starting with 0).
 */
export function isValidThaiPhone(phone: string): boolean {
  return /^0\d{9}$/.test(phone.replace(/[-\s]/g, ""));
}

/**
 * Validate a date string in YYYY-MM-DD format.
 */
export function isValidDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

/**
 * Check if a departure date is valid (not in the past).
 */
export function isDepartureValid(dateStr: string): boolean {
  if (!isValidDate(dateStr)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) >= today;
}

/**
 * Validate a passport number — basic alphanumeric check.
 */
export function isValidPassportNumber(passport: string): boolean {
  return /^[A-Z0-9]{6,12}$/.test(passport.toUpperCase());
}

/**
 * Ensure a string is non-empty after trimming.
 */
export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}
