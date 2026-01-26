import { toZonedTime, fromZonedTime, format as formatTz } from 'date-fns-tz';

const TIMEZONE = 'Europe/Tallinn';

export function getCurrentDate(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

export function formatDateInTimezone(date: Date, formatStr: string): string {
  const zonedDate = toZonedTime(date, TIMEZONE);
  return formatTz(zonedDate, formatStr, { timeZone: TIMEZONE });
}

export function getTodayString(): string {
  const today = getCurrentDate();
  return formatTz(today, 'yyyy-MM-dd', { timeZone: TIMEZONE });
}

export function parseToTimezone(dateString: string): Date {
  return toZonedTime(new Date(dateString), TIMEZONE);
}
