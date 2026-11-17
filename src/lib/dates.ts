const format = (iso: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", ...options }).format(new Date(iso));

/** Date pieces, always formatted in Indian time so the server and the browser agree. */
export function dateParts(iso: string) {
  return {
    weekday: format(iso, { weekday: "long" }),
    day: format(iso, { day: "numeric" }),
    month: format(iso, { month: "long" }),
    monthNumber: format(iso, { month: "2-digit" }),
    year: format(iso, { year: "numeric" }),
    time: format(iso, { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase(),
  };
}
