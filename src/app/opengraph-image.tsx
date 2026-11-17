import { cloneElement, type CSSProperties, type ReactElement, type ReactNode, type SVGProps } from "react";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import DoorArt from "@/components/gate/DoorArt";
import GateFrame from "@/components/gate/GateFrame";
import SealArt from "@/components/gate/SealArt";
import { MEDALLION } from "@/components/gate/geometry";
import { initials, wedding, weddingDate } from "@/config/wedding";
import { seeded } from "@/lib/random";
import { n, petal, quadAt, ring } from "@/lib/svg";
import { staticSvg } from "@/lib/staticSvg";

/**
 * The picture that appears when the website link is sent on WhatsApp, iMessage, Instagram…
 * Tapping it opens the site.
 *
 * It shows the same closed palace gates the guest is about to open — warm light glowing
 * through the crack — with the couple's names either side, framed like a royal invitation
 * card. Everything is read from src/config/wedding.ts, so the picture updates by itself
 * when the names, date or city change.
 */

export const alt = `${wedding.groom} & ${wedding.bride}'s wedding invitation: the palace gates, waiting to be opened`;
export const size = { width: 1200, height: 630 };
/** JPEG keeps the file small; WhatsApp skips preview pictures that are too heavy. */
export const contentType = "image/jpeg";

const W = size.width;
const H = size.height;

/* ---------- camera: where the 800 × 1400 gate drawing sits in the picture ---------- */
const SCALE = 0.39; // picture pixels per drawing unit
const ORIGIN = { x: 400 - W / 2 / SCALE, y: -95 }; // drawing point at the top-left corner
const px = (x: number) => n((x - ORIGIN.x) * SCALE);
const py = (y: number) => n((y - ORIGIN.y) * SCALE);
const VIEWBOX = `${ORIGIN.x} ${ORIGIN.y} ${W / SCALE} ${H / SCALE}`;

/** Same size as on the site, so the gold lotus petals of the door's mandala ring it. */
const SEAL = 192 * SCALE;

/* ---------- the card's border ---------- */
const BAND = 14; // maroon edge
const INNER = 23; // the picture starts inside the second gold rule

/** The wall either side of the gate, where the names go. */
const PANEL = (() => {
  const left = INNER + 11;
  const width = px(17) - 14 - left; // up to the gate's carved frame
  return { left, width, top: py(156), height: py(1294) - py(156) };
})();

/** The garland across the façade hangs at the same height as the gate's own toran. */
const GARLAND_Y = py(178);

const MAROON = "#5a0d1a";
const BROWN = "#6e430f";

/* ------------------------------------------------------------------ */
/*  Sizing text so long names and cities still fit                      */
/* ------------------------------------------------------------------ */
const NAME_MAX = 148;
const DETAIL_MAX = 30;
const DETAIL_SPACING = 5;

/** Letter widths in em, measured from the fonts, so text is fitted rather than guessed. */
const widths = (chars: string, ems: number[]) => new Map([...chars].map((c, i) => [c, ems[i]]));
// prettier-ignore
const CINZEL_600 = widths("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ,.-&'", [0.715,0.645,0.773,0.821,0.613,0.577,0.824,0.845,0.37,0.364,0.724,0.598,0.946,0.857,0.865,0.63,0.867,0.724,0.544,0.65,0.809,0.732,0.975,0.707,0.689,0.658,0.634,0.376,0.596,0.543,0.607,0.536,0.607,0.53,0.586,0.607,0.25,0.215,0.208,0.38,0.753,0.19]);
// prettier-ignore
const GREAT_VIBES = widths("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz -'.", [0.716,1.047,0.714,1.05,0.819,1.053,0.702,1.395,0.917,0.972,1.203,0.716,1.336,1.044,0.73,0.925,0.756,1.028,0.926,0.933,0.947,0.98,1.351,0.791,0.963,0.681,0.358,0.327,0.263,0.372,0.256,0.194,0.396,0.336,0.176,0.178,0.36,0.213,0.509,0.338,0.338,0.336,0.347,0.259,0.267,0.201,0.356,0.309,0.495,0.334,0.381,0.343,0.171,0.404,0.106,0.205]);
const ems = (text: string, table: Map<string, number>, fallback: number) =>
  [...text].reduce((sum, c) => sum + (table.get(c) ?? fallback), 0);

