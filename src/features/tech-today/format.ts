const TIME_ZONE = "Asia/Kolkata";

/** "7 Nov, 1:30 pm" in IST. */
export function formatIst(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

/** Today's date in IST as YYYY-MM-DD; en-CA formats that way. */
export function istDate(now: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
}

/** Whole days from one YYYY-MM-DD date to another. */
export function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

/** Short and spoken forms: { short: "3h ago", spoken: "3 hours ago" }. */
export function relativeTime(iso: string, now: Date) {
  const minutes = Math.max(0, Math.floor((now.getTime() - Date.parse(iso)) / 60_000));
  const unit = (count: number, name: string) => `${count} ${name}${count === 1 ? "" : "s"} ago`;

  if (minutes < 1) return { short: "just now", spoken: "just now" };
  if (minutes < 60) return { short: `${minutes}m ago`, spoken: unit(minutes, "minute") };

  const hours = Math.floor(minutes / 60);
  if (hours < 48) return { short: `${hours}h ago`, spoken: unit(hours, "hour") };

  const days = Math.floor(hours / 24);
  return { short: `${days}d ago`, spoken: unit(days, "day") };
}
