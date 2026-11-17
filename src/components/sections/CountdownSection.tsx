"use client";

import { memo, type CSSProperties } from "react";
import { wedding, weddingDate, weddingEvent } from "@/config/wedding";
import { calendarEntry, downloadIcs, googleCalendarUrl } from "@/lib/calendar";
import { seeded } from "@/lib/random";
import { n } from "@/lib/svg";
import { useCountdown } from "@/lib/useCountdown";
import { useInView } from "@/lib/useInView";
import Skyline from "./art/Skyline";
import s from "./Countdown.module.css";

const step = (i: number) => ({ "--i": i }) as CSSProperties;

const entry = calendarEntry(weddingEvent);
const googleUrl = googleCalendarUrl(entry);
const saveIcs = () => downloadIcs([entry], `${wedding.groom}-${wedding.bride}-wedding.ics`);
const nextPage = wedding.events[0]?.id ?? "rsvp";

const STARS = (() => {
  const rnd = seeded(31);
  return Array.from({ length: 64 }, () => ({
    left: `${n(rnd() * 100)}%`,
    top: `${n(rnd() * 62)}%`,
    "--size": `${n(1 + rnd() * 2.2)}px`,
    animationDuration: `${n(2.5 + rnd() * 4)}s`,
    animationDelay: `${n(-rnd() * 6)}s`,
  })) as CSSProperties[];
})();

/** Sky lanterns drift up either side of the text, never across it. */
const LANTERNS = (() => {
  const rnd = seeded(57);
  return Array.from({ length: 12 }, (_, i) => {
    const size = n(14 + rnd() * 20);
    const side = i % 2 === 0 ? 2 + rnd() * 16 : 82 + rnd() * 16;
    return {
      left: `${n(side)}%`,
      "--size": `${size}px`,
      "--drift": `${n((i % 2 === 0 ? -1 : 1) * rnd() * 40)}px`,
      animationDuration: `${n(22 + rnd() * 18)}s`,
      animationDelay: `${n(-rnd() * 40)}s`,
      opacity: n(0.55 + (size / 34) * 0.45),
    } as CSSProperties;
  });
})();

function Unit({ label, value }: { label: string; value: number | null }) {
  const text = value === null ? "--" : String(value).padStart(2, "0");
  return (
    <div className={s.unit}>
      <span className={s.digits}>
        {/* a new key on every change replays the roll-in animation */}
        <span key={text} className={s.digit}>
          {text}
        </span>
      </span>
      <span className={s.label}>{label}</span>
    </div>
  );
}

/** Page 4 — the countdown, under a night sky over the lake palace. */
function CountdownSection() {
  const [ref, inView] = useInView<HTMLElement>(0.25);
  const t = useCountdown(weddingEvent.start, inView);

  return (
    <section id="countdown" ref={ref} className={`${s.section} ${inView ? s.inView : ""}`} aria-label="Countdown to the wedding">
      <div className={s.sky} aria-hidden="true">
        {STARS.map((style, i) => (
          <span key={i} className={s.star} style={style} />
        ))}
        <span className={s.moon} />
      </div>
      <div className={s.lanterns} aria-hidden="true">
        {LANTERNS.map((style, i) => (
          <span key={i} className={s.lantern} style={style} />
        ))}
      </div>
      <Skyline className={s.skyline} />
      <div className={s.water} aria-hidden="true" />

      <div className={s.content}>
        <p className={`${s.reveal} ${s.kicker}`} style={step(0)}>
          The countdown begins
        </p>
        <h2 className={`${s.reveal} ${s.title}`} style={step(1)}>
          Counting Every Moment
        </h2>
        <p className={`${s.reveal} ${s.sub}`} style={step(2)}>
          until {wedding.groom} &amp; {wedding.bride} tie the knot
        </p>

        {t?.done ? (
          <p className={`${s.reveal} ${s.begun}`} style={step(3)}>
            ✦ The celebrations have begun ✦
          </p>
        ) : (
          <div className={`${s.reveal} ${s.countdown}`} style={step(3)} role="timer" aria-label="Time left until the wedding">
            <Unit label="Days" value={t ? t.days : null} />
            <Unit label="Hours" value={t ? t.hours : null} />
            <Unit label="Minutes" value={t ? t.minutes : null} />
            <Unit label="Seconds" value={t ? t.seconds : null} />
          </div>
        )}

        <p className={`${s.reveal} ${s.when}`} style={step(4)}>
          {weddingDate.weekday}, {weddingDate.day} {weddingDate.month} {weddingDate.year} · {weddingDate.time}
        </p>
        <p className={`${s.reveal} ${s.where}`} style={step(5)}>
          {weddingEvent.venue}, {wedding.city}
        </p>

        <div className={`${s.reveal} ${s.actions}`} style={step(6)}>
          <a className={s.btn} href={googleUrl} target="_blank" rel="noopener noreferrer">
            <CalendarIcon />
            Google Calendar
          </a>
          <button type="button" className={s.btn} onClick={saveIcs}>
            <CalendarIcon />
            Apple / Outlook
          </button>
        </div>
      </div>

      <div className={`${s.reveal} ${s.footer}`} style={step(7)}>
        <a className={s.next} href={`#${nextPage}`}>
          The celebrations
          <i aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 17.2c-2.4-1.6-3.6-2.9-3.6-4.2 0-.9.7-1.6 1.6-1.6.8 0 1.4.4 2 1.2.6-.8 1.2-1.2 2-1.2.9 0 1.6.7 1.6 1.6 0 1.3-1.2 2.6-3.6 4.2z" fill="currentColor" />
    </svg>
  );
}

export default memo(CountdownSection);
