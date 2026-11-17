"use client";

import { memo, useEffect, useId, useState, type CSSProperties, type FormEvent } from "react";
import { wedding } from "@/config/wedding";
import { dateParts } from "@/lib/dates";
import { useInView } from "@/lib/useInView";
import PetalShower from "../effects/PetalShower";
import Thali from "./art/Thali";
import s from "./Rsvp.module.css";

const step = (i: number) => ({ "--i": i }) as CSSProperties;
const STORE_KEY = `rsvp:${wedding.groom}-${wedding.bride}`;
const replyBy = dateParts(wedding.rsvp.respondBy);
const MAX = wedding.rsvp.maxGuests;
const list = (items: string[]) => new Intl.ListFormat("en", { type: "conjunction" }).format(items);
const eventNames = (ids: string[]) => wedding.events.filter((e) => ids.includes(e.id)).map((e) => e.name);

type Reply = {
  name: string;
  attending: boolean;
  adults: number;
  kids: number;
  events: string[];
  note: string;
};

const EMPTY: Reply = { name: "", attending: true, adults: 1, kids: 0, events: wedding.events.map((e) => e.id), note: "" };

function readSaved(): Reply | null {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return raw ? ({ ...EMPTY, ...JSON.parse(raw) } as Reply) : null;
  } catch {
    return null;
  }
}

function save(reply: Reply) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(reply));
  } catch {
    /* private mode — the reply is still sent */
  }
}

function message(r: Reply) {
  const plates = r.adults + r.kids;
  const lines = [`🙏 *RSVP — ${wedding.groom} & ${wedding.bride}'s wedding*`, `Name: ${r.name}`];
  if (r.attending) {
    lines.push(
      "Joyfully attending ✅",
      `Guests: ${r.adults} adult${r.adults === 1 ? "" : "s"}${r.kids ? `, ${r.kids} child${r.kids === 1 ? "" : "ren"}` : ""} (${plates} plate${plates === 1 ? "" : "s"})`,
      `Celebrations: ${list(eventNames(r.events))}`,
    );
  } else {
    lines.push("Sorry, we can't make it 💐");
  }
  if (r.note.trim()) lines.push(`Note: ${r.note.trim()}`);
  return lines.join("\n");
}

/** Sends the reply: WhatsApp (pre-filled message) and/or a Google Sheet, if configured. */
const whatsapp: string = wedding.rsvp.whatsapp;
const sheetUrl: string = wedding.rsvp.sheetUrl;

function send(r: Reply) {
  if (whatsapp) {
    window.open(`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message(r))}`, "_blank", "noopener,noreferrer");
  }
  if (sheetUrl) {
    const total = r.attending ? r.adults + r.kids : 0;
    const row: Record<string, string | number> = {
      time: new Date().toISOString(),
      name: r.name,
      attending: r.attending ? "yes" : "no",
      adults: r.attending ? r.adults : 0,
      kids: r.attending ? r.kids : 0,
      total,
    };
    for (const e of wedding.events) row[e.name] = r.attending && r.events.includes(e.id) ? total : 0;
    row.note = r.note.trim();
    fetch(sheetUrl, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(row) }).catch(() => {});
  }
  if (!whatsapp && !sheetUrl && process.env.NODE_ENV !== "production") {
    console.info("RSVP (set wedding.rsvp.whatsapp or sheetUrl to receive it):\n" + message(r));
  }
}

