import { memo, type CSSProperties, type ReactNode } from "react";
import { seeded } from "@/lib/random";
import { n, petal, ring } from "@/lib/svg";
import s from "./scenes.module.css";

/*
 * Mehendi — "the henna hand". An elegant hand where the mehendi draws itself, stroke by
 * stroke, as if an invisible cone were applying it. When the design is finished the
 * henna slowly darkens like a real stain, the bangles sparkle and marigold petals drift.
 */

const at = (d: number) => ({ "--d": `${n(d)}s` }) as CSSProperties;

/** A henna line that draws itself (starting `d` seconds after the scene appears). */
function Ink({ d, delay, w = 1.6 }: { d: string; delay: number; w?: number }) {
  return <path d={d} pathLength={1} className={s.ink} style={{ ...at(delay), strokeWidth: w }} />;
}

/** A filled henna shape (fingertip caps, leaves, dots) that blooms in. */
function Fill({ d, delay }: { d: string; delay: number }) {
  return <path d={d} className={s.inkFill} style={at(delay)} />;
}

function Dots({ pts, delay, r = 1.6 }: { pts: [number, number][]; delay: number; r?: number }) {
  return (
    <g className={s.inkFill} style={at(delay)}>
      {pts.map(([x, y], i) => (
        <circle key={i} cx={n(x)} cy={n(y)} r={r} />
      ))}
    </g>
  );
}

/* ---------------------------------------------------------------- the hand */

type Finger = { cx: number; w: number; top: number; base: number; rot: number };
const FINGERS: Finger[] = [
  { cx: 156, w: 30, top: 98, base: 248, rot: -6 },
  { cx: 189, w: 31, top: 68, base: 248, rot: -1.5 },
  { cx: 221, w: 29.5, top: 84, base: 248, rot: 3 },
  { cx: 251, w: 25.5, top: 128, base: 250, rot: 8 },
];
const THUMB = { cx: 140, w: 32, top: 208, base: 342, rot: -28 };
const PALM =
  "M150,480C150,436 146,402 138,370C130,338 126,302 128,272C130,250 136,234 146,226L258,224C268,234 274,252 274,276C274,308 266,340 258,370C252,398 250,436 250,480Z";

/** A finger, slightly tapered towards a rounded tip. */
function fingerPath(f: Finger) {
  const b = f.w / 2;
  const tip = f.w * 0.43;
  return `M${n(f.cx - b)},${f.base}C${n(f.cx - b)},${n(f.top + f.w * 2)} ${n(f.cx - tip)},${n(f.top + tip * 1.6)} ${n(f.cx - tip)},${n(f.top + tip)}A${n(tip)},${n(tip)} 0 0 1 ${n(f.cx + tip)},${n(f.top + tip)}C${n(f.cx + tip)},${n(f.top + tip * 1.6)} ${n(f.cx + b)},${n(f.top + f.w * 2)} ${n(f.cx + b)},${f.base}Z`;
}

