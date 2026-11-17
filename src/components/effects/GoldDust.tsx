import { memo, type CSSProperties } from "react";
import { seeded } from "@/lib/random";
import { n } from "@/lib/svg";
import s from "./effects.module.css";

/** Slowly rising, twinkling specks of gold. */
function GoldDust({ count = 24, seed = 1, className }: { count?: number; seed?: number; className?: string }) {
  const rnd = seeded(seed);
  const motes = Array.from({ length: count }, () => ({
    left: n(rnd() * 100),
    size: n(2 + rnd() * 4),
    dur: n(9 + rnd() * 10),
    delay: n(-rnd() * 18),
    drift: n((rnd() - 0.5) * 90),
    op: n(0.45 + rnd() * 0.55),
  }));

  return (
    <div className={`${s.dust} ${className ?? ""}`} aria-hidden="true">
      {motes.map((m, i) => (
        <span
          key={i}
          style={
            {
              left: `${m.left}%`,
              width: m.size,
              height: m.size,
              animationDuration: `${m.dur}s`,
              animationDelay: `${m.delay}s`,
              "--drift": `${m.drift}px`,
              "--op": m.op,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default memo(GoldDust);
