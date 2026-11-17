import type { CSSProperties } from "react";
import { wedding } from "@/config/wedding";
import GoldDust from "../effects/GoldDust";
import PetalShower from "../effects/PetalShower";
import Garlands from "./Garlands";
import Mandala from "./Mandala";
import { ArchOutline, Flourish } from "./Ornaments";
import s from "./Hero.module.css";

type Props = {
  /** True once the gates start opening. */
  revealed: boolean;
  /** True once the gates are gone and the guest has "arrived". */
  settled: boolean;
  /** Seconds after `revealed` when the walk through the arch begins. */
  delay: number;
  /** How long the walk through the arch takes (seconds). */
  approach: number;
};

/** Position of an element in the staggered entrance (0 = first). */
const step = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * Page 1 — the names, framed by a palace arch, revealed behind the gates.
 * All entrance animations are CSS (transform/opacity) so they run on the GPU.
 */
export default function Hero({ revealed, settled, delay, approach }: Props) {
  const classes = [s.hero, revealed && s.revealed, settled && s.settled].filter(Boolean).join(" ");
  const timing = { "--base": `${delay}s`, "--approach": `${approach}s` } as CSSProperties;

  return (
    <section id="welcome" className={classes} style={timing} aria-label={`${wedding.groom} and ${wedding.bride}`}>
      <div className={s.bg} />
      <Mandala className={`${s.corner} ${s.cornerL}`} />
      <Mandala className={`${s.corner} ${s.cornerR}`} />

      {/* Everything in here grows gently towards you as you walk through the arch. */}
      <div className={s.scaler}>
        <div className={s.mandalaWrap}>
          <Mandala className={s.mandala} />
        </div>
        <ArchOutline className={s.arch} pathClassName={s.archPath} />

        <div className={s.content}>
          <p className={`${s.item} ${s.invocation}`} style={step(0)} lang="hi">
            {wedding.invocation}
          </p>

          <h1 className={s.names}>
            <span className={`${s.item} ${s.nameIn}`} style={step(1)}>
              <span className={s.name}>{wedding.groom}</span>
            </span>
            <span className={`${s.item} ${s.amp}`} style={step(2)}>
              <i />
              &amp;
              <i />
            </span>
            <span className={`${s.item} ${s.nameIn}`} style={step(3)}>
              <span className={s.name}>{wedding.bride}</span>
            </span>
          </h1>

          <div className={s.item} style={step(4)}>
            <Flourish className={s.flourish} />
          </div>

          <p className={`${s.item} ${s.tagline}`} style={step(5)}>
            {wedding.tagline}
          </p>
        </div>
      </div>

      <Garlands />

      <a className={s.scrollCue} href="#invite" aria-label="Scroll to the invitation">
        <span>Scroll</span>
        <i />
      </a>

      {settled && (
        <PetalShower count={12} seed={9} loop fixed={false} startDelay={2} spread={14} minDuration={11} maxDuration={17} />
      )}
      <GoldDust count={16} seed={5} className={s.dust} />
    </section>
  );
}
