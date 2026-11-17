import { memo, type CSSProperties } from "react";
import { wedding } from "@/config/wedding";
import { seeded } from "@/lib/random";
import { n, petal, quadAt, ring } from "@/lib/svg";
import { ARCH_CURVE, ARCH_EDGE, ARCH_MID, WALL } from "./geometry";
import s from "./PalaceGate.module.css";

/* ------------------------------------------------------------------ */
/*  Layout constants (SVG user units on the 800 × 1400 canvas)         */
/* ------------------------------------------------------------------ */
const ANCHORS = [24, 212, 400, 588, 776] as const; // where the toran hangs from
const AY = 178;
const DIP = 40;
const LEAF = "M0,0 C7,9 7,24 0,36 C-7,24 -7,9 0,0 Z";
const LEAF_TS = [0.08, 0.2, 0.32, 0.44, 0.56, 0.68, 0.8, 0.92];
const LADIS = [
  { x: 24, length: 124, delay: "-0.4s" },
  { x: 212, length: 96, delay: "-2.1s" },
  { x: 588, length: 96, delay: "-1.3s" },
  { x: 776, length: 124, delay: "-3s" },
];
const MERLONS_LEFT = [96, 132, 168, 204, 240, 276];
const MERLONS = [...MERLONS_LEFT, ...MERLONS_LEFT.map((x) => 800 - x - 30)];

const origin = (x: number, y: number): CSSProperties => ({ transformOrigin: `${x}px ${y}px` });

/** Rose & marigold petals scattered on the steps. */
const floorPetals = (() => {
  const rnd = seeded(7);
  const colors = ["#be123c", "#e11d48", "#f97316", "#fbbf24", "#db2777"];
  return Array.from({ length: 18 }, () => ({
    x: n(120 + rnd() * 560),
    y: n(1364 + rnd() * 90),
    r: n(rnd() * 180),
    s: n(0.7 + rnd() * 0.6),
    c: colors[Math.floor(rnd() * colors.length)],
  }));
})();

/* ------------------------------------------------------------------ */
/*  Small ornaments                                                    */
/* ------------------------------------------------------------------ */
function Rosette({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={r} fill="#f8f0de" stroke="url(#gf-gold)" strokeWidth={Math.max(1.5, r * 0.07)} />
      <circle r={r * 0.88} fill="none" stroke="#c49a4a" strokeWidth={r * 0.06} strokeDasharray="0 1" pathLength={32} strokeLinecap="round" />
      {ring(8).map((a) => (
        <path key={a} d={petal(r * 0.2, r * 0.8, r * 0.3)} transform={`rotate(${a})`} fill="url(#gf-ruby)" stroke="#8a5a14" strokeWidth={r * 0.02} />
      ))}
      {ring(8, 22.5).map((a) => (
        <path key={a} d={petal(r * 0.3, r * 0.66, r * 0.15)} transform={`rotate(${a})`} fill="url(#gf-jade)" stroke="#8a5a14" strokeWidth={r * 0.015} />
      ))}
      <circle r={r * 0.2} fill="url(#gf-gold)" stroke="#8a5a14" strokeWidth={r * 0.02} />
    </g>
  );
}

function Diya({ x, y, delay = "0s" }: { x: number; y: number; delay?: string }) {
  return (
    <g>
      <circle cx={x} cy={y - 30} r={80} fill="url(#gf-glow)" className={s.glow} style={{ ...origin(x, y - 30), animationDelay: delay }} />
      <g className={s.flame} style={{ ...origin(x, y - 12), animationDelay: delay }}>
        <path
          d={`M${x},${y - 50} C${x + 10},${y - 34} ${x + 9},${y - 18} ${x},${y - 12} C${x - 9},${y - 18} ${x - 10},${y - 34} ${x},${y - 50} Z`}
          fill="url(#gf-flame)"
        />
        <path
          d={`M${x},${y - 34} C${x + 4},${y - 26} ${x + 4},${y - 18} ${x},${y - 15} C${x - 4},${y - 18} ${x - 4},${y - 26} ${x},${y - 34} Z`}
          fill="#fffbe6"
        />
      </g>
      <path d={`M${x - 27},${y - 12} Q${x},${y + 18} ${x + 27},${y - 12} Z`} fill="url(#gf-clay)" />
      <ellipse cx={x} cy={y - 12} rx="27" ry="5" fill="#5c240b" stroke="#e0a64a" strokeWidth="1.6" />
      <circle cx={x} cy={y - 13} r="1.6" fill="#2a1005" />
    </g>
  );
}

