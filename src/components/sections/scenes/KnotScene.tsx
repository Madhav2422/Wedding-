import { memo, type CSSProperties } from "react";
import { seeded } from "@/lib/random";
import { n, petal, ring } from "@/lib/svg";
import s from "./scenes.module.css";

/*
 * The wedding — "gathbandhan, the sacred knot". A crimson dupatta and a golden patka flow
 * in from either side and tie themselves into a knot; a spark bursts, and seven diyas
 * light one by one — one for each of the seven vows — as rose petals fall.
 */

const at = (d: number) => ({ "--d": `${n(d)}s` }) as CSSProperties;

/* The two cloths: in from the top corners, a loop each side of the knot, tails falling. */
const DUPATTA =
  "M-30,34C60,44 140,118 186,190C150,150 104,168 116,206C126,240 176,228 200,206C222,222 236,272 226,330C223,346 229,358 236,370";
const PATKA =
  "M430,34C340,44 260,118 214,190C250,150 296,168 284,206C274,240 224,228 200,206C178,222 164,272 174,330C177,346 171,358 164,370";

function Cloth({ d, body, edge, thread, delay }: { d: string; body: string; edge: string; thread: string; delay: number }) {
  return (
    <g>
      <path d={d} pathLength={1} className={s.cloth} style={{ ...at(delay), stroke: edge, strokeWidth: 21 }} />
      <path d={d} pathLength={1} className={s.cloth} style={{ ...at(delay), stroke: body, strokeWidth: 16 }} />
      <path d={d} className={s.thread} style={{ ...at(delay + 2.4), stroke: thread }} />
    </g>
  );
}

function Tassel({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <g className={s.bloom} style={at(delay)}>
      <circle cx={x} cy={y + 4} r={4.6} fill="url(#k-gold)" />
      <path d={`M${x - 4},${y + 8}L${x - 6},${y + 26}M${x},${y + 9}V${y + 28}M${x + 4},${y + 8}L${x + 6},${y + 26}`} stroke="#f6d27a" strokeWidth={1.6} strokeLinecap="round" />
    </g>
  );
}

const DIYAS = Array.from({ length: 7 }, (_, i) => {
  const t = i / 6;
  return { x: n(84 + t * 232), y: n(436 - Math.sin(t * Math.PI) * 18) };
});

function Diya({ x, y, i }: { x: number; y: number; i: number }) {
  const delay = 3.6 + i * 0.38;
  return (
    <g>
      <ellipse cx={x} cy={y - 10} rx={16} ry={13} fill="url(#k-diyaGlow)" className={s.diyaGlow} style={{ animationDelay: `${n(delay)}s` }} />
      <path d={`M${x - 9},${y - 4}Q${x},${y + 6} ${x + 9},${y - 4}Z`} fill="#b45a2a" />
      <path d={`M${x - 9},${y - 4}H${x + 9}`} stroke="#f0c35a" strokeWidth={1.3} />
      <g className={s.diyaFlame} style={{ animationDelay: `${n(delay)}s, ${n(delay)}s` }}>
        <path d={`M${x},${y - 17}C${x + 3.6},${y - 11} ${x + 3},${y - 5.4} ${x},${y - 5}C${x - 3},${y - 5.4} ${x - 3.6},${y - 11} ${x},${y - 17}Z`} fill="#ffd36b" />
        <path d={`M${x},${y - 12.4}C${x + 1.6},${y - 9} ${x + 1.1},${y - 6.6} ${x},${y - 6.2}C${x - 1.1},${y - 6.6} ${x - 1.6},${y - 9} ${x},${y - 12.4}Z`} fill="#fff8e0" />
      </g>
    </g>
  );
}

const STARS = (() => {
  const rnd = seeded(42);
  return Array.from({ length: 16 }, () => ({
    left: `${n(16 + rnd() * 68)}%`,
    top: `${n(6 + rnd() * 24)}%`,
    "--s": `${n(1.5 + rnd() * 2)}px`,
    animationDuration: `${n(2 + rnd() * 3)}s`,
    animationDelay: `${n(-rnd() * 4)}s`,
  })) as CSSProperties[];
})();