/** The biggest name size that fits the panel (with room for the capitals' swashes). */
function scriptSize(name: string) {
  const fit = (PANEL.width - 24) / (ems(name, GREAT_VIBES, 0.5) * 1.08);
  return Math.floor(Math.max(48, Math.min(NAME_MAX, fit)));
}

/** The biggest size at which every date / place line fits on one line. */
function detailSize(lines: string[]) {
  const fit = Math.min(...lines.map((l) => (PANEL.width - 24 - l.length * DETAIL_SPACING) / ems(l, CINZEL_600, 0.75)));
  return Math.floor(Math.max(14, Math.min(DETAIL_MAX, fit)));
}

/* ------------------------------------------------------------------ */
/*  Art                                                               */
/* ------------------------------------------------------------------ */

/** Places one of the site's SVG drawings on the picture. */
function art(element: ReactElement, box: { left: number; top: number; width: number; height: number }, viewBox?: string) {
  const svg = staticSvg(element) as ReactElement<SVGProps<SVGSVGElement>>;
  return cloneElement(svg, {
    width: box.width,
    height: box.height,
    viewBox: viewBox ?? svg.props.viewBox,
    style: { position: "absolute", left: box.left, top: box.top },
  });
}

/** A full-picture SVG layer, drawn in picture pixels. */
function Layer({ children }: { children: ReactNode }) {
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0 }}>
      {staticSvg(children)}
    </svg>
  );
}

const GOLD_STOPS = (
  <>
    <stop offset="0" stopColor="#fff2bf" />
    <stop offset=".22" stopColor="#e9c35e" />
    <stop offset=".5" stopColor="#b6852a" />
    <stop offset=".74" stopColor="#f0cf78" />
    <stop offset="1" stopColor="#94661a" />
  </>
);

/** The ruby-and-jade rosette from the palace arch, for the card's corners. */
function Rosette({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={r + 2.5} fill="#3a0610" />
      <circle r={r} fill="#f8f0de" stroke="url(#c-gold)" strokeWidth={2.2} />
      <circle r={r * 0.86} fill="none" stroke="#c49a4a" strokeWidth={1.3} strokeDasharray={`0 ${n((2 * Math.PI * r * 0.86) / 24)}`} strokeLinecap="round" />
      {ring(8).map((a) => (
        <path key={a} d={petal(r * 0.2, r * 0.8, r * 0.3)} transform={`rotate(${a})`} fill="url(#c-ruby)" stroke="#8a5a14" strokeWidth={0.5} />
      ))}
      {ring(8, 22.5).map((a) => (
        <path key={a} d={petal(r * 0.3, r * 0.66, r * 0.15)} transform={`rotate(${a})`} fill="url(#c-jade)" stroke="#8a5a14" strokeWidth={0.4} />
      ))}
      <circle r={r * 0.2} fill="url(#c-gold)" stroke="#8a5a14" strokeWidth={0.5} />
    </g>
  );
}

/** Maroon velvet edge, a string of pearls, two gilded rules and rosettes in the corners. */
function Border() {
  const rule = BAND + 1.5;
  return (
    <Layer>
      <defs>
        <linearGradient id="c-velvet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6a1022" />
          <stop offset=".5" stopColor="#4a0915" />
          <stop offset="1" stopColor="#5e0d1d" />
        </linearGradient>
        <linearGradient id="c-gold" x1="0" y1="0" x2="0" y2="1">
          {GOLD_STOPS}
        </linearGradient>
        <linearGradient id="c-goldD" x1="0" y1="0" x2="1" y2="1">
          {GOLD_STOPS}
        </linearGradient>
        <radialGradient id="c-ruby" cx=".5" cy=".3" r=".8">
          <stop offset="0" stopColor="#f0647a" />
          <stop offset=".6" stopColor="#b3173a" />
          <stop offset="1" stopColor="#6d0a20" />
        </radialGradient>
        <linearGradient id="c-jade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6fbf7a" />
          <stop offset="1" stopColor="#1f5a2f" />
        </linearGradient>
      </defs>
      <path d={`M0 0 H${W} V${H} H0 Z M${BAND} ${BAND} V${H - BAND} H${W - BAND} V${BAND} Z`} fillRule="evenodd" fill="url(#c-velvet)" />
      <rect x={BAND / 2} y={BAND / 2} width={W - BAND} height={H - BAND} fill="none" stroke="#f0cd73" strokeWidth={2.4} strokeDasharray="0 8" strokeLinecap="round" opacity={0.9} />
      <rect x={rule} y={rule} width={W - 2 * rule} height={H - 2 * rule} fill="none" stroke="url(#c-goldD)" strokeWidth={3} />
      <rect x={INNER - 0.5} y={INNER - 0.5} width={W - 2 * INNER + 1} height={H - 2 * INNER + 1} fill="none" stroke="#c9973a" strokeOpacity={0.85} strokeWidth={1} />
      {/* jewels on the inner corners (WhatsApp rounds off the picture's own corners) */}
      {[
        [INNER, INNER],
        [W - INNER, INNER],
        [INNER, H - INNER],
        [W - INNER, H - INNER],
      ].map(([x, y]) => (
        <Rosette key={`${x}-${y}`} cx={x} cy={y} r={11.5} />
      ))}
    </Layer>
  );
}

