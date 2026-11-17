import { memo, type CSSProperties } from "react";
import { seeded } from "@/lib/random";
import { n, petal, ring } from "@/lib/svg";
import s from "./scenes.module.css";

/*
 * Sangeet — "the rhythm of the dholak". A lacquered dholak plays a beat (dha… na-dhin… dha):
 * each hit flashes the drum head, throws out rings of sound and makes the golden mandala
 * behind it pulse. Ghungroo strings swing overhead and music notes rise.
 * Every moving layer is its own element, so the GPU does all the work.
 */

/** Golden mandala that turns slowly and pulses on every beat. */
const RhythmMandala = memo(function RhythmMandala() {
  return (
    <svg className={s.beatMandala} viewBox="-180 -180 360 360" aria-hidden="true">
      <g fill="none" stroke="#f6d27a" strokeLinecap="round">
        <circle r={58} strokeWidth={1} opacity={0.5} />
        {ring(16).map((a) => (
          <path key={a} d={petal(62, 92, 9)} transform={`rotate(${a})`} strokeWidth={1.2} opacity={0.55} />
        ))}
        <circle r={98} strokeWidth={0.9} strokeDasharray="0.1 5" opacity={0.7} />
        {ring(24, 7.5).map((a) => (
          <path key={a} d={petal(104, 134, 7)} transform={`rotate(${a})`} strokeWidth={1} opacity={0.4} />
        ))}
        <circle r={140} strokeWidth={0.8} opacity={0.35} />
        {ring(36).map((a) => (
          <path key={a} d="M-11.7,-140Q0,-156 11.7,-140" transform={`rotate(${a})`} strokeWidth={0.9} opacity={0.35} />
        ))}
        {ring(36, 5).map((a) => (
          <circle key={a} cy={-164} r={1.6} transform={`rotate(${a})`} fill="#f6d27a" stroke="none" opacity={0.5} />
        ))}
      </g>
    </svg>
  );
});

