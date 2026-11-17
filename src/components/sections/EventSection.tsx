"use client";

import { memo, type CSSProperties } from "react";
import type { WeddingEvent } from "@/config/wedding";
import { addToCalendar, mapsUrl } from "@/lib/calendar";
import { dateParts } from "@/lib/dates";
import { seeded } from "@/lib/random";
import { n } from "@/lib/svg";
import { useInView } from "@/lib/useInView";
import ArchWindow from "./scenes/ArchWindow";
import HennaScene from "./scenes/HennaScene";
import KnotScene from "./scenes/KnotScene";
import Painting from "./scenes/Painting";
import RhythmScene from "./scenes/RhythmScene";
import s from "./Event.module.css";

const SCENES = { mehendi: HennaScene, sangeet: RhythmScene, wedding: KnotScene };
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

const step = (i: number) => ({ "--i": i }) as CSSProperties;

/** A few motes drifting through the whole page (petals, sparkles or embers by theme). */
const MOTES = (() => {
  const rnd = seeded(404);
  return Array.from({ length: 10 }, () => ({
    left: `${n(rnd() * 100)}%`,
    "--s": `${n(5 + rnd() * 7)}px`,
    "--drift": `${n((rnd() - 0.5) * 80)}px`,
    animationDuration: `${n(11 + rnd() * 9)}s`,
    animationDelay: `${n(-rnd() * 20)}s`,
  })) as CSSProperties[];
})();

/** One celebration "page": its animated scene in a palace window, and the details card. */
function EventSection({ event, index }: { event: WeddingEvent; index: number }) {
  const [ref, inView] = useInView<HTMLElement>(0.28);
  const Scene = SCENES[event.art] ?? KnotScene;
  const when = dateParts(event.start);
  const titleId = `${event.id}-title`;

  return (
    <section
      id={event.id}
      ref={ref}
      className={`${s.section} ${s[event.art]} ${index % 2 ? s.flip : ""} ${inView ? s.inView : ""}`}
      aria-labelledby={titleId}
    >
      <div className={s.motes} aria-hidden="true">
        {MOTES.map((style, i) => (
          <span key={i} style={style} />
        ))}
      </div>

      <div className={s.layout}>
        <div className={`${s.reveal} ${s.artCol}`} style={step(0)}>
          <div className={s.halo} aria-hidden="true" />
          <ArchWindow id={event.id}>
            {event.video ? (
              inView && <video className={s.video} src={event.video} autoPlay muted loop playsInline preload="metadata" />
            ) : event.image ? (
              <Painting image={event.image} art={event.art} active={inView} />
            ) : (
              <Scene active={inView} />
            )}
          </ArchWindow>
          {event.image && !event.video && <p className={s.credit}>{event.image.credit}</p>}
        </div>

        <div className={s.details}>
          <p className={`${s.reveal} ${s.kicker}`} style={step(1)}>
            <span className={s.numeral}>{ROMAN[index] ?? index + 1}</span>
            {event.kicker}
          </p>
          <h2 id={titleId} className={`${s.reveal} ${s.title}`} style={step(2)}>
            <span className={s.deva} lang="hi">
              {event.deva}
            </span>
            <span className={s.name}>{event.name}</span>
          </h2>
          <p className={`${s.reveal} ${s.tagline}`} style={step(3)}>
            {event.tagline}
          </p>

          <div className={`${s.reveal} ${s.date}`} style={step(4)}>
            <span className={s.dateSide}>{when.weekday}</span>
            <span className={s.dateDay}>{when.day}</span>
            <span className={s.dateSide}>
              {when.month} {when.year}
            </span>
          </div>
          <p className={`${s.reveal} ${s.time}`} style={step(5)}>
            {when.time} onwards
          </p>

          <p className={`${s.reveal} ${s.venue}`} style={step(6)}>
            {event.venue}
          </p>
          <p className={`${s.reveal} ${s.address}`} style={step(6)}>
            {event.address}
          </p>

          {event.highlights.length > 0 && (
            <ul className={`${s.reveal} ${s.highlights}`} style={step(7)}>
              {event.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}
          <p className={`${s.reveal} ${s.dress}`} style={step(8)}>
            <span>Dress code</span>
            {event.dressCode}
          </p>

          <div className={`${s.reveal} ${s.actions}`} style={step(9)}>
            <a className={s.btn} href={mapsUrl(event)} target="_blank" rel="noopener noreferrer">
              <PinIcon />
              Directions
            </a>
            <button type="button" className={s.btn} onClick={() => addToCalendar(event)}>
              <CalendarIcon />
              Save the date
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" focusable="false">
      <path d="M12 21.5s-6.5-6.1-6.5-11.3a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21.5 12 21.5z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="10.2" r="2.4" fill="currentColor" />
    </svg>
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

export default memo(EventSection);
