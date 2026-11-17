"use client";

import { memo, useCallback, useState, type CSSProperties } from "react";
import { wedding, weddingEvent } from "@/config/wedding";
import { seeded } from "@/lib/random";
import { n } from "@/lib/svg";
import { useInView } from "@/lib/useInView";
import PetalShower from "../effects/PetalShower";
import ScratchHeart from "./ScratchHeart";
import s from "./Scratch.module.css";

const step = (i: number) => ({ "--i": i }) as CSSProperties;

/** Little gold hearts drifting up through the section. */
const FLOATERS = (() => {
  const rnd = seeded(23);
  return Array.from({ length: 14 }, () => ({
    left: `${n(rnd() * 100)}%`,
    "--size": `${n(8 + rnd() * 14)}px`,
    "--drift": `${n((rnd() - 0.5) * 60)}px`,
    animationDuration: `${n(10 + rnd() * 10)}s`,
    animationDelay: `${n(-rnd() * 20)}s`,
    opacity: n(0.25 + rnd() * 0.45),
  })) as CSSProperties[];
})();

/** Page 3 — scratch the golden heart to reveal the wedding date. */
function ScratchSection() {
  const [ref, inView] = useInView<HTMLElement>(0.35);
  const [revealed, setRevealed] = useState(false);
  const onReveal = useCallback(() => setRevealed(true), []);

  return (
    <section id="date" ref={ref} className={`${s.section} ${inView ? s.inView : ""}`} aria-label="Scratch to reveal the date">
      <div className={s.parapet} aria-hidden="true" />
      <div className={s.glow} aria-hidden="true" />
      <div className={s.floaters} aria-hidden="true">
        {FLOATERS.map((style, i) => (
          <span key={i} className={s.floater} style={style} />
        ))}
      </div>

      <div className={s.content}>
        <p className={`${s.reveal} ${s.kicker}`} style={step(0)}>
          A little surprise
        </p>
        <h2 className={`${s.reveal} ${s.title}`} style={step(1)}>
          Scratch the Heart
        </h2>
        <p className={`${s.reveal} ${s.sub}`} style={step(2)}>
          to discover the day we begin our forever
        </p>

        <div className={s.reveal} style={step(3)}>
          <ScratchHeart active={inView} revealed={revealed} onReveal={onReveal} />
        </div>

        <div className={`${s.after} ${revealed ? s.afterShow : ""}`} aria-live="polite">
          <p className={s.afterTitle}>We can&rsquo;t wait to celebrate with you!</p>
          <p className={s.afterSub}>
            {weddingEvent.venue} · {wedding.city}
          </p>
          <a className={s.next} href="#countdown">
            See the countdown
            <i aria-hidden="true" />
          </a>
        </div>
      </div>

      {revealed && <PetalShower count={34} seed={5} fixed={false} spread={1.4} minDuration={4} maxDuration={6.5} />}
    </section>
  );
}

export default memo(ScratchSection);