/** The dholak: lacquered barrel, gold bands, rope lacing with tuning rings, two heads. */
const Dholak = memo(function Dholak() {
  const lace = Array.from({ length: 9 }, (_, i) => {
    const x = 66 + i * 21;
    return `${i === 0 ? "M" : "L"}${x},${i % 2 ? 160 : 22}`;
  }).join("");
  const rings = Array.from({ length: 4 }, (_, i) => 87 + i * 42);
  return (
    <svg className={s.drum} viewBox="0 0 300 180" aria-hidden="true">
      <defs>
        <linearGradient id="r-lacquer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e0456f" />
          <stop offset="0.28" stopColor="#a8143f" />
          <stop offset="0.7" stopColor="#7a0c2e" />
          <stop offset="1" stopColor="#3f0618" />
        </linearGradient>
        <linearGradient id="r-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a8761f" />
          <stop offset="0.5" stopColor="#fff1b8" />
          <stop offset="1" stopColor="#c9952e" />
        </linearGradient>
        <radialGradient id="r-head" cx="0.4" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#fff6dd" />
          <stop offset="1" stopColor="#d9bf8c" />
        </radialGradient>
      </defs>
      <ellipse cx={150} cy={170} rx={130} ry={8} fill="rgba(0,0,0,0.3)" />
      <path d="M30,32C90,8 210,6 270,28L270,150C210,172 90,170 30,146Z" fill="url(#r-lacquer)" />
      {/* lacquer shine */}
      <path d="M40,40C100,22 200,20 262,38" stroke="rgba(255,220,235,0.45)" strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* gold bands */}
      {[52, 248].map((x) => (
        <path key={x} d={`M${x},${x < 150 ? 25 : 20}C${x + 4},70 ${x + 4},110 ${x},${x < 150 ? 152 : 157}`} stroke="url(#r-gold)" strokeWidth={8} fill="none" />
      ))}
      {[60, 240].map((x) => (
        <path key={x} d={`M${x},${x < 150 ? 23 : 19}C${x + 3},70 ${x + 3},110 ${x},${x < 150 ? 154 : 158}`} stroke="#f6d27a" strokeWidth={1.4} fill="none" strokeDasharray="0.1 4" strokeLinecap="round" />
      ))}
      {/* rope lacing and tuning rings */}
      <path d={lace} stroke="#f7e6bd" strokeWidth={2.4} fill="none" strokeLinejoin="round" />
      <path d={lace} stroke="rgba(120,60,10,0.35)" strokeWidth={0.8} fill="none" />
      {rings.map((x) => (
        <circle key={x} cx={x} cy={150} r={4.6} fill="none" stroke="url(#r-gold)" strokeWidth={2.2} />
      ))}
      {/* heads */}
      <ellipse cx={30} cy={89} rx={14} ry={57} fill="url(#r-head)" stroke="#5a2a10" strokeWidth={2.4} />
      <ellipse cx={270} cy={89} rx={15} ry={61} fill="url(#r-head)" stroke="#5a2a10" strokeWidth={2.4} />
      <ellipse cx={272} cy={89} rx={6} ry={26} fill="#2b1810" opacity={0.85} />
      {/* tassels */}
      {[52, 248].map((x) => (
        <g key={x}>
          <path d={`M${x},152V168`} stroke="#f6d27a" strokeWidth={1.4} />
          <circle cx={x} cy={170} r={3.4} fill="url(#r-gold)" />
          <path d={`M${x - 3},172L${x - 5},186M${x},173V188M${x + 3},172L${x + 5},186`} stroke="#d61f5a" strokeWidth={1.6} strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
});

/** A string of ghungroo bells, swinging from the arch. */
const Ghungroo = memo(function Ghungroo({ id, className }: { id: string; className: string }) {
  return (
    <svg className={className} viewBox="0 0 40 170" aria-hidden="true">
      <defs>
        <radialGradient id={id} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#fff4c4" />
          <stop offset="0.5" stopColor="#e2b04a" />
          <stop offset="1" stopColor="#8a5d16" />
        </radialGradient>
      </defs>
      <path d="M20,0V146" stroke="#d61f5a" strokeWidth={1.6} />
      {Array.from({ length: 8 }, (_, i) => {
        const y = 18 + i * 16;
        const x = 20 + (i % 2 ? 6 : -6);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={5.4} fill={`url(#${id})`} />
            <path d={`M${x - 3.4},${y + 1.4}H${x + 3.4}`} stroke="#5a3a08" strokeWidth={1.1} strokeLinecap="round" />
            <circle cx={x} cy={y + 3.4} r={0.9} fill="#5a3a08" />
          </g>
        );
      })}
      <circle cx={20} cy={150} r={4.6} fill={`url(#${id})`} />
      <path d="M17,154L14,168M20,155V170M23,154L26,168" stroke="#d61f5a" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
});

/** A crystal jhoomar hanging from the top of the arch. */
const Jhoomar = memo(function Jhoomar() {
  const drops = Array.from({ length: 11 }, (_, i) => i);
  return (
    <svg className={s.jhoomar} viewBox="0 0 80 90" aria-hidden="true">
      <path d="M40,0V22" stroke="#f2c45a" strokeWidth={1.2} />
      <ellipse cx={40} cy={26} rx={11} ry={3.4} fill="none" stroke="#f2c45a" strokeWidth={1.4} />
      <ellipse cx={40} cy={40} rx={26} ry={6.4} fill="none" stroke="#f2c45a" strokeWidth={1.6} />
      <path d="M29,26L16,40M51,26L64,40M40,29V50" stroke="#f2c45a" strokeWidth={1} />
      {drops.map((i) => {
        const a = Math.PI * (i / (drops.length - 1));
        const x = n(40 - Math.cos(a) * 26);
        const y = n(40 + Math.sin(a) * 6.4);
        const len = 6 + (i % 2) * 5;
        return (
          <g key={i}>
            <path d={`M${x},${y}V${n(y + len)}`} stroke="#f2c45a" strokeWidth={0.5} />
            <path d={`M${x},${n(y + len)}l2,3.6 -2,3.6 -2,-3.6Z`} fill="#fff4fb" />
          </g>
        );
      })}
      <path d="M40,50l2.6,5 -2.6,5 -2.6,-5Z" fill="#fff4fb" />
      {[22, 34, 46, 58].map((x) => (
        <g key={x}>
          <rect x={x - 1.2} y={14} width={2.4} height={7} fill="#fff4e0" />
          <ellipse cx={x} cy={11.6} rx={1.4} ry={2.6} fill="#ffd36b" />
        </g>
      ))}
    </svg>
  );
});

const NOTES = (() => {
  const rnd = seeded(93);
  const glyphs = ["♪", "♫", "♬", "♩"];
  return Array.from({ length: 9 }, (_, i) => ({
    glyph: glyphs[i % glyphs.length],
    style: {
      left: `${n(14 + rnd() * 72)}%`,
      bottom: "30%",
      fontSize: `${n(13 + rnd() * 9)}px`,
      "--drift": `${n((rnd() - 0.5) * 70)}px`,
      animationDuration: `${n(4 + rnd() * 3)}s`,
      animationDelay: `${n(-rnd() * 7)}s`,
    } as CSSProperties,
  }));
})();

const GLITTER = (() => {
  const rnd = seeded(17);
  return Array.from({ length: 14 }, () => ({
    left: `${n(6 + rnd() * 88)}%`,
    top: `${n(10 + rnd() * 52)}%`,
    "--s": `${n(4 + rnd() * 5)}px`,
    animationDuration: `${n(1.6 + rnd() * 2)}s`,
    animationDelay: `${n(-rnd() * 3)}s`,
  })) as CSSProperties[];
})();

function RhythmScene({ active }: { active: boolean }) {
  return (
    <div className={`${s.scene} ${s.rhythm} ${active ? s.on : ""}`}>
      <div className={s.rhythmGlow} />
      <div className={s.spot} />
      <RhythmMandala />
      <Jhoomar />
      {/* a flash of light and rings of sound from each drum head */}
      <span className={`${s.beatGlow} ${s.beatGlowL}`} />
      <span className={`${s.beatGlow} ${s.beatGlowR}`} />
      {[s.ringL1, s.ringL2, s.ringR1, s.ringR2].map((c) => (
        <span key={c} className={`${s.soundRing} ${c}`} />
      ))}
      <Ghungroo id="bell-l" className={`${s.ghungroo} ${s.ghungrooL}`} />
      <Ghungroo id="bell-r" className={`${s.ghungroo} ${s.ghungrooR}`} />
      <div className={s.glitter}>
        {GLITTER.map((style, i) => (
          <span key={i} style={style} />
        ))}
      </div>
      <Dholak />
      <div className={s.notes}>
        {NOTES.map((note, i) => (
          <span key={i} style={note.style}>
            {note.glyph}
          </span>
        ))}
      </div>
    </div>
  );
}

export default memo(RhythmScene);