const LEAF = "M0,0 C7,9 7,24 0,36 C-7,24 -7,9 0,0 Z";

/** Marigold swags carrying the gate's toran across the whole façade, as for a wedding. */
function Garlands() {
  const s = SCALE;
  const beads = (d: string, length: number) => {
    const gap = n(length / Math.round(length / 5.2));
    return (
      <g fill="none" strokeLinecap="round">
        <path d={d} stroke="#c2410c" strokeWidth={16 * s} strokeDasharray={`0 ${gap}`} />
        <path d={d} stroke="#f97316" strokeWidth={14 * s} strokeDasharray={`0 ${gap}`} />
        <path d={d} stroke="#fbbf24" strokeWidth={13 * s} strokeDasharray={`0 ${n(gap * 2)}`} strokeDashoffset={gap} />
        <path d={d} stroke="#9a3412" strokeOpacity={0.5} strokeWidth={4 * s} strokeDasharray={`0 ${gap}`} />
      </g>
    );
  };

  const swag = (x0: number, x1: number, dip: number) => {
    const c = [(x0 + x1) / 2, GARLAND_Y + dip * 2] as const;
    const d = `M${x0},${GARLAND_Y} Q${c[0]},${c[1]} ${x1},${GARLAND_Y}`;
    const count = Math.round(Math.abs(x1 - x0) / 24);
    return (
      <g key={`${x0}-${x1}`}>
        {Array.from({ length: count }, (_, j) => {
          const t = (j + 0.5) / count;
          const [lx, ly] = quadAt([x0, GARLAND_Y], c, [x1, GARLAND_Y], t);
          return (
            <g key={j} transform={`translate(${lx} ${n(ly + 1.2)}) rotate(${j % 2 ? 14 : -14}) scale(${s})`}>
              <path d={LEAF} fill={j % 2 ? "#2f6d35" : "#3f8a44"} />
              <line x1="0" y1="3" x2="0" y2="31" stroke="#b9dfa9" strokeOpacity=".55" strokeWidth=".9" />
            </g>
          );
        })}
        {beads(d, Math.abs(x1 - x0) * 1.08)}
      </g>
    );
  };

  const ladi = (x: number, length: number) => {
    const end = GARLAND_Y + length;
    return (
      <g key={`l${x}`}>
        {beads(`M${x},${GARLAND_Y} V${end}`, length)}
        <circle cx={x} cy={end + 4.3} r={2.9} fill="#be123c" />
        <circle cx={x} cy={end + 4.3} r={1.4} fill="#881337" />
        <path d={`M${x},${end + 7} V${end + 12.5}`} stroke="#d4a743" strokeWidth={0.8} />
        <circle cx={x} cy={end + 13.3} r={1.3} fill="#e9c35e" />
      </g>
    );
  };

  // three swags each side, from the card's edge to the gate's own toran
  const gateL = px(24);
  const outer = PANEL.left - 4;
  const step = (gateL - outer) / 3;
  const anchors = [0, 1, 2, 3].map((i) => n(outer + step * i));
  const mirror = (x: number) => n(W - x);
  return (
    <Layer>
      {anchors.slice(0, -1).map((x, i) => swag(x, anchors[i + 1], 24))}
      {anchors.slice(0, -1).map((x, i) => swag(mirror(anchors[i + 1]), mirror(x), 24))}
      {ladi(anchors[0], 46)}
      {ladi(mirror(anchors[0]), 46)}
      {[anchors[1], anchors[2], mirror(anchors[1]), mirror(anchors[2])].map((x) => ladi(x, 12))}
    </Layer>
  );
}

