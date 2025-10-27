export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getLocalDate(date: Date = new Date()): Date {
  const userTimezone = getUserTimezone();
  const localDateString = date.toLocaleString('en-US', { timeZone: userTimezone });
  return new Date(localDateString);
}

export function getLocalDateString(date: Date = new Date()): string {
  const localDate = getLocalDate(date);
  return localDate.toISOString().split('T')[0];
}

export function getStartOfDay(date: Date = new Date()): Date {
  const localDate = getLocalDate(date);
  const startOfDay = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());
  return startOfDay;
}

export function getStartOfMonth(date: Date = new Date()): Date {
  const localDate = getLocalDate(date);
  const startOfMonth = new Date(localDate.getFullYear(), localDate.getMonth(), 1);
  return startOfMonth;
}

export function getEndOfMonth(date: Date = new Date()): Date {
  const localDate = getLocalDate(date);
  const endOfMonth = new Date(localDate.getFullYear(), localDate.getMonth() + 1, 0);
  return endOfMonth;
}

export function getCurrentDayOfMonth(date: Date = new Date()): number {
  const localDate = getLocalDate(date);
  return localDate.getDate();
}

export function getDaysInMonth(date: Date = new Date()): number {
  const endOfMonth = getEndOfMonth(date);
  return endOfMonth.getDate();
}

export function getTimeUntilMidnight(): number {
  const now = new Date();
  const localDate = getLocalDate(now);

  const midnightLocal = new Date(localDate);
  midnightLocal.setHours(24, 0, 0, 0);

  const midnightUTC = Date.UTC(
    midnightLocal.getFullYear(),
    midnightLocal.getMonth(),
    midnightLocal.getDate(),
    0, 0, 0, 0
  );

  const nowLocalTime = getLocalDate(now).getTime();
  const midnightLocalTime = midnightLocal.getTime();

  return midnightLocalTime - nowLocalTime;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  const localDate1 = getLocalDate(date1);
  const localDate2 = getLocalDate(date2);

  return (
    localDate1.getFullYear() === localDate2.getFullYear() &&
    localDate1.getMonth() === localDate2.getMonth() &&
    localDate1.getDate() === localDate2.getDate()
  );
}

export function getDaysDifference(date1: Date, date2: Date): number {
  const start = getStartOfDay(date1);
  const end = getStartOfDay(date2);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDateForDisplay(date: Date, locale: string = 'en-US'): string {
  const localDate = getLocalDate(date);
  return localDate.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function getDateDaysAgo(daysAgo: number): Date {
  const today = getStartOfDay();
  return new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
}
