/**
 * Calendar maths in IST (Asia/Kolkata, UTC+5:30, no daylight saving). Dates are YYYY-MM-DD strings.
 */
const TIME_ZONE = "Asia/Kolkata";
const DAY_MS = 86_400_000;

/** The IST calendar day at an instant. en-CA formats as YYYY-MM-DD. */
export function istDate(ms: number) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date(ms));
}

function dayNumber(date: string) {
  return Math.round(Date.parse(`${date}T00:00:00Z`) / DAY_MS);
}

export function addDays(date: string, days: number) {
  return new Date((dayNumber(date) + days) * DAY_MS).toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string) {
  return dayNumber(to) - dayNumber(from);
}

/** The Sunday that ends the week (Monday to Sunday) containing `date`. */
export function endOfWeek(date: string) {
  const weekday = (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7; // Monday = 0
  return addDays(date, 6 - weekday);
}

/** The instant an event starts: its time in IST, or the start of its day. */
export function startMs(date: string, time?: string) {
  return Date.parse(`${date}T${time ?? "00:00"}:00+05:30`);
}

const formatters = {
  day: new Intl.DateTimeFormat("en-IN", { day: "numeric", timeZone: "UTC" }),
  month: new Intl.DateTimeFormat("en-IN", { month: "short", timeZone: "UTC" }),
  long: new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }),
};

const utc = (date: string) => new Date(`${date}T00:00:00Z`);

export function dayOfMonth(date: string) {
  return formatters.day.format(utc(date));
}

export function shortMonth(date: string) {
  return formatters.month.format(utc(date));
}

/** "Nov 14" */
export function monthDay(date: string) {
  return `${shortMonth(date)} ${dayOfMonth(date)}`;
}

/** "Nov 14 – 16", or "Nov 30 – Dec 2" across months. */
export function dateRange(date: string, endDate: string) {
  return date.slice(0, 7) === endDate.slice(0, 7)
    ? `${monthDay(date)} – ${dayOfMonth(endDate)}`
    : `${monthDay(date)} – ${monthDay(endDate)}`;
}

/** "Wed, 11 Nov 2026" */
export function longDate(date: string) {
  return formatters.long.format(utc(date));
}
