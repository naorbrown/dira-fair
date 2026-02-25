/**
 * Format a number as Israeli Shekel currency with thousands separators.
 * Example: 10700 → "₪10,700"
 */
export function formatRent(amount: number): string {
  return `₪${amount.toLocaleString("en-IL")}`;
}

/**
 * Format a percentage with sign.
 * Example: 4.2 → "+4.2%", -3.1 → "-3.1%"
 */
export function formatPercent(value: number, includeSign = true): string {
  const sign = includeSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Format a price-per-sqm value.
 * Example: 85.3 → "₪85/sqm"
 */
export function formatPricePerSqm(value: number): string {
  return `₪${Math.round(value)}/sqm`;
}