function Stepper({ label, hint, value, onChange, min, max }: { label: string; hint: string; value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <div className={s.stepper}>
      <span className={s.stepLabel}>
        {label}
        <small>{hint}</small>
      </span>
      <span className={s.stepControls}>
        <button type="button" aria-label={`One less ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)}>
          −
        </button>
        <output aria-live="polite" aria-label={label}>
          {value}
        </output>
        <button type="button" aria-label={`One more ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
          +
        </button>
      </span>
    </div>
  );
}

/** The table: one thali appears for every guest, so we know exactly how much to cook. */
function Table({ adults, kids, served, name }: { adults: number; kids: number; served: boolean; name?: string }) {
  const plates = [...Array.from({ length: adults }, () => "a"), ...Array.from({ length: kids }, () => "k")];
  return (
    <div className={`${s.table} ${served ? s.served : ""}`}>
      {name && <span className={s.placard}>Reserved · {name}</span>}
      <div className={s.plates}>
        {plates.map((kind, i) => (
          <span key={`${kind}${i}`} className={`${s.plate} ${kind === "k" ? s.kid : ""}`} style={step(i)}>
            <i className={s.steam} aria-hidden="true">
              <b />
              <b />
              <b />
            </i>
            <Thali id={`thali-${kind}${i}`} />
          </span>
        ))}
        {plates.length === 0 && <span className={s.emptyTable}>Add a guest to set the table</span>}
      </div>
    </div>
  );
}

function EventIcon({ art }: { art: string }) {
  if (art === "mehendi") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21C6 17 4 12 5 6c4 0 7 2 7 2s3-2 7-2c1 6-1 11-7 15z" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 8v11" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }
  if (art === "sangeet") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 18V5l11-2v13" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="6.5" cy="18" r="2.5" fill="currentColor" />
        <circle cx="17.5" cy="16" r="2.5" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3c3 4 6 6 6 10a6 6 0 0 1-12 0c0-4 3-6 6-10z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 11c1.5 2 2.5 3 2.5 4.5a2.5 2.5 0 0 1-5 0c0-1.5 1-2.5 2.5-4.5z" fill="currentColor" />
    </svg>
  );
}

