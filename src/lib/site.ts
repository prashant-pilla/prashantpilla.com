/**
 * Site-wide constants and small formatting helpers shared by pages,
 * metadata routes (sitemap, robots, OG image), and section components.
 */
export const SITE_URL = 'https://prashantpilla.com';

export const SITE_NAV = [
  { href: '/#work', label: 'Work' },
  { href: '/writing', label: 'Writing' },
  { href: '/changelog', label: 'Changelog' },
] as const;

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export interface ParsedDate {
  year: number;
  /** 1-12 */
  month: number;
  /** 1-31, or undefined when only the month is known (YYYY-MM). */
  day?: number;
}

/** Parse `YYYY-MM-DD` or `YYYY-MM` without touching the Date object (no TZ drift). */
export function parseDate(iso: string): ParsedDate {
  const [y, m, d] = iso.split('-').map((n) => Number.parseInt(n, 10));
  return { year: y, month: m, day: Number.isFinite(d) ? d : undefined };
}

export function monthName(month: number, short = false): string {
  const name = MONTHS[month - 1] ?? '';
  return short ? name.slice(0, 3) : name;
}

/** "September 2026" */
export function formatMonthYear(iso: string): string {
  const { year, month } = parseDate(iso);
  return `${monthName(month)} ${year}`;
}

/** "Sep 22, 2026" or "Sep 2026" when the day is unknown. */
export function formatDate(iso: string): string {
  const { year, month, day } = parseDate(iso);
  return day ? `${monthName(month, true)} ${day}, ${year}` : `${monthName(month, true)} ${year}`;
}

/** Zero-padded index for list rows: 1 -> "01". */
export function padIndex(i: number): string {
  return String(i).padStart(2, '0');
}