/** Warm light from inside the palace, glowing through the crack of the doors and under them. */
function InnerLight() {
  const x = px(400);
  const top = py(300);
  const bottom = py(1340);
  return (
    <Layer>
      <defs>
        <radialGradient id="l-seam">
          <stop offset="0" stopColor="#fff4cf" stopOpacity=".75" />
          <stop offset=".4" stopColor="#ffd98a" stopOpacity=".3" />
          <stop offset="1" stopColor="#ffb85c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="l-line" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6da" stopOpacity="0" />
          <stop offset=".25" stopColor="#fff6da" stopOpacity=".85" />
          <stop offset=".75" stopColor="#fff6da" stopOpacity=".85" />
          <stop offset="1" stopColor="#fff6da" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="l-floor">
          <stop offset="0" stopColor="#fff6d8" stopOpacity="1" />
          <stop offset=".35" stopColor="#ffe09a" stopOpacity=".7" />
          <stop offset="1" stopColor="#ffb45a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={x} cy={(top + bottom) / 2} rx={15} ry={(bottom - top) / 2} fill="url(#l-seam)" />
      <rect x={x - 0.9} y={top} width={1.8} height={bottom - top} fill="url(#l-line)" />
      {/* light pouring out under the doors, across the threshold and steps */}
      <ellipse cx={x} cy={bottom + 12} rx={190} ry={26} fill="url(#l-floor)" opacity={0.85} />
      <ellipse cx={x} cy={bottom + 4} rx={95} ry={7} fill="url(#l-floor)" />
    </Layer>
  );
}

/** A four-pointed glint of light catching the gold. */
function Glint({ x, y, r }: { x: number; y: number; r: number }) {
  const k = r * 0.13;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r * 0.9} fill="url(#g-halo)" />
      <path d={`M0,${-r} L${k},${-k} L${r},0 L${k},${k} L0,${r} L${-k},${k} L${-r},0 L${-k},${-k} Z`} fill="#fffdf2" />
      <path d={`M0,${-r * 0.5} L${k},${-k} L${r * 0.5},0 L${k},${k} L0,${r * 0.5} L${-k},${k} L${-r * 0.5},0 L${-k},${-k} Z`} fill="#fffdf2" transform="rotate(45)" opacity={0.75} />
    </g>
  );
}

/** Specks and soft orbs of gold light drifting in front of the wall. */
const DUST = (() => {
  const rnd = seeded(5);
  return Array.from({ length: 40 }, (_, i) => {
    const orb = i % 8 === 0;
    const x = PANEL.left + rnd() * PANEL.width;
    return {
      x: n(i % 2 ? x : W - x),
      y: n(INNER + 40 + rnd() * (H - 2 * INNER - 120)),
      r: n(orb ? 7 + rnd() * 6 : 1.2 + rnd() * 2.6),
      o: n(orb ? 0.16 + rnd() * 0.12 : 0.5 + rnd() * 0.45),
    };
  });
})();

function Sparkle() {
  return (
    <Layer>
      <defs>
        <radialGradient id="g-dust">
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset=".45" stopColor="#f6cf6a" stopOpacity=".85" />
          <stop offset="1" stopColor="#f6cf6a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="g-halo">
          <stop offset="0" stopColor="#fff6d6" stopOpacity=".9" />
          <stop offset=".35" stopColor="#ffe08f" stopOpacity=".35" />
          <stop offset="1" stopColor="#ffd06a" stopOpacity="0" />
        </radialGradient>
      </defs>
      {DUST.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="url(#g-dust)" opacity={d.o} />
      ))}
      <Glint x={px(400) + 17} y={py(54) - 16} r={13} />
      <Glint x={px(400) + 2} y={py(258)} r={8} />
      <Glint x={px(MEDALLION.cx) + SEAL * 0.36} y={py(MEDALLION.cy) - SEAL * 0.36} r={11} />
    </Layer>
  );
}

/* ------------------------------------------------------------------ */
/*  Lettering                                                          */
/* ------------------------------------------------------------------ */

