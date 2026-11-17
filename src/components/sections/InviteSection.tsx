"use client";

import { memo, type CSSProperties } from "react";
import { wedding } from "@/config/wedding";
import { useInView } from "@/lib/useInView";
import Mandala from "../hero/Mandala";
import { Flourish } from "../hero/Ornaments";
import CornerVine from "./art/CornerVine";
import Kalash from "./art/Kalash";
import s from "./Invite.module.css";

const step = (i: number) => ({ "--i": i }) as CSSProperties;

// The card's arched (Mughal) silhouette, stretched to whatever size the card is.
const OUTER = "M1,139 V34 Q1,25 10,23.5 C22,21.5 34,16 42,8 Q47,3 50,1 Q53,3 58,8 C66,16 78,21.5 90,23.5 Q99,25 99,34 V139 Z";
const INNER = "M4.5,135.5 V35 Q4.5,28.5 12,27 C24,25 36,19.5 44,11.5 Q48,7 50,5 Q52,7 56,11.5 C64,19.5 76,25 88,27 Q95.5,28.5 95.5,35 V135.5 Z";

/** Page 2 — the formal invitation from the family. */
function InviteSection() {
  const [ref, inView] = useInView<HTMLElement>(0.2);

  return (
    <section id="invite" ref={ref} className={`${s.section} ${inView ? s.inView : ""}`} aria-label="We invite you">
      <div className={s.pattern} />
      <div className={s.mandalaWrap}>
        <Mandala className={s.mandala} />
      </div>

      <div className={s.card}>
        <svg className={s.frame} viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="inv-paper" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fffaf0" />
              <stop offset="1" stopColor="#f8ebd2" />
            </linearGradient>
            <filter id="inv-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.2" />
            </filter>
          </defs>
          <path d={OUTER} fill="#6a0f22" opacity=".16" transform="translate(0 3)" filter="url(#inv-shadow)" />
          <path d={OUTER} fill="url(#inv-paper)" stroke="#b8862b" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
          <path d={INNER} fill="none" stroke="#c8952e" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
        </svg>
        <CornerVine className={`${s.vine} ${s.vineL}`} />
        <CornerVine className={`${s.vine} ${s.vineR}`} />

        <div className={s.inner}>
          <div className={`${s.reveal} ${s.kalashWrap}`} style={step(0)}>
            <span className={s.halo} />
            <Kalash className={s.kalash} />
          </div>

          <p className={`${s.reveal} ${s.blessing}`} style={step(1)}>
            {wedding.blessing}
          </p>
          <h2 className={`${s.reveal} ${s.title}`} style={step(2)}>
            We Invite You
          </h2>
          <div className={s.reveal} style={step(3)}>
            <Flourish className={s.flourish} />
          </div>

          <p className={`${s.reveal} ${s.hosts}`} style={step(4)}>
            {wedding.hosts}
          </p>
          <p className={`${s.reveal} ${s.body}`} style={step(5)}>
            {wedding.inviteLine}
          </p>

          <p className={`${s.reveal} ${s.name}`} style={step(6)}>
            {wedding.groom}
          </p>
          <p className={`${s.reveal} ${s.with}`} style={step(7)}>
            with
          </p>
          <p className={`${s.reveal} ${s.name}`} style={step(8)}>
            {wedding.bride}
          </p>
          <p className={`${s.reveal} ${s.family}`} style={step(9)}>
            {wedding.brideFamily}
          </p>

          <p className={`${s.reveal} ${s.closing}`} style={step(10)}>
            {wedding.closingLine}
          </p>
        </div>
      </div>
    </section>
  );
}

export default memo(InviteSection);