function Lantern({ cx, delay }: { cx: number; delay: string }) {
  return (
    <g>
      <line x1={cx} y1={-1200} x2={cx} y2={298} stroke="#7a5416" strokeWidth="2.5" strokeDasharray="7 4" />
      <circle cx={cx} cy={374} r={160} fill="url(#gf-glow)" className={s.glow} style={{ ...origin(cx, 374), animationDelay: delay }} />
      <circle cx={cx} cy={296} r={6} fill="url(#gf-gold)" />
      <path d={`M${cx - 10},300 H${cx + 10} L${cx + 32},330 H${cx - 32} Z`} fill="url(#gf-gold)" stroke="#6b4a12" strokeWidth="1" />
      <path d={`M${cx - 28},330 H${cx + 28} L${cx + 38},374 L${cx + 26},422 H${cx - 26} L${cx - 38},374 Z`} fill="url(#gf-lamp)" stroke="#8a5f17" strokeWidth="2" />
      {[-14, 0, 14].map((dx) => (
        <line key={dx} x1={cx + dx} y1={330} x2={cx + dx * 0.93} y2={422} stroke="#8a5f17" strokeWidth="1.6" />
      ))}
      <line x1={cx - 38} y1={374} x2={cx + 38} y2={374} stroke="#8a5f17" strokeWidth="1.6" />
      <path d={`M${cx - 26},422 H${cx + 26} L${cx + 12},442 H${cx - 12} Z`} fill="url(#gf-gold)" stroke="#6b4a12" strokeWidth="1" />
      <line x1={cx} y1={442} x2={cx} y2={464} stroke="#b8862b" strokeWidth="2" />
      <circle cx={cx} cy={468} r={5} fill="#be123c" />
    </g>
  );
}

/** A projecting palace balcony window, glowing from inside. Only seen on wide screens. */
function Jharokha({ cx }: { cx: number }) {
  const win = `M${cx - 72},800 V672 C${cx - 72},620 ${cx - 30},586 ${cx},562 C${cx + 30},586 ${cx + 72},620 ${cx + 72},672 V800 Z`;
  return (
    <g>
      <ellipse cx={cx} cy={690} rx={150} ry={250} fill="#5a2a10" opacity=".14" filter="url(#gf-blur)" />
      <path d={`M${cx - 50},470 C${cx - 50},434 ${cx - 18},420 ${cx},402 C${cx + 18},420 ${cx + 50},434 ${cx + 50},470 Z`} fill="url(#gf-gold)" stroke="#6b4a12" strokeWidth="1.5" />
      <line x1={cx} y1={402} x2={cx} y2={380} stroke="#b8862b" strokeWidth="2.5" />
      <circle cx={cx} cy={386} r={4.5} fill="url(#gf-gold)" />
      <path d={`M${cx - 132},550 C${cx - 118},496 ${cx - 62},470 ${cx},468 C${cx + 62},470 ${cx + 118},496 ${cx + 132},550 Z`} fill="url(#gf-gold)" stroke="#6b4a12" strokeWidth="1.5" />
      <path d={`M${cx - 132},550 H${cx + 132}`} stroke="#6b4a12" strokeWidth="3" />
      <rect x={cx - 104} y={550} width={208} height={250} fill="#f7eddb" stroke="#b8862b" strokeWidth="2" />
      <path d={win} fill="url(#gf-jaaliGlow)" />
      <path d={win} fill="url(#gf-jaaliDark)" />
      <path d={win} fill="none" stroke="url(#gf-gold)" strokeWidth="6" />
      {[-104, 88].map((dx) => (
        <rect key={dx} x={cx + dx} y={550} width={16} height={250} fill="url(#gf-goldH)" stroke="#6b4a12" strokeWidth="1" />
      ))}
      <rect x={cx - 124} y={800} width={248} height={26} fill="url(#gf-gold)" stroke="#6b4a12" strokeWidth="1.5" />
      <line x1={cx - 118} y1={813} x2={cx + 118} y2={813} stroke="#fff3c4" strokeWidth="4" strokeDasharray="0 1" pathLength={20} strokeLinecap="round" />
      {[-84, 0, 84].map((dx) => (
        <path
          key={dx}
          d={`M${cx + dx - 16},826 H${cx + dx + 16} C${cx + dx + 16},846 ${cx + dx + 6},852 ${cx + dx},880 C${cx + dx - 6},852 ${cx + dx - 16},846 ${cx + dx - 16},826 Z`}
          fill="url(#gf-gold)"
          stroke="#6b4a12"
          strokeWidth="1"
        />
      ))}
    </g>
  );
}