function Flourish() {
  return (
    <svg width="214" height="26" viewBox="0 0 214 26">
      <defs>
        <linearGradient id="f-gold" x1="0" y1="0" x2="214" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#b8862b" stopOpacity="0" />
          <stop offset=".35" stopColor="#c9973a" />
          <stop offset=".65" stopColor="#c9973a" />
          <stop offset="1" stopColor="#b8862b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M2 13 H88" stroke="url(#f-gold)" strokeWidth="1.6" />
      <path d="M126 13 H212" stroke="url(#f-gold)" strokeWidth="1.6" />
      <circle cx="93" cy="13" r="2.1" fill="#c9973a" />
      <circle cx="121" cy="13" r="2.1" fill="#c9973a" />
      <path d="M107 2 L118 13 L107 24 L96 13 Z" fill="#d4a443" stroke="#8a5a14" strokeWidth="1" />
      <path d="M107 7.5 L112.5 13 L107 18.5 L101.5 13 Z" fill="#7a1528" />
      <circle cx="107" cy="13" r="1.4" fill="#f6dc8a" />
    </svg>
  );
}

type PanelProps = { name: string; lines: string[]; side: "left" | "right"; fontSize: number; lineSize: number };

/** One name with its gold flourish and two lines (the date, or the city), on a pool of light. */
function NamePanel({ name, lines, side, fontSize, lineSize }: PanelProps) {
  const script: CSSProperties = { fontFamily: "Great Vibes", fontSize, lineHeight: 1.12, whiteSpace: "nowrap" };
  return (
    <div
      style={{
        position: "absolute",
        top: PANEL.top,
        height: PANEL.height,
        width: PANEL.width,
        [side]: PANEL.left,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 26,
      }}
    >
      {/* soft light on the wall behind the name, so it reads over the pattern */}
      <svg
        width={PANEL.width + 40}
        height={PANEL.height}
        viewBox={`0 0 ${PANEL.width + 40} ${PANEL.height}`}
        style={{ position: "absolute", left: -20, top: 0 }}
      >
        <defs>
          <radialGradient id="glow">
            <stop offset="0" stopColor="#fffdf6" stopOpacity="0.97" />
            <stop offset="0.5" stopColor="#fff9ea" stopOpacity="0.7" />
            <stop offset="1" stopColor="#fff8e8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx={(PANEL.width + 40) / 2} cy={PANEL.height / 2 + 14} rx={(PANEL.width + 40) / 2} ry={PANEL.height / 2} fill="url(#glow)" />
      </svg>

      {/* the name: maroon ink with a gilded edge */}
      <div style={{ display: "flex", position: "relative" }}>
        <div style={{ ...script, position: "absolute", left: 0, top: 2.5, color: "#d9ab4a" }}>{name}</div>
        <div
          style={{
            ...script,
            color: "transparent",
            backgroundImage: "linear-gradient(180deg, #8f1d34 0%, #6a0f22 45%, #42060f 100%)",
            backgroundClip: "text",
          }}
        >
          {name}
        </div>
      </div>

      <Flourish />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 14 }}>
        {lines.map((line) => (
          <div
            key={line}
            style={{
              fontFamily: "Cinzel",
              fontWeight: 600,
              fontSize: lineSize,
              letterSpacing: DETAIL_SPACING,
              lineHeight: 1.45,
              color: BROWN,
              whiteSpace: "nowrap",
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

/** The couple's initials, in gold, on the wax seal. */
function Monogram({ left, top }: { left: number; top: number }) {
  const gold: CSSProperties = { color: "#f8de97", textShadow: "0 1px 1.5px rgba(40, 3, 10, 0.85)" };
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: SEAL,
        height: SEAL,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Great Vibes",
      }}
    >
      <span style={{ ...gold, fontSize: SEAL * 0.29 }}>{initials.groom}</span>
      <span style={{ ...gold, fontSize: SEAL * 0.16, marginTop: -SEAL * 0.07, padding: "0 1px" }}>&amp;</span>
      <span style={{ ...gold, fontSize: SEAL * 0.29 }}>{initials.bride}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  The card                                                           */
/* ------------------------------------------------------------------ */

function Card({ dateLines, placeLines }: { dateLines: string[]; placeLines: string[] }) {
  const doorBox = { top: py(290), width: 260 * SCALE, height: 1050 * SCALE };
  const seal = { left: px(MEDALLION.cx) - SEAL / 2, top: py(MEDALLION.cy) - SEAL / 2, width: SEAL, height: SEAL };
  const fill: CSSProperties = { position: "absolute", left: 0, top: 0, width: W, height: H };
  const nameSize = Math.min(scriptSize(wedding.groom), scriptSize(wedding.bride));
  const lineSize = detailSize([...dateLines, ...placeLines]);

  return (
    <div style={{ ...fill, display: "flex", backgroundColor: "#f2e4c8" }}>
      {/* the closed doors, behind the façade */}
      {art(<DoorArt side="left" />, { ...doorBox, left: px(140) })}
      {art(<DoorArt side="right" />, { ...doorBox, left: px(400) })}
      {/* the palace wall, carved arch, toran, floor and diyas */}
      {art(<GateFrame wings={false} />, { left: 0, top: 0, width: W, height: H }, VIEWBOX)}

      {/* golden-hour warmth over the wall */}
      <div
        style={{
          ...fill,
          backgroundImage: "linear-gradient(180deg, rgba(255, 226, 160, 0.2) 0%, rgba(255, 226, 160, 0) 42%, rgba(255, 214, 150, 0) 70%, rgba(255, 200, 120, 0.12) 100%)",
        }}
      />
      <InnerLight />
      <Garlands />

      {/* the wax seal with the couple's monogram */}
      <svg
        width={SEAL * 1.6}
        height={SEAL * 1.6}
        viewBox="-160 -160 320 320"
        style={{ position: "absolute", left: seal.left - SEAL * 0.3, top: seal.top - SEAL * 0.3 + 5 }}
      >
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>
        <circle r="88" fill="#1e0207" opacity="0.6" filter="url(#shadow)" />
      </svg>
      {art(<SealArt />, seal)}
      {/* pearls in the band where the site writes "THE WEDDING OF …" (too small to read here) */}
      <svg width={SEAL} height={SEAL} viewBox="-100 -100 200 200" style={{ position: "absolute", left: seal.left, top: seal.top }}>
        <circle r="63" fill="none" stroke="#f0cd73" strokeWidth="4.2" strokeDasharray={`0 ${n((2 * Math.PI * 63) / 36)}`} strokeLinecap="round" />
      </svg>
      <Monogram left={seal.left} top={seal.top} />

      {/* both sides share one size, so the card stays symmetrical */}
      <NamePanel side="left" name={wedding.groom} lines={dateLines} fontSize={nameSize} lineSize={lineSize} />
      <NamePanel side="right" name={wedding.bride} lines={placeLines} fontSize={nameSize} lineSize={lineSize} />

      <Sparkle />

      {/* warm vignette */}
      <div
        style={{
          ...fill,
          backgroundImage: "radial-gradient(ellipse at 50% 52%, rgba(90, 40, 8, 0) 64%, rgba(90, 40, 8, 0.16) 100%)",
        }}
      />
      <Border />
    </div>
  );
}

/**
 * Downloads just the letters the picture needs from Google Fonts (as TrueType, which
 * `next/og` requires). Runs once, when the site is built.
 */
async function googleFont(family: string, text: string, weight?: number) {
  const axis = weight ? `:wght@${weight}` : "";
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}${axis}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url, { cache: "force-cache" })).text();
  const file = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!file) throw new Error(`Could not download the "${family}" font for the link-preview picture.`);
  return (await fetch(file, { cache: "force-cache" })).arrayBuffer();
}

export default async function Image() {
  const dateLines = [weddingDate.weekday, `${weddingDate.day} ${weddingDate.month} ${weddingDate.year}`].map((l) => l.toUpperCase());
  const placeLines = wedding.city.split(",").map((l) => l.trim().toUpperCase()).filter(Boolean);

  const scriptText = `${wedding.groom}${wedding.bride}${initials.groom}${initials.bride}&`;
  const serifText = [...dateLines, ...placeLines].join("");
  const [script, serif] = await Promise.all([googleFont("Great Vibes", scriptText), googleFont("Cinzel", serifText, 600)]);

  const png = await new ImageResponse(<Card dateLines={dateLines} placeLines={placeLines} />, {
    ...size,
    fonts: [
      { name: "Great Vibes", data: script, weight: 400, style: "normal" },
      { name: "Cinzel", data: serif, weight: 600, style: "normal" },
    ],
  }).arrayBuffer();

  const jpeg = await sharp(Buffer.from(png))
    // golden-hour grade: a touch warmer, richer and crisper
    .recomb([
      [1.03, 0.01, 0],
      [0, 1, 0],
      [0, -0.01, 0.945],
    ])
    .linear(1.05, -6)
    .modulate({ saturation: 1.05 })
    .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toBuffer();
  return new Response(new Uint8Array(jpeg), { headers: { "Content-Type": contentType } });
}