/** Henna on one finger: a solid tip, a little vine with leaves, a double band and dots. */
function FingerHenna({ f, delay }: { f: Finger; delay: number }) {
  const r = f.w * 0.43;
  const x0 = f.cx - r + 0.6;
  const x1 = f.cx + r - 0.6;
  const len = f.base - f.top;
  const capY = f.top + r + 10;
  const vine0 = capY + 8;
  const vine1 = f.top + len * 0.46;
  const band = f.top + len * 0.52;
  const leaf = (y: number, side: number) =>
    `M${f.cx},${n(y)}C${n(f.cx + side * 5)},${n(y - 2)} ${n(f.cx + side * 8)},${n(y - 7)} ${n(f.cx + side * 8.5)},${n(y - 10)}C${n(f.cx + side * 4)},${n(y - 9)} ${n(f.cx + side * 1)},${n(y - 5)} ${f.cx},${n(y)}Z`;
  const vineMid = (vine0 + vine1) / 2;
  return (
    <g transform={`rotate(${f.rot} ${f.cx} ${f.base})`}>
      <Fill d={`M${n(x0)},${n(capY)}V${n(f.top + r)}A${n(r - 0.6)},${n(r - 0.6)} 0 0 1 ${n(x1)},${n(f.top + r)}V${n(capY)}Q${f.cx},${n(capY + 7)} ${n(x0)},${n(capY)}Z`} delay={delay} />
      <Ink d={`M${f.cx},${n(vine0)}C${n(f.cx - 6)},${n(vine0 + (vine1 - vine0) * 0.3)} ${n(f.cx + 6)},${n(vine0 + (vine1 - vine0) * 0.6)} ${f.cx},${n(vine1)}`} delay={delay + 0.25} w={1.3} />
      <Fill d={leaf(vineMid - 4, -1)} delay={delay + 0.45} />
      <Fill d={leaf(vineMid + 8, 1)} delay={delay + 0.55} />
      <Ink d={`M${n(x0 + 1)},${n(band)}Q${f.cx},${n(band + 4)} ${n(x1 - 1)},${n(band)}`} delay={delay + 0.6} w={1.5} />
      <Ink d={`M${n(x0 + 1)},${n(band + 6)}Q${f.cx},${n(band + 10)} ${n(x1 - 1)},${n(band + 6)}`} delay={delay + 0.7} w={1.5} />
      <Dots pts={[-0.5, 0, 0.5].map((k) => [f.cx + k * (r - 4), band + 15] as [number, number])} delay={delay + 0.85} r={1.4} />
      <Dots
        pts={[0, 72, 144, 216, 288].map((a) => [f.cx + Math.sin((a * Math.PI) / 180) * 3.6, band + 30 - Math.cos((a * Math.PI) / 180) * 3.6] as [number, number])}
        delay={delay + 0.9}
        r={1.25}
      />
      <Fill d={`M${f.cx - 1.4},${n(band + 30)}a1.4,1.4 0 1,0 2.8,0a1.4,1.4 0 1,0 -2.8,0Z`} delay={delay + 0.9} />
      <Ink d={`M${n(x0 + 1)},${n(f.base - 26)}Q${f.cx},${n(f.base - 20)} ${n(x1 - 1)},${n(f.base - 26)}`} delay={delay + 0.95} w={1.2} />
    </g>
  );
}

const PAISLEY = "M0,22C-15,20 -18,-2 -7,-13C2,-21 15,-15 14,-3C13,6 4,9 0,3C4,-1 2,-6 -2,-5";

/** The palm mandala, drawn from the centre outwards. */
function PalmMandala({ cx, cy }: { cx: number; cy: number }) {
  const t = (deg: number, r: number): [number, number] => [cx + Math.sin((deg * Math.PI) / 180) * r, cy - Math.cos((deg * Math.PI) / 180) * r];
  const nodes: ReactNode[] = [];
  nodes.push(<Fill key="c" d={`M${cx - 5},${cy}a5,5 0 1,0 10,0a5,5 0 1,0 -10,0Z`} delay={0.2} />);
  nodes.push(<Ink key="r1" d={`M${cx},${cy - 13}a13,13 0 1,1 -0.01,0`} delay={0.35} />);
  ring(8).forEach((a, i) =>
    nodes.push(
      <g key={`p${a}`} transform={`translate(${cx} ${cy}) rotate(${a})`}>
        <Ink d={petal(15, 33, 8)} delay={0.6 + i * 0.09} w={1.5} />
      </g>,
    ),
  );
  nodes.push(<Dots key="d1" pts={ring(16, 11.25).map((a) => t(a, 38))} delay={1.4} r={1.5} />);
  ring(16).forEach((a, i) =>
    nodes.push(
      <g key={`q${a}`} transform={`translate(${cx} ${cy}) rotate(${a})`}>
        <Ink d={petal(42, 58, 4.5)} delay={1.6 + i * 0.05} w={1.3} />
      </g>,
    ),
  );
  const scallops = ring(20)
    .map((a) => {
      const [x0, y0] = t(a, 62);
      const [x1, y1] = t(a + 18, 62);
      const [mx, my] = t(a + 9, 69);
      return `M${n(x0)},${n(y0)}Q${n(mx)},${n(my)} ${n(x1)},${n(y1)}`;
    })
    .join("");
  nodes.push(<Ink key="sc" d={scallops} delay={2.5} w={1.4} />);
  nodes.push(<Dots key="d2" pts={ring(20, 9).map((a) => t(a, 73))} delay={2.9} r={1.6} />);
  return <g>{nodes}</g>;
}

