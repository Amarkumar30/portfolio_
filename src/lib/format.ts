export function formatDate(date: string, style: "long" | "short" | "month" = "long") {
  const options: Intl.DateTimeFormatOptions =
    style === "month"
      ? { month: "long", year: "numeric" }
      : { year: "numeric", month: style, day: "numeric" };

  // Dates are calendar days (YYYY-MM-DD); format in UTC so they never shift by timezone.
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-IN", { ...options, timeZone: "UTC" });
}
