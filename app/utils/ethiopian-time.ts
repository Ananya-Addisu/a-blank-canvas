/**
 * Ethiopian Time Utilities
 * 
 * Ethiopia uses East Africa Time (EAT) which is UTC+3.
 * Dates and times stored in the database (date + time columns) represent
 * wall-clock time in Ethiopia. This module converts them to correct JS Date
 * objects and provides formatting helpers.
 */

export const ETHIOPIAN_TIMEZONE = 'Africa/Nairobi'; // EAT = UTC+3
const EAT_OFFSET_MS = 3 * 60 * 60 * 1000; // +3 hours in milliseconds

/**
 * Parses a stored date string (YYYY-MM-DD) and optional time (HH:MM or HH:MM:SS)
 * that represent Ethiopian wall-clock time, and returns a JS Date (UTC internally).
 */
export function parseEthiopianDateTime(date: string, time?: string): Date {
  if (!date) return new Date(NaN);

  const [year, month, day] = date.split('-').map(Number);
  if ([year, month, day].some(isNaN)) return new Date(NaN);

  const timeParts = (time || '00:00:00').split(':').map(Number);
  const hours = timeParts[0] || 0;
  const minutes = timeParts[1] || 0;
  const seconds = timeParts[2] || 0;

  if ([hours, minutes, seconds].some(isNaN)) return new Date(NaN);

  // The stored date+time is Ethiopian wall-clock (UTC+3).
  // To get the correct UTC instant: subtract 3 hours.
  const utcMs = Date.UTC(year, month - 1, day, hours, minutes, seconds) - EAT_OFFSET_MS;
  return new Date(utcMs);
}

/**
 * Returns a Date that is `minutes` after the given Ethiopian date+time.
 */
export function addMinutesToEthiopianDateTime(date: string, time: string | undefined, minutes: number): Date {
  const start = parseEthiopianDateTime(date, time);
  return new Date(start.getTime() + minutes * 60_000);
}

/**
 * Returns true if the Ethiopian date+time is in the past relative to `compareAt` (defaults to now).
 */
export function isPastEthiopianDateTime(date: string, time?: string, compareAt: Date = new Date()): boolean {
  const target = parseEthiopianDateTime(date, time);
  if (isNaN(target.getTime())) return false;
  return target.getTime() <= compareAt.getTime();
}

/**
 * Formats an Ethiopian date+time for display using Intl, shown in Ethiopian timezone.
 */
export function formatEthiopianDate(date: string, time?: string, options?: Intl.DateTimeFormatOptions): string {
  const d = parseEthiopianDateTime(date, time);
  if (isNaN(d.getTime())) return '';

  return d.toLocaleDateString('en-US', {
    timeZone: ETHIOPIAN_TIMEZONE,
    ...options,
  });
}

/**
 * Formats just the time portion in Ethiopian timezone.
 */
export function formatEthiopianTime(date: string, time?: string, options?: Intl.DateTimeFormatOptions): string {
  const d = parseEthiopianDateTime(date, time);
  if (isNaN(d.getTime())) return '';

  return d.toLocaleTimeString('en-US', {
    timeZone: ETHIOPIAN_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

/**
 * Returns the current time in Ethiopia as a formatted string.
 */
export function getCurrentEthiopianTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: ETHIOPIAN_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Returns the current date in Ethiopia as YYYY-MM-DD.
 */
export function getCurrentEthiopianDate(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: ETHIOPIAN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now); // Returns YYYY-MM-DD
}
