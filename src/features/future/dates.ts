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

/** The Monday that starts the week containing `date`. */
export function startOfWeek(date: string) {
  return addDays(endOfWeek(date), -6);
}

/** Monday to Sunday of the week starting `monday`. */
export function weekDays(monday: string) {
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

/** "YYYY-MM" plus or minus some months. */
export function addMonths(month: string, count: number) {
  const [year, value] = month.split("-").map(Number);
  const total = year * 12 + (value - 1) + count;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
}

/**
 * The days shown for a month: whole weeks, Monday first, from the week holding the 1st to the
 * week holding the last day. 4 to 6 rows of 7.
 */
export function monthGrid(month: string) {
  const first = `${month}-01`;
  const last = addDays(`${addMonths(month, 1)}-01`, -1);
  const start = startOfWeek(first);
  const end = endOfWeek(last);
  return Array.from({ length: daysBetween(start, end) + 1 }, (_, index) => addDays(start, index));
}

const monthTitle = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });
const dayTitle = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const weekdayName = new Intl.DateTimeFormat("en-IN", { weekday: "long", timeZone: "UTC" });

/** "November 2026" */
export function monthLabel(month: string) {
  return monthTitle.format(utc(`${month}-01`));
}

/** "Tue, 24 Nov" */
export function shortDay(date: string) {
  return dayTitle.format(utc(date));
}

/** "Tuesday" */
export function weekdayLabel(date: string) {
  return weekdayName.format(utc(date));
}

/** "23 – 29 Nov", or "30 Nov – 6 Dec" across months. */
export function weekLabel(monday: string) {
  const sunday = addDays(monday, 6);
  return monday.slice(0, 7) === sunday.slice(0, 7)
    ? `${dayOfMonth(monday)} – ${dayOfMonth(sunday)} ${shortMonth(sunday)}`
    : `${dayOfMonth(monday)} ${shortMonth(monday)} – ${dayOfMonth(sunday)} ${shortMonth(sunday)}`;
}

/** The IST hour (0–23) at an instant. */
export function istHour(ms: number) {
  return Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: "Asia/Kolkata" }).format(new Date(ms)));
}