/** Last page: RSVP with a head-count, shown as thalis on a royal table. */
function RsvpSection() {
  const [ref, inView] = useInView<HTMLElement>(0.2);
  const [reply, setReply] = useState<Reply>(EMPTY);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [celebrate, setCelebrate] = useState(0);
  const nameId = useId();
  const noteId = useId();

  // a guest who already replied sees their saved seats
  useEffect(() => {
    const saved = readSaved();
    if (saved) {
      setReply(saved);
      setSent(true);
    }
  }, []);

  const set = <K extends keyof Reply>(key: K, value: Reply[K]) => {
    setReply((r) => ({ ...r, [key]: value }));
    setError("");
  };
  const total = reply.adults + reply.kids;

  const toggleEvent = (id: string) =>
    set("events", reply.events.includes(id) ? reply.events.filter((e) => e !== id) : [...reply.events, id]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = { ...reply, name: reply.name.trim() };
    if (r.name.length < 2) return setError("Please tell us your name.");
    if (r.attending && total < 1) return setError("Add at least one guest.");
    if (r.attending && r.events.length === 0) return setError("Pick at least one celebration.");
    send(r);
    save(r);
    setReply(r);
    setSent(true);
    setCelebrate((c) => c + 1);
  };

  return (
    <section id="rsvp" ref={ref} className={`${s.section} ${inView ? s.inView : ""}`} aria-labelledby="rsvp-title">
      <div className={s.scallops} aria-hidden="true" />

      <div className={s.content}>
        <p className={`${s.reveal} ${s.kicker}`} style={step(0)}>
          RSVP · Kindly reply by {replyBy.day} {replyBy.month}
        </p>
        <h2 id="rsvp-title" className={`${s.reveal} ${s.title}`} style={step(1)}>
          Will you join us?
        </h2>
        <p className={`${s.reveal} ${s.sub}`} style={step(2)}>
          Every plate at our wedding is cooked with love. Tell us how many of you are coming, so we cook just
          enough — and not a single plate goes to waste.
        </p>

        <div className={`${s.reveal} ${s.card}`} style={step(3)}>
          {sent ? (
            <div className={s.thanks} aria-live="polite">
              {reply.attending ? (
                <>
                  <Table adults={reply.adults} kids={reply.kids} served name={reply.name} />
                  <p className={s.thanksTitle}>Your seats are saved!</p>
                  <p className={s.thanksText}>
                    We&rsquo;ve set {reply.adults + reply.kids} plate{reply.adults + reply.kids === 1 ? "" : "s"} for you at{" "}
                    {list(eventNames(reply.events))}. See you soon!
                  </p>
                </>
              ) : (
                <>
                  <p className={s.thanksTitle}>We&rsquo;ll miss you!</p>
                  <p className={s.thanksText}>Thank you for letting us know — your blessings mean the world to us.</p>
                </>
              )}
              {whatsapp && <p className={s.hint}>Your reply opened in WhatsApp — just tap send.</p>}
              <button type="button" className={s.link} onClick={() => setSent(false)}>
                Change my reply
              </button>
            </div>
          ) : (
            <form className={s.form} onSubmit={submit} noValidate>
              <label className={s.field} htmlFor={nameId}>
                <span>Your name</span>
                <input
                  id={nameId}
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. The Kapoor family"
                  value={reply.name}
                  onChange={(e) => set("name", e.target.value)}
                  maxLength={80}
                />
              </label>

              <div className={s.choice} role="radiogroup" aria-label="Will you attend?">
                <button type="button" role="radio" aria-checked={reply.attending} className={reply.attending ? s.on : ""} onClick={() => set("attending", true)}>
                  Joyfully accept
                </button>
                <button type="button" role="radio" aria-checked={!reply.attending} className={!reply.attending ? s.on : ""} onClick={() => set("attending", false)}>
                  Regretfully decline
                </button>
              </div>

              {reply.attending && (
                <>
                  <div className={s.counts}>
                    <Stepper label="Adults" hint="12 & above" value={reply.adults} min={0} max={MAX - reply.kids} onChange={(v) => set("adults", v)} />
                    <Stepper label="Children" hint="under 12" value={reply.kids} min={0} max={MAX - reply.adults} onChange={(v) => set("kids", v)} />
                  </div>
                  <Table adults={reply.adults} kids={reply.kids} served={false} />
                  <p className={s.plateCount} aria-live="polite">
                    {total === 0 ? "No plates yet" : `${total} plate${total === 1 ? "" : "s"} will be ready for you`}
                  </p>

                  <fieldset className={s.events}>
                    <legend>Which celebrations will you attend?</legend>
                    <div>
                      {wedding.events.map((ev) => {
                        const on = reply.events.includes(ev.id);
                        return (
                          <button key={ev.id} type="button" aria-pressed={on} className={on ? s.on : ""} onClick={() => toggleEvent(ev.id)}>
                            <EventIcon art={ev.art} />
                            {ev.name}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                </>
              )}

              <label className={s.field} htmlFor={noteId}>
                <span>{reply.attending ? "Dietary needs or a note for the couple" : "A blessing for the couple"}</span>
                <textarea
                  id={noteId}
                  rows={2}
                  placeholder={reply.attending ? "e.g. 2 Jain meals, please" : "Optional"}
                  value={reply.note}
                  onChange={(e) => set("note", e.target.value)}
                  maxLength={300}
                />
              </label>

              {error && (
                <p className={s.error} role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className={s.submit}>
                {reply.attending ? "Save our seats" : "Send our regrets"}
              </button>
            </form>
          )}
        </div>
      </div>

      <footer className={`${s.reveal} ${s.footer}`} style={step(4)}>
        <span className={s.hashtag}>{wedding.hashtag}</span>
        <span className={s.signoff}>{wedding.signOff}</span>
      </footer>

      {celebrate > 0 && reply.attending && (
        <PetalShower key={celebrate} count={30} seed={celebrate + 3} fixed={false} spread={1.2} minDuration={3.6} maxDuration={6} />
      )}
    </section>
  );
}

export default memo(RsvpSection);