function HandHenna() {
  const archRow = Array.from({ length: 5 }, (_, i) => {
    const x = 148 + i * 22;
    return `M${x},254Q${x + 11},240 ${x + 22},254`;
  }).join("");
  const lattice = Array.from({ length: 9 }, (_, i) => {
    const x = 146 + i * 12.4;
    return `M${n(x)},404L${n(x + 12.4)},428M${n(x + 12.4)},404L${n(x)},428`;
  }).join("");
  const drops = Array.from({ length: 9 }, (_, i) => {
    const x = 146 + i * 12.4;
    return `M${n(x)},432Q${n(x + 6.2)},442 ${n(x + 12.4)},432`;
  }).join("");
  return (
    <g className={s.henna}>
      <PalmMandala cx={200} cy={318} />
      {[
        [154, 268, -40],
        [246, 268, 40],
        [150, 378, -140],
        [250, 378, 140],
      ].map(([x, y, a], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${a}) scale(0.55)`}>
          <Ink d={PAISLEY} delay={2.95 + i * 0.12} w={2.6} />
        </g>
      ))}
      <Dots pts={[[178, 264], [222, 264], [176, 384], [224, 384]]} delay={3.4} r={1.7} />
      <Ink d="M134,290C130,320 134,350 144,380" delay={3.1} w={1.2} />
      <Ink d="M268,290C272,320 268,350 258,380" delay={3.1} w={1.2} />
      <Dots pts={[[136, 302], [134, 322], [136, 342], [140, 362], [266, 302], [268, 322], [266, 342], [262, 362]]} delay={3.3} r={1.5} />
      <Ink d={archRow} delay={3.1} w={1.4} />
      <Ink d="M148,259H258" delay={3.3} w={1.3} />
      <Dots pts={[0, 1, 2, 3, 4].map((i) => [159 + i * 22, 236] as [number, number])} delay={3.4} />
      {FINGERS.map((f, i) => (
        <FingerHenna key={f.cx} f={f} delay={3.5 + i * 0.32} />
      ))}
      {/* thumb: solid tip and a paisley */}
      <g transform={`rotate(${THUMB.rot} ${THUMB.cx} ${THUMB.base})`}>
        <Fill
          d={`M${THUMB.cx - 13.2},${THUMB.top + 30}V${THUMB.top + 13.8}A13.2,13.2 0 0 1 ${THUMB.cx + 13.2},${THUMB.top + 13.8}V${THUMB.top + 30}Q${THUMB.cx},${THUMB.top + 37} ${THUMB.cx - 13.2},${THUMB.top + 30}Z`}
          delay={4.8}
        />
        <g transform={`translate(${THUMB.cx} ${THUMB.top + 70}) scale(0.62)`}>
          <Ink d={PAISLEY} delay={5} w={2.4} />
        </g>
        <Ink d={`M${THUMB.cx - 13},${THUMB.top + 96}Q${THUMB.cx},${THUMB.top + 101} ${THUMB.cx + 13},${THUMB.top + 96}`} delay={5.3} w={1.4} />
      </g>
      {/* wrist lattice */}
      <Ink d={Array.from({ length: 9 }, (_, i) => `M${n(146 + i * 12.4)},398Q${n(152.2 + i * 12.4)},390 ${n(158.6 + i * 12.4)},398`).join("")} delay={5.3} w={1.2} />
      <Ink d="M144,402H256" delay={5.4} w={1.5} />
      <Ink d={lattice} delay={5.55} w={1.1} />
      <Ink d="M144,430H256" delay={5.8} w={1.5} />
      <Ink d={drops} delay={5.95} w={1.2} />
    </g>
  );
}

const SPARKLES = (() => {
  const rnd = seeded(61);
  return Array.from({ length: 9 }, () => ({
    left: `${n(14 + rnd() * 72)}%`,
    top: `${n(10 + rnd() * 80)}%`,
    "--s": `${n(5 + rnd() * 6)}px`,
    animationDuration: `${n(1.8 + rnd() * 2.2)}s`,
    animationDelay: `${n(-rnd() * 4)}s`,
  })) as CSSProperties[];
})();

const PETALS = (() => {
  const rnd = seeded(12);
  return Array.from({ length: 10 }, (_, i) => ({
    left: `${n(4 + rnd() * 92)}%`,
    "--s": `${n(7 + rnd() * 7)}px`,
    "--drift": `${n((rnd() - 0.5) * 50)}px`,
    animationDuration: `${n(7 + rnd() * 6)}s`,
    animationDelay: `${n(-rnd() * 12)}s`,
    background: ["#f59e0b", "#ea580c", "#3f8a46", "#f6b21b", "#e8457a"][i % 5],
  })) as CSSProperties[];
})();

function HennaScene({ active }: { active: boolean }) {
  return (
    <div className={`${s.scene} ${s.hennaScene} ${active ? s.on : ""}`}>
      <div className={s.hennaHalo} />
      <svg className={`${s.art} ${s.handFloat}`} viewBox="0 0 400 460" aria-hidden="true">
        <defs>
          <linearGradient id="h-skin" x1="0" x2="1">
            <stop offset="0" stopColor="#e2a87e" />
            <stop offset="0.5" stopColor="#f8dbc0" />
            <stop offset="1" stopColor="#e2a87e" />
          </linearGradient>
          <radialGradient id="h-shadow">
            <stop offset="0" stopColor="rgba(120,58,20,0.22)" />
            <stop offset="1" stopColor="rgba(120,58,20,0)" />
          </radialGradient>
          <linearGradient id="h-green" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5fbf7a" />
            <stop offset="0.5" stopColor="#1f7a43" />
            <stop offset="1" stopColor="#0f4a28" />
          </linearGradient>
          <linearGradient id="h-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff1b8" />
            <stop offset="0.5" stopColor="#e2b04a" />
            <stop offset="1" stopColor="#a8761f" />
          </linearGradient>
        </defs>
        <g transform="translate(22 4)">
          <ellipse cx={206} cy={300} rx={130} ry={200} fill="url(#h-shadow)" />
          {/* the hand */}
          <g fill="url(#h-skin)">
            <path d={fingerPath(THUMB)} transform={`rotate(${THUMB.rot} ${THUMB.cx} ${THUMB.base})`} />
            <path d={PALM} />
            {FINGERS.map((f) => (
              <path key={f.cx} d={fingerPath(f)} transform={`rotate(${f.rot} ${f.cx} ${f.base})`} />
            ))}

          </g>
          <HandHenna />
          {/* bangles */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect
              key={i}
              x={146}
              y={440 + i * 6.4}
              width={108}
              height={5.4}
              rx={2.7}
              fill={i === 1 || i === 4 ? "url(#h-gold)" : "url(#h-green)"}
            />
          ))}
          <path d="M150,441.4H250M150,454.2H250M150,473.4H250" stroke="rgba(255,255,255,0.45)" strokeWidth={0.8} />
        </g>
      </svg>
      <div className={s.glitter}>
        {SPARKLES.map((style, i) => (
          <span key={i} style={style} />
        ))}
      </div>
      <div className={s.leaves}>
        {PETALS.map((style, i) => (
          <span key={i} className={s.leaf} style={style} />
        ))}
      </div>
    </div>
  );
}

export default memo(HennaScene);