function Chhatri({ cx }: { cx: number }) {
  const b = 114;
  return (
    <g>
      <rect x={cx - 24} y={b - 42} width={48} height={32} fill="url(#gf-jaaliGlow)" />
      <rect x={cx - 34} y={b - 10} width={68} height={10} fill="url(#gf-goldH)" stroke="#6b4a12" strokeWidth="1" />
      <rect x={cx - 28} y={b - 42} width={8} height={32} fill="#f3e6cc" stroke="#b8862b" strokeWidth="1" />
      <rect x={cx + 20} y={b - 42} width={8} height={32} fill="#f3e6cc" stroke="#b8862b" strokeWidth="1" />
      <path d={`M${cx - 20},${b - 30} Q${cx},${b - 46} ${cx + 20},${b - 30} V${b - 42} H${cx - 20} Z`} fill="#f3e6cc" />
      <path d={`M${cx - 38},${b - 42} H${cx + 38} L${cx + 32},${b - 50} H${cx - 32} Z`} fill="url(#gf-gold)" stroke="#6b4a12" strokeWidth="1" />
      <path
        d={`M${cx - 30},${b - 50} C${cx - 30},${b - 80} ${cx - 10},${b - 88} ${cx},${b - 100} C${cx + 10},${b - 88} ${cx + 30},${b - 80} ${cx + 30},${b - 50} Z`}
        fill="url(#gf-gold)"
        stroke="#6b4a12"
        strokeWidth="1.2"
      />
      <path d={`M${cx - 15},${b - 51} C${cx - 14},${b - 72} ${cx - 6},${b - 84} ${cx},${b - 99}`} fill="none" stroke="#fff3c4" strokeOpacity=".6" strokeWidth="1.2" />
      <line x1={cx} y1={b - 100} x2={cx} y2={b - 120} stroke="#b8862b" strokeWidth="2" />
      <circle cx={cx} cy={b - 106} r={3.5} fill="url(#gf-gold)" />
      <circle cx={cx} cy={b - 115} r={2.5} fill="url(#gf-gold)" />
    </g>
  );
}

/** The Mewar sun — the emblem of Udaipur's royal house. */
function Sun() {
  return (
    <g transform="translate(400 54)">
      <circle r="104" fill="url(#gf-sunGlow)" className={s.glowSlow} style={origin(0, 0)} />
      <g className={s.spin} style={origin(0, 0)}>
        {ring(24).map((a, i) => (
          <path key={a} d={petal(26, i % 2 ? 50 : 64, i % 2 ? 6 : 8.5)} transform={`rotate(${a})`} fill="url(#gf-gold)" stroke="#8a5a14" strokeWidth=".8" />
        ))}
      </g>
      <circle r="32" fill="url(#gf-sun)" stroke="#8a5a14" strokeWidth="1.5" />
      <circle r="25" fill="none" stroke="#8a5a14" strokeOpacity=".7" strokeWidth="1" />
      {ring(8).map((a) => (
        <path key={a} d={petal(5, 22, 7)} transform={`rotate(${a})`} fill="#9b1c31" stroke="#f3d684" strokeWidth=".6" />
      ))}
      <circle r="5" fill="url(#gf-gold)" />
    </g>
  );
}

function Ladi({ x, length, delay }: { x: number; length: number; delay: string }) {
  const d = `M${x},${AY} V${AY + length}`;
  const count = Math.round(length / 13);
  const end = AY + length;
  return (
    <g className={s.sway} style={{ ...origin(x, AY), animationDelay: delay }}>
      <path d={d} stroke="#c2410c" strokeWidth="14.5" strokeDasharray="0 1" pathLength={count} strokeLinecap="round" />
      <path d={d} stroke="#f97316" strokeWidth="13" strokeDasharray="0 1" pathLength={count} strokeLinecap="round" />
      <path d={d} stroke="#fbbf24" strokeWidth="12" strokeDasharray="0 2" strokeDashoffset={1} pathLength={count} strokeLinecap="round" />
      <path d={d} stroke="#9a3412" strokeOpacity=".55" strokeWidth="3.5" strokeDasharray="0 1" pathLength={count} strokeLinecap="round" />
      <circle cx={x} cy={end + 11} r="7.5" fill="#be123c" />
      <circle cx={x} cy={end + 11} r="3.5" fill="#881337" />
      <path d={`M${x},${end + 18} V${end + 32}`} stroke="#d4a743" strokeWidth="2" />
      <circle cx={x} cy={end + 34} r="3.2" fill="#e9c35e" />
    </g>
  );
}

