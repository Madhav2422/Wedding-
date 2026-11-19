"use client";

import { memo, useEffect, useState, type CSSProperties } from "react";
import { seeded } from "@/lib/random";
import { n } from "@/lib/svg";
import s from "./effects.module.css";

type Props = {
  count: number;
  seed?: number;
  /** Seconds before the first petal falls. */
  startDelay?: number;
  /** Petals start randomly within this many seconds. */
  spread?: number;
  minDuration?: number;
  maxDuration?: number;
  /** Keep falling forever (ambient) instead of a one-time shower. */
  loop?: boolean;
  /** Cover the whole screen (fixed) or just the parent (absolute). */
  fixed?: boolean;
  className?: string;
};

const KINDS = [s.rose, s.rose, s.pink, s.marigold, s.marigold, s.yellow];

/** Rose & marigold petals fluttering down. */
function PetalShower({
  count,
  seed = 1,
  startDelay = 0,
  spread = 3,
  minDuration = 5,
  maxDuration = 9,
  loop = false,
  fixed = true,
  className,
}: Props) {
  // A one-time shower removes itself once the last petal has landed, so dozens of invisible
  // petals don't stay on top of the page (each is a GPU layer the phone keeps compositing).
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (loop) return;
    const t = window.setTimeout(() => setDone(true), (startDelay + spread + maxDuration) * 1000 + 300);
    return () => window.clearTimeout(t);
  }, [loop, startDelay, spread, maxDuration]);

  if (done) return null;

  const rnd = seeded(seed);
  const petals = Array.from({ length: count }, () => {
    const size = n(7 + rnd() * 9);
    return {
      left: n(rnd() * 100),
      size,
      kind: KINDS[Math.floor(rnd() * KINDS.length)],
      delay: n(startDelay + rnd() * spread),
      dur: n(minDuration + rnd() * (maxDuration - minDuration)),
      drift: n((rnd() - 0.5) * 36),
      spin: n(rnd() * 720 - 360),
    };
  });

  return (
    <div className={`${s.petals} ${fixed ? s.fixed : ""} ${className ?? ""}`} aria-hidden="true">
      {petals.map((p, i) => (
        <span
          key={i}
          className={`${s.petal} ${p.kind}`}
          style={
            {
              left: `${p.left}%`,
              width: n(p.size * 0.82),
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
              animationIterationCount: loop ? "infinite" : 1,
              "--drift": `${p.drift}vw`,
              "--spin": `${p.spin}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default memo(PetalShower);
