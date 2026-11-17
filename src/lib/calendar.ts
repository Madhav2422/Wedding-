import { wedding, type WeddingEvent } from "@/config/wedding";

/** 2026-12-12T13:30:00.000Z → 20261212T133000Z */
const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export type CalendarEntry = {
  uid: string;
  title: string;
  start: string;
  end: string;
  location: string;
  details: string;
};

export function calendarEntry(e: WeddingEvent): CalendarEntry {
  return {
    uid: `${e.id}-${stamp(e.start)}-${wedding.groom}-${wedding.bride}@wedding`,
    title: `${e.name} · ${wedding.groom} & ${wedding.bride}`,
    start: e.start,
    end: e.end,
    location: `${e.venue}, ${e.address}`,
    details: [e.tagline, `Dress code: ${e.dressCode}`, wedding.hashtag].join("\n"),
  };
}

/** Opens Google Calendar with the event pre-filled. */
export function googleCalendarUrl(c: CalendarEntry) {
  return `https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: "TEMPLATE",
    text: c.title,
    dates: `${stamp(c.start)}/${stamp(c.end)}`,
    location: c.location,
    details: c.details,
  }).toString()}`;
}

/** Downloads an .ics file (Apple Calendar, Outlook, …) holding one or more events. */
export function downloadIcs(entries: CalendarEntry[], filename: string) {
  const escape = (s: string) => s.replace(/[\\,;]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
  const now = stamp(new Date().toISOString());
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invitation//EN",
    ...entries.flatMap((c) => [
      "BEGIN:VEVENT",
      `UID:${c.uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${stamp(c.start)}`,
      `DTEND:${stamp(c.end)}`,
      `SUMMARY:${escape(c.title)}`,
      `LOCATION:${escape(c.location)}`,
      `DESCRIPTION:${escape(c.details)}`,
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ].join("\r\n");

  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** One button for everyone: Apple devices get an .ics (opens Calendar), others get Google Calendar. */
export function addToCalendar(e: WeddingEvent) {
  const entry = calendarEntry(e);
  if (/iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)) {
    downloadIcs([entry], `${wedding.groom}-${wedding.bride}-${e.id}.ics`);
  } else {
    window.open(googleCalendarUrl(entry), "_blank", "noopener,noreferrer");
  }
}

/** Google Maps search for the venue (opens the Maps app on phones). */
export const mapsUrl = (e: WeddingEvent) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.venue}, ${e.address}`)}`;
