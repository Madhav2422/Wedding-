"use client";

import { memo, useCallback, useState, type CSSProperties } from "react";
import { wedding } from "@/config/wedding";
import { seeded } from "@/lib/random";
import { n, petal, ring as ringAngles } from "@/lib/svg";
import { useInView } from "@/lib/useInView";
import PetalShower from "../effects/PetalShower";
import Bowl, { type Spot } from "./aekibeki/Bowl";
import s from "./AekiBeki.module.css";

const step = (i: number) => ({ "--i": i }) as CSSProperties;
/** Places an overlay at a spot in the milk (the milk's radius is 43% of the bowl). */
const at = (p: Spot) => ({ "--x": n(p.x), "--y": n(p.y) }) as CSSProperties;
const COINS = 3;

/** Sparks that fly out of the ring when it is found. */
const SPARKS = (() => {
  const rnd = seeded(31);
  return Array.from({ length: 16 }, (_, i) => {
    const a = (i / 16) * Math.PI * 2 + rnd() * 0.3;
    const d = 18 + rnd() * 16;
    return {
      "--sx": `${n(Math.cos(a) * d)}cqw`,
      "--sy": `${n(Math.sin(a) * d)}cqw`,
      "--d": `${n(rnd() * 0.25)}s`,
    } as CSSProperties;
  });
})();

/** The engraved brass rim of the thali (the milk canvas sits in its well). */
function ThaliRim({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ab-brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1b8" />
          <stop offset=".22" stopColor="#e6b955" />
          <stop offset=".5" stopColor="#a8761f" />
          <stop offset=".76" stopColor="#f0cd73" />
          <stop offset="1" stopColor="#7d5212" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="49.6" fill="url(#ab-brass)" />
      <circle cx="50" cy="50" r="49.6" fill="none" stroke="#5c3a0c" strokeWidth=".5" />
      <circle cx="50" cy="50" r="48.2" fill="none" stroke="#fff3c4" strokeOpacity=".5" strokeWidth=".3" />
      <g transform="translate(50 50)">
        {ringAngles(24).map((a) => (
          <path key={a} d={petal(44.4, 48.4, 1.6)} transform={`rotate(${a})`} fill="#7d5212" fillOpacity=".5" />
        ))}
        {ringAngles(24, 7.5).map((a) => (
          <circle key={a} cy={-46.3} r=".6" fill="#fff6d6" transform={`rotate(${a})`} />
        ))}
      </g>
      <circle cx="50" cy="50" r="43.7" fill="none" stroke="#4d3008" strokeWidth="1.2" />
      <circle cx="50" cy="50" r="43" fill="#efe2c6" />
      <path d="M13.5 31 A41 41 0 0 1 39 9.2" fill="none" stroke="#fffbe6" strokeOpacity=".8" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

/**
 * After the pheras — "Aeki Beki", the ring-finding game played at Gujarati weddings: a ring
 * (and a few coins) hidden in a thali of milk and petals. Guests swirl the petals to find it.
 */
function AekiBekiSection() {
  const [ref, inView] = useInView<HTMLElement>(0.3);
  const [round, setRound] = useState(0);
  const [revealSignal, setRevealSignal] = useState(0);
  const [touched, setTouched] = useState(false);
  const [shining, setShining] = useState<Spot | null>(null);
  const [coins, setCoins] = useState<Spot[]>([]);
  const [found, setFound] = useState<Spot | null>(null);
  const [ringSrc, setRingSrc] = useState("");

  const onTouch = useCallback(() => setTouched(true), []);
  const onShining = useCallback((on: boolean, spot?: Spot) => setShining(on && spot ? spot : null), []);
  const onCoin = useCallback((p: Spot) => {
    setCoins((c) => [...c, p]);
    navigator.vibrate?.(25);
  }, []);
  const onFound = useCallback((p: Spot) => {
    setFound(p);
    setShining(null);
    navigator.vibrate?.([40, 50, 70]);
  }, []);
  const again = () => {
    setFound(null);
    setCoins([]);
    setShining(null);
    setRound((r) => r + 1);
  };

  let status = "Swirl the petals with your finger";
  if (shining) status = "Something is shining in the milk… tap it! ✨";
  else if (coins.length) status = `A silver coin! 🪙 Lucky — but the ring is still hiding (${coins.length}/${COINS} coins)`;
  else if (touched) status = "Keep swirling — the ring is somewhere under the petals…";

  return (
    <section
      id="aeki-beki"
      ref={ref}
      className={`${s.section} ${inView ? s.inView : ""}`}
      aria-labelledby="aeki-title"
    >
      <div className={s.pearls} aria-hidden="true" />
      <div className={s.glow} aria-hidden="true" />

      <div className={s.content}>
        <p className={`${s.reveal} ${s.kicker}`} style={step(0)}>
          After the pheras · a little game
        </p>
        <h2 id="aeki-title" className={`${s.reveal} ${s.title}`} style={step(1)}>
          <span className={s.deva} lang="hi">
            एकी बेकी
          </span>
          <span className={s.name}>Aeki Beki</span>
        </h2>
        <p className={`${s.reveal} ${s.sub}`} style={step(2)}>
          Find the ring hidden in the milk — before {wedding.groom} &amp; {wedding.bride} do!
        </p>

        <div className={`${s.reveal} ${s.stage}`} style={step(3)}>
          <div className={`${s.bowl} ${touched ? s.touched : ""} ${found ? s.done : ""}`}>
            <span className={s.bowlShadow} aria-hidden="true" />
            <ThaliRim className={s.rim} />
            <Bowl
              className={s.milk}
              round={round}
              revealSignal={revealSignal}
              found={!!found}
              onShining={onShining}
              onCoin={onCoin}
              onFound={onFound}
              onTouch={onTouch}
              onRingArt={setRingSrc}
            />
            <span className={s.sheen} aria-hidden="true" />
            <span className={s.hint} aria-hidden="true" />
            {shining && !found && <span className={s.glint} style={at(shining)} aria-hidden="true" />}
            {coins.map((p, i) => (
              <span key={`${round}-${i}`} className={s.coinFlip} style={at(p)} aria-hidden="true" />
            ))}
            {found && (
              <div className={s.win} style={at(found)} aria-hidden="true">
                <span className={s.rays} />
                <span className={s.halo} />
                {ringSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className={s.ringImg} src={ringSrc} alt="" />
                ) : (
                  <span className={s.ringImg}>💍</span>
                )}
                {SPARKS.map((style, i) => (
                  <span key={i} className={s.spark} style={style} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={s.after} aria-live="polite">
          {found ? (
            <>
              <p className={s.winTitle}>You found the ring! 💍</p>
              <p className={s.winSub}>
                Tradition says whoever finds it first will rule the home… looks like that&rsquo;s you.
                Shh, don&rsquo;t tell {wedding.groom}! 😉
              </p>
              <button type="button" className={s.again} onClick={again}>
                Play again
              </button>
            </>
          ) : (
            <>
              <p className={s.status}>{status}</p>
              <button type="button" className={s.showBtn} onClick={() => setRevealSignal((v) => v + 1)}>
                or show me the ring
              </button>
            </>
          )}
        </div>
      </div>

      {found && (
        <PetalShower key={round} count={30} seed={round + 41} fixed={false} spread={1.2} minDuration={3.6} maxDuration={6} />
      )}
    </section>
  );
}

export default memo(AekiBekiSection);
