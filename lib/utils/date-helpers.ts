import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, addDays, subDays, startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const TIMEZONE = 'Europe/Tallinn';

export function getWeekDays(date: Date): Date[] {
  const zonedDate = toZonedTime(date, TIMEZONE);
  const start = startOfWeek(zonedDate, { weekStartsOn: 1 });
  const end = endOfWeek(zonedDate, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function getMonthDays(date: Date): Date[] {
  const zonedDate = toZonedTime(date, TIMEZONE);
  const start = startOfMonth(zonedDate);
  const end = endOfMonth(zonedDate);
  const monthDays = eachDayOfInterval({ start, end });

  const firstDayOfMonth = start.getDay();
  const daysToAdd = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const paddingStart = Array.from({ length: daysToAdd }, (_, i) =>
    subDays(start, daysToAdd - i)
  );

  const lastDayOfMonth = end.getDay();
  const daysToFill = lastDayOfMonth === 0 ? 0 : 7 - lastDayOfMonth;

  const paddingEnd = Array.from({ length: daysToFill }, (_, i) =>
    addDays(end, i + 1)
  );

  return [...paddingStart, ...monthDays, ...paddingEnd];
}

export function formatDate(date: Date): string {
  const zonedDate = toZonedTime(date, TIMEZONE);
  return format(zonedDate, 'yyyy-MM-dd');
}

export function formatDisplayDate(date: Date): string {
  const zonedDate = toZonedTime(date, TIMEZONE);
  return format(zonedDate, 'MMM dd, yyyy');
}

export function isToday(date: Date): boolean {
  const today = toZonedTime(new Date(), TIMEZONE);
  const zonedDate = toZonedTime(date, TIMEZONE);
  return isSameDay(zonedDate, today);
}

export function getDayOfWeek(date: Date): number {
  return date.getDay();
}

export function getNextWeek(date: Date): Date {
  return addDays(date, 7);
}

export function getPreviousWeek(date: Date): Date {
  return subDays(date, 7);
}
