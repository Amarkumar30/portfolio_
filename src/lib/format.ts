/** Formats "2026" as "2026", "2026-08" as "Aug 2026", and full dates like formatDate("…", "short"). */
export function formatPartialDate(date: string) {
  if (/^\d{4}$/.test(date)) return date;
  if (/^\d{4}-\d{2}$/.test(date)) {
    return new Date(`${date}-01T00:00:00Z`).toLocaleDateString("en-IN", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  }
  return formatDate(date, "short");
}

export function formatDate(date: string, style: "long" | "short" | "month" = "long") {
  const options: Intl.DateTimeFormatOptions =
    style === "month"
      ? { month: "long", year: "numeric" }
      : { year: "numeric", month: style, day: "numeric" };

  // Dates are calendar days (YYYY-MM-DD); format in UTC so they never shift by timezone.
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-IN", { ...options, timeZone: "UTC" });
}
