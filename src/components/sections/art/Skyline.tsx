import { memo } from "react";
import { seeded } from "@/lib/random";

/**
 * Night silhouette of a lakeside Udaipur palace, lit windows and all,
 * mirrored in the still water of the lake.
 */
const HORIZON = 220;

type Block = { x: number; y: number; w: number };

// Palace masses: x, top y, width (they all reach down to the waterline).
const BLOCKS: Block[] = [
  { x: 40, y: 182, w: 130 },
  { x: 160, y: 160, w: 100 },
  { x: 300, y: 150, w: 600 },
  { x: 360, y: 115, w: 480 },
  { x: 450, y: 88, w: 300 },
  { x: 540, y: 66, w: 120 },
  { x: 330, y: 96, w: 34 },
  { x: 836, y: 96, w: 34 },
  { x: 930, y: 166, w: 110 },
  { x: 1040, y: 184, w: 130 },
];

const CHHATRIS: [number, number, number][] = [
  [105, 182, 0.8],
  [210, 160, 0.9],
  [347, 96, 1],
  [853, 96, 1],
  [380, 115, 0.8],
  [820, 115, 0.8],
  [466, 88, 0.85],
  [734, 88, 0.85],
  [985, 166, 0.9],
  [1105, 184, 0.75],
];

/** Lit windows on each tier. */
const WINDOWS = (() => {
  const rnd = seeded(41);
  const rows: [number, number, number, number][] = [
    // y, xStart, xEnd, step
    [160, 312, 890, 16],
    [178, 312, 890, 16],
    [196, 312, 890, 16],
    [124, 372, 830, 16],
    [138, 372, 830, 16],
    [97, 462, 740, 16],
    [74, 552, 650, 16],
    [172, 172, 250, 14],
    [192, 52, 160, 14],
    [176, 942, 1030, 14],
    [196, 1052, 1160, 14],
  ];
  const out: { x: number; y: number; o: number }[] = [];
  for (const [y, x0, x1, step] of rows) {
    for (let x = x0; x <= x1; x += step) {
      if (rnd() < 0.28) continue;
      out.push({ x, y, o: Math.round((0.45 + rnd() * 0.55) * 100) / 100 });
    }
  }
  return out;
})();

function Chhatri({ cx, base, s }: { cx: number; base: number; s: number }) {
  return (
    <g transform={`translate(${cx} ${base}) scale(${s})`}>
      <rect x="-14" y="-4" width="28" height="4" />
      <rect x="-12" y="-18" width="4" height="14" />
      <rect x="8" y="-18" width="4" height="14" />
      <rect x="-15" y="-21" width="30" height="3" />
      <path d="M-12,-21 C-12,-33 -4,-37 0,-42 C4,-37 12,-33 12,-21 Z" />
      <rect x="-0.8" y="-48" width="1.6" height="7" />
    </g>
  );
}

function Skyline({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1200 320" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sk-water" x1="0" y1={HORIZON} x2="0" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2a0a18" />
          <stop offset="1" stopColor="#0b0207" />
        </linearGradient>
        <linearGradient id="sk-fade" x1="0" y1={HORIZON} x2="0" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="sk-mask" maskUnits="userSpaceOnUse" x="0" y={HORIZON} width="1200" height="100">
          <rect x="0" y={HORIZON} width="1200" height="100" fill="url(#sk-fade)" />
        </mask>

        <g id="sk-palace">
          <g fill="#16040d">
            {BLOCKS.map((b) => (
              <rect key={`${b.x}-${b.y}`} x={b.x} y={b.y} width={b.w} height={HORIZON - b.y} />
            ))}
            {CHHATRIS.map(([cx, base, s]) => (
              <Chhatri key={`${cx}-${base}`} cx={cx} base={base} s={s} />
            ))}
            {/* the great central dome */}
            <path d="M574,66 C574,44 591,36 600,24 C609,36 626,44 626,66 Z" />
            <rect x="598.8" y="10" width="2.4" height="16" />
            <circle cx="600" cy="12" r="2.6" />
            {/* projecting balconies on the main wall */}
            {[420, 520, 680, 780].map((x) => (
              <g key={x}>
                <rect x={x - 16} y="142" width="32" height="10" />
                <path d={`M${x - 16},142 C${x - 14},132 ${x - 6},128 ${x},126 C${x + 6},128 ${x + 14},132 ${x + 16},142 Z`} />
              </g>
            ))}
          </g>
          <g fill="#f6c766">
            {WINDOWS.map((w) => (
              <rect key={`${w.x}-${w.y}`} x={w.x} y={w.y} width="5" height="8" rx="2.5" opacity={w.o} />
            ))}
          </g>
        </g>
      </defs>

      {/* distant hills */}
      <path
        d="M0,196 C120,168 220,184 320,170 C420,158 480,180 560,174 C660,166 760,148 880,168 C980,184 1080,163 1200,176 V220 H0 Z"
        fill="#2c0b1c"
      />
      <use href="#sk-palace" />

      {/* lake + reflection */}
      <rect x="0" y={HORIZON} width="1200" height="100" fill="url(#sk-water)" />
      <g mask="url(#sk-mask)">
        <use href="#sk-palace" transform={`translate(0 ${HORIZON * 2}) scale(1 -1)`} opacity=".6" />
      </g>
      <rect x="0" y={HORIZON - 0.5} width="1200" height="1.2" fill="#f6c766" opacity=".25" />
    </svg>
  );
}

export default memo(Skyline);