const PETALS = (() => {
  const rnd = seeded(66);
  return Array.from({ length: 10 }, (_, i) => ({
    left: `${n(6 + rnd() * 88)}%`,
    "--s": `${n(7 + rnd() * 5)}px`,
    "--drift": `${n((rnd() - 0.5) * 40)}px`,
    animationDuration: `${n(7 + rnd() * 5)}s`,
    animationDelay: `${n(-rnd() * 12)}s`,
    background: i % 3 === 0 ? "#f6a619" : "#e11d48",
  })) as CSSProperties[];
})();

function KnotScene({ active }: { active: boolean }) {
  return (
    <div className={`${s.scene} ${s.knotScene} ${active ? s.on : ""}`}>
      <div className={s.stars}>
        {STARS.map((style, i) => (
          <span key={i} style={style} />
        ))}
      </div>
      <div className={s.knotHalo} />
      <svg className={s.art} viewBox="0 0 400 460" aria-hidden="true">
        <defs>
          <linearGradient id="k-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff1b8" />
            <stop offset="0.5" stopColor="#e9c35e" />
            <stop offset="1" stopColor="#a8761f" />
          </linearGradient>
          <radialGradient id="k-diyaGlow">
            <stop offset="0" stopColor="rgba(255,214,120,0.85)" />
            <stop offset="1" stopColor="rgba(255,170,70,0)" />
          </radialGradient>
        </defs>

        {/* faint mandala behind the knot */}
        <g transform="translate(200 206)" fill="none" stroke="#f0c35a" opacity={0.18}>
          <circle r={70} />
          {ring(24).map((a) => (
            <path key={a} d={petal(74, 108, 7)} transform={`rotate(${a})`} />
          ))}
          <circle r={116} strokeDasharray="0.1 6" strokeLinecap="round" strokeWidth={2} />
        </g>

        <Cloth d={DUPATTA} body="#b3123e" edge="#f0c35a" thread="#f6d27a" delay={0.3} />
        <Cloth d={PATKA} body="#f5d98f" edge="#b3123e" thread="#b3123e" delay={0.3} />
        {/* the dupatta passes back over the patka once — so the two cloths really interlace */}
        <path d="M200,206C222,222 236,272 226,330C223,346 229,358 236,370" pathLength={1} className={`${s.cloth} ${s.clothQuick}`} style={{ ...at(2.1), stroke: "#f0c35a", strokeWidth: 21 }} />
        <path d="M200,206C222,222 236,272 226,330C223,346 229,358 236,370" pathLength={1} className={`${s.cloth} ${s.clothQuick}`} style={{ ...at(2.1), stroke: "#b3123e", strokeWidth: 16 }} />

        {/* the knot itself, with a burst of light */}
        <g className={s.knotPop} style={at(2.9)}>
          <ellipse cx={200} cy={206} rx={15} ry={18} fill="#8f0d31" stroke="url(#k-gold)" strokeWidth={4} />
          <path d="M190,198Q200,206 210,198M190,214Q200,206 210,214" stroke="#f6d27a" strokeWidth={1.4} fill="none" />
        </g>
        <g transform="translate(200 206)">
          <g className={s.burst} style={at(3)}>
            {ring(12).map((a) => (
              <path key={a} d="M0,-30L2.4,-44L0,-58L-2.4,-44Z" fill="#ffe7a3" transform={`rotate(${a})`} />
            ))}
            <circle r={26} fill="none" stroke="#fff3c4" strokeWidth={2} />
          </g>
        </g>
        <Tassel x={236} y={370} delay={3.1} />
        <Tassel x={164} y={370} delay={3.1} />

        {DIYAS.map((d, i) => (
          <Diya key={i} {...d} i={i} />
        ))}
      </svg>
      <div className={s.leaves}>
        {PETALS.map((style, i) => (
          <span key={i} className={s.leaf} style={style} />
        ))}
      </div>
    </div>
  );
}

export default memo(KnotScene);