function Toran() {
  const swags = ANCHORS.slice(0, -1).map((x0, i) => {
    const x1 = ANCHORS[i + 1];
    const c = [(x0 + x1) / 2, AY + DIP * 2] as const;
    return { x0, x1, c, d: `M${x0},${AY} Q${c[0]},${c[1]} ${x1},${AY}` };
  });
  const dots = { strokeDasharray: "0 1", pathLength: 15, strokeLinecap: "round" as const, fill: "none" };

  return (
    <g>
      {swags.map((sw, i) => (
        <g key={i}>
          {LEAF_TS.map((t, j) => {
            const [lx, ly] = quadAt([sw.x0, AY], sw.c, [sw.x1, AY], t);
            return (
              <g key={j} transform={`translate(${lx} ${n(ly + 3)}) rotate(${j % 2 ? 14 : -14})`}>
                <path d={LEAF} fill={j % 2 ? "#2f6d35" : "#3f8a44"} />
                <line x1="0" y1="3" x2="0" y2="31" stroke="#b9dfa9" strokeOpacity=".55" strokeWidth=".9" />
              </g>
            );
          })}
          <path d={sw.d} stroke="#c2410c" strokeWidth="16" {...dots} />
          <path d={sw.d} stroke="#f97316" strokeWidth="14" {...dots} />
          <path d={sw.d} stroke="#fbbf24" strokeWidth="13" {...dots} strokeDasharray="0 2" strokeDashoffset={1} />
          <path d={sw.d} stroke="#9a3412" strokeOpacity=".5" strokeWidth="4" {...dots} />
        </g>
      ))}
      {LADIS.map((l) => (
        <Ladi key={l.x} {...l} />
      ))}
      {/* temple bell at the centre */}
      <g className={s.sway} style={{ ...origin(400, AY), animationDelay: "-1.7s" }}>
        <line x1="400" y1={AY} x2="400" y2={AY + 32} stroke="#b8862b" strokeWidth="2" />
        <circle cx="400" cy={AY + 10} r="5.5" fill="#f97316" />
        <circle cx="400" cy={AY + 21} r="5" fill="#fbbf24" />
        <g transform={`translate(400 ${AY + 30})`}>
          <path
            d="M-4,0 H4 V6 C14,8 18,18 19,30 C20,36 23,38 26,40 H-26 C-23,38 -20,36 -19,30 C-18,18 -14,8 -4,6 Z"
            fill="url(#gf-gold)"
            stroke="#6b4a12"
            strokeWidth="1"
          />
          <path d="M-9,12 C-13,20 -14,28 -14,34" fill="none" stroke="#fff3c4" strokeOpacity=".7" strokeWidth="1.6" />
          <circle cy="46" r="4.5" fill="url(#gf-gold)" stroke="#6b4a12" strokeWidth=".8" />
        </g>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  The façade                                                         */
/* ------------------------------------------------------------------ */
type GateFrameProps = {
  className?: string;
  /** Draw the balconies & lanterns either side (off for the link-preview image, where the names go). */
  wings?: boolean;
};

function GateFrame({ className, wings = true }: GateFrameProps) {
  return (
    <svg className={className} viewBox="0 0 800 1400" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="gf-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2bf" />
          <stop offset=".22" stopColor="#e9c35e" />
          <stop offset=".5" stopColor="#b6852a" />
          <stop offset=".74" stopColor="#f0cf78" />
          <stop offset="1" stopColor="#94661a" />
        </linearGradient>
        <linearGradient id="gf-goldH" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#94661a" />
          <stop offset=".25" stopColor="#f0cf78" />
          <stop offset=".5" stopColor="#c08f30" />
          <stop offset=".75" stopColor="#f3d684" />
          <stop offset="1" stopColor="#94661a" />
        </linearGradient>
        <linearGradient id="gf-band" x1="44" y1="0" x2="756" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8f6218" />
          <stop offset=".045" stopColor="#f6da8a" />
          <stop offset=".1" stopColor="#b8862b" />
          <stop offset=".14" stopColor="#e2b553" />
          <stop offset=".5" stopColor="#f0cd73" />
          <stop offset=".86" stopColor="#e2b553" />
          <stop offset=".9" stopColor="#b8862b" />
          <stop offset=".955" stopColor="#f6da8a" />
          <stop offset="1" stopColor="#8f6218" />
        </linearGradient>
        <pattern id="gf-wall" x="10" width="60" height="90" patternUnits="userSpaceOnUse">
          <rect width="60" height="90" fill="#f2e4c8" />
          <path
            d="M30,0 C44,14 60,26 60,45 C60,64 44,76 30,90 M30,0 C16,14 0,26 0,45 C0,64 16,76 30,90"
            fill="none"
            stroke="#c29a5c"
            strokeOpacity=".42"
            strokeWidth="1.2"
          />
          {[
            [30, 45],
            [0, 0],
            [60, 0],
            [0, 90],
            [60, 90],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`} transform={`translate(${x} ${y})`} fill="#c08d4c" fillOpacity=".4">
              <ellipse rx="2" ry="5.5" />
              <ellipse rx="5.5" ry="2" />
            </g>
          ))}
        </pattern>
        <radialGradient id="gf-light" cx="400" cy="760" r="1150" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff8ea" stopOpacity=".7" />
          <stop offset=".45" stopColor="#fff1d6" stopOpacity=".12" />
          <stop offset="1" stopColor="#5e3214" stopOpacity=".38" />
        </radialGradient>
        <linearGradient id="gf-floor" x1="0" y1="1340" x2="0" y2="1700" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#e4d3b1" />
          <stop offset="1" stopColor="#b39567" />
        </linearGradient>
        <radialGradient id="gf-glow">
          <stop offset="0" stopColor="#ffd88c" stopOpacity=".85" />
          <stop offset=".35" stopColor="#ffb661" stopOpacity=".38" />
          <stop offset="1" stopColor="#ff9a3c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="gf-flame" cx=".5" cy=".7" r=".7">
          <stop offset="0" stopColor="#fffbe8" />
          <stop offset=".35" stopColor="#ffe27a" />
          <stop offset=".72" stopColor="#ff9a2e" />
          <stop offset="1" stopColor="#e4570f" />
        </radialGradient>
        <linearGradient id="gf-clay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c2652c" />
          <stop offset="1" stopColor="#6e2a0c" />
        </linearGradient>
        <radialGradient id="gf-lamp" cx=".5" cy=".5" r=".6">
          <stop offset="0" stopColor="#fff6d6" />
          <stop offset=".45" stopColor="#ffd477" />
          <stop offset="1" stopColor="#e0832a" />
        </radialGradient>
        <radialGradient id="gf-jaaliGlow" cx=".5" cy=".62" r=".7">
          <stop offset="0" stopColor="#fff0c2" />
          <stop offset=".45" stopColor="#f6b552" />
          <stop offset="1" stopColor="#9a4415" />
        </radialGradient>
        <pattern id="gf-jaaliDark" width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M7,0 L14,7 L7,14 L0,7 Z" fill="none" stroke="#5a2208" strokeWidth="2.4" />
          <circle cx="7" cy="7" r="1.6" fill="#5a2208" />
        </pattern>
        <radialGradient id="gf-ruby" cx=".5" cy=".3" r=".8">
          <stop offset="0" stopColor="#f0647a" />
          <stop offset=".6" stopColor="#b3173a" />
          <stop offset="1" stopColor="#6d0a20" />
        </radialGradient>
        <linearGradient id="gf-jade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6fbf7a" />
          <stop offset="1" stopColor="#1f5a2f" />
        </linearGradient>
        <radialGradient id="gf-sun" cx=".4" cy=".35" r=".75">
          <stop offset="0" stopColor="#fff6cf" />
          <stop offset=".5" stopColor="#f0c75e" />
          <stop offset="1" stopColor="#a8741c" />
        </radialGradient>
        <radialGradient id="gf-sunGlow">
          <stop offset="0" stopColor="#ffe7a3" stopOpacity=".9" />
          <stop offset=".5" stopColor="#ffd27a" stopOpacity=".3" />
          <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
        <filter id="gf-blur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <clipPath id="gf-wallClip">
          <path d={WALL} clipRule="evenodd" />
        </clipPath>
      </defs>

      {/* ---------- the palace wall (with the doorway cut out) ---------- */}
      <path d={WALL} fillRule="evenodd" fill="url(#gf-wall)" />
      <path d={WALL} fillRule="evenodd" fill="url(#gf-light)" />

      <g clipPath="url(#gf-wallClip)">
        {/* string course & plinth running across the whole façade */}
        <rect x="-2800" y="114" width="6400" height="40" fill="#ead8b4" />
        <rect x="-2800" y="113" width="6400" height="2.5" fill="#b8862b" />
        <rect x="-2800" y="153" width="6400" height="2.5" fill="#b8862b" />
        <line x1="-2800" y1="134" x2="3600" y2="134" stroke="#c9a05a" strokeWidth="4" strokeDasharray="0 18" strokeLinecap="round" />
        <rect x="-2800" y="1296" width="6400" height="46" fill="#e3cda4" />
        <rect x="-2800" y="1294" width="6400" height="3" fill="#b8862b" />
        {/* depth: soft shadow around the recessed doorway */}
        <path d={ARCH_MID} fill="none" stroke="#4a1e08" strokeOpacity=".4" strokeWidth="150" filter="url(#gf-blur)" />
      </g>

      {/* ---------- wide screens: balconies & lanterns either side ---------- */}
      {wings && (
        <>
          <Jharokha cx={-330} />
          <Jharokha cx={1130} />
          <Lantern cx={-120} delay="-0.6s" />
          <Lantern cx={920} delay="-1.9s" />
        </>
      )}

      {/* ---------- floor & steps ---------- */}
      <rect x="-2800" y="1341" width="6400" height="1259" fill="url(#gf-floor)" />
      <rect x="-2800" y="1356" width="6400" height="22" fill="#eadbbd" />
      <rect x="-2800" y="1356" width="6400" height="2" fill="#fff6e2" />
      <rect x="-2800" y="1378" width="6400" height="26" fill="#dcc8a4" />
      <rect x="-2800" y="1378" width="6400" height="2" fill="#f4e8cf" />
      <rect x="-2800" y="1404" width="6400" height="12" fill="#000" opacity=".06" />

      {/* ---------- the rectangular frame (pishtaq) & spandrel inlays ---------- */}
      <rect x="24" y="156" width="752" height="1186" fill="none" stroke="#6b4a12" strokeWidth="14" />
      <rect x="24" y="156" width="752" height="1186" fill="none" stroke="url(#gf-goldH)" strokeWidth="9" />
      <rect x="33" y="165" width="734" height="1177" fill="none" stroke="#e9c35e" strokeWidth="4" strokeDasharray="0 1" pathLength={240} strokeLinecap="round" />
      <rect x="40" y="172" width="720" height="1170" fill="none" stroke="#b8862b" strokeWidth="1.5" />
      <Rosette cx={108} cy={300} r={44} />
      <Rosette cx={692} cy={300} r={44} />
      <Rosette cx={230} cy={232} r={16} />
      <Rosette cx={570} cy={232} r={16} />

      {/* ---------- the carved gold arch ---------- */}
      <g fill="none" strokeLinejoin="round">
        <path d={ARCH_MID} stroke="#5d3c0c" strokeWidth="104" />
        <path d={ARCH_MID} stroke="url(#gf-band)" strokeWidth="96" />
        <path d={ARCH_MID} stroke="#8c6119" strokeWidth="74" />
        <path d={ARCH_MID} stroke="#5c0c1c" strokeWidth="68" />
        <path d={ARCH_MID} stroke="#76162a" strokeWidth="44" />
        <path d={ARCH_MID} stroke="#f4d98c" strokeWidth="10" strokeDasharray="0 1" pathLength={109} strokeLinecap="round" />
        <path d={ARCH_MID} stroke="#b3173a" strokeWidth="4" strokeDasharray="0 1" pathLength={109} strokeDashoffset={0.5} strokeLinecap="round" />
      </g>
      {/* impost blocks at the spring of the arch, and the bases */}
      {[96, 704].map((cx) => (
        <g key={cx}>
          <rect x={cx - 56} y={598} width={112} height={40} fill="url(#gf-goldH)" stroke="#5d3c0c" strokeWidth="2" />
          <rect x={cx - 49} y={604} width={98} height={28} fill="#5c0c1c" stroke="#e9c35e" strokeWidth="1.5" />
          <Rosette cx={cx} cy={618} r={11} />
          <rect x={cx - 60} y={1290} width={120} height={52} fill="url(#gf-goldH)" stroke="#5d3c0c" strokeWidth="2" />
          <rect x={cx - 52} y={1298} width={104} height={36} fill="#5c0c1c" stroke="#e9c35e" strokeWidth="1.5" />
          <path d={`M${cx},1302 L${cx + 14},1316 L${cx},1330 L${cx - 14},1316 Z`} fill="url(#gf-gold)" />
        </g>
      ))}
      {/* inner lip and scalloped cusps over the doors */}
      <path d={ARCH_EDGE} fill="none" stroke="#3d2206" strokeWidth="16" strokeLinejoin="round" />
      <path d={ARCH_EDGE} fill="none" stroke="url(#gf-gold)" strokeWidth="11" strokeLinejoin="round" />
      <path d={ARCH_CURVE} fill="none" stroke="#6b4a12" strokeWidth="27" strokeDasharray="0 1" pathLength={25} strokeLinecap="round" />
      <path d={ARCH_CURVE} fill="none" stroke="#e2b553" strokeWidth="23" strokeDasharray="0 1" pathLength={25} strokeLinecap="round" />
      <path d={ARCH_CURVE} fill="none" stroke="#fbe7a8" strokeWidth="9" strokeDasharray="0 1" pathLength={25} strokeLinecap="round" />
      <path d={ARCH_EDGE} fill="none" stroke="#fff3c4" strokeWidth="5" strokeDasharray="0 1" pathLength={120} strokeLinecap="round" />

      {/* threshold */}
      <rect x="20" y="1336" width="760" height="20" fill="url(#gf-goldH)" stroke="#6b4a12" strokeWidth="1.5" />
      {floorPetals.map((p, i) => (
        <ellipse key={i} cx={p.x} cy={p.y} rx={n(6 * p.s)} ry={n(3.6 * p.s)} fill={p.c} opacity=".9" transform={`rotate(${p.r} ${p.x} ${p.y})`} />
      ))}

      {/* ---------- crest: chhajja, battlements, chhatris & the Mewar sun ---------- */}
      <path d="M-16,156 H816 L800,114 H0 Z" fill="url(#gf-gold)" stroke="#6b4a12" strokeWidth="1.5" />
      <rect x="-16" y="155" width="832" height="4" fill="#4a2a08" opacity=".45" />
      <text
        x="400"
        y="144"
        textAnchor="middle"
        fontSize="25"
        fill="#5a0d1a"
        style={{ fontFamily: "var(--font-deva), serif" }}
      >
        {wedding.gateTitle}
      </text>
      {ANCHORS.map((x) => (
        <path
          key={x}
          d={`M${x - 9},156 H${x + 9} V161 C${x + 9},170 ${x + 3},172 ${x},181 C${x - 3},172 ${x - 9},170 ${x - 9},161 Z`}
          fill="url(#gf-gold)"
          stroke="#6b4a12"
          strokeWidth="1"
        />
      ))}
      {MERLONS.map((x) => (
        <path
          key={x}
          d={`M${x},114 V102 C${x},94 ${x + 9},90 ${x + 15},80 C${x + 21},90 ${x + 30},94 ${x + 30},102 V114 Z`}
          fill="#f6ead2"
          stroke="#b8862b"
          strokeWidth="1.5"
        />
      ))}
      <Chhatri cx={50} />
      <Chhatri cx={750} />
      <Sun />
      <path d="M332,114 C350,104 362,98 376,98 H424 C438,98 450,104 468,114 Z" fill="url(#gf-gold)" stroke="#6b4a12" strokeWidth="1.2" />

      {/* ---------- marigold toran ---------- */}
      <Toran />

      {/* ---------- diyas ---------- */}
      <Diya x={60} y={1358} />
      <Diya x={740} y={1358} delay="-0.8s" />
      <Diya x={-200} y={1358} delay="-0.3s" />
      <Diya x={1000} y={1358} delay="-1.1s" />
      <Diya x={-470} y={1358} delay="-0.5s" />
      <Diya x={1270} y={1358} delay="-1.4s" />
    </svg>
  );
}

/** Memoised: the façade never changes, so React never needs to re-render its ~1,000 SVG nodes. */
export default memo(GateFrame);
