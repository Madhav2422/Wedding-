import { memo } from "react";
import { n, petal, ring } from "@/lib/svg";
import { DOOR_LEFT, MEDALLION } from "./geometry";

type Props = {
  side: "left" | "right";
};

const viewBoxFor = (side: Props["side"]) => (side === "left" ? "140 290 260 1050" : "400 290 260 1050");
const mirrorFor = (side: Props["side"]) => (side === "right" ? "matrix(-1 0 0 1 800 0)" : undefined);

const TOP_PANEL = "M172,800 V640 C172,505 272,424 362,382 Q380,374 386,356 V800 Z";
const RAILS = [818, 1117, 1323];
const railStuds = Array.from({ length: 13 }, (_, i) => n(162 + i * 18.5));
const edgeStuds = Array.from({ length: 21 }, (_, i) => 660 + i * 32);

function Stud({ x, y, r = 5, fill }: { x: number; y: number; r?: number; fill: string }) {
  return (
    <g>
      <circle cx={x + 1} cy={y + 1.5} r={r} fill="#160205" opacity={0.55} />
      <circle cx={x} cy={y} r={r} fill={fill} />
    </g>
  );
}

/** One carved palace door. Drawn as the LEFT door; the right door is mirrored. */
function DoorArt({ side }: Props) {
  const p = side === "left" ? "dl" : "dr";
  const u = (id: string) => `url(#${p}-${id})`;
  const viewBox = viewBoxFor(side);
  const mirror = mirrorFor(side);
  const { cx, cy } = MEDALLION;

  return (
    <svg viewBox={viewBox} width="100%" height="100%" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${p}-wood`} x1="140" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3a0710" />
          <stop offset=".35" stopColor="#651223" />
          <stop offset=".8" stopColor="#7d1b2d" />
          <stop offset="1" stopColor="#5b0f1e" />
        </linearGradient>
        <linearGradient id={`${p}-gold`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2bf" />
          <stop offset=".22" stopColor="#e9c35e" />
          <stop offset=".5" stopColor="#b6852a" />
          <stop offset=".74" stopColor="#f0cf78" />
          <stop offset="1" stopColor="#94661a" />
        </linearGradient>
        <linearGradient id={`${p}-seam`} x1="388" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6e4a10" />
          <stop offset=".35" stopColor="#f3d684" />
          <stop offset=".7" stopColor="#c08f30" />
          <stop offset="1" stopColor="#8a5f17" />
        </linearGradient>
        <radialGradient id={`${p}-stud`} cx=".35" cy=".32" r=".75">
          <stop offset="0" stopColor="#fff7d1" />
          <stop offset=".35" stopColor="#e9bf5c" />
          <stop offset=".8" stopColor="#9b6a1b" />
          <stop offset="1" stopColor="#5e3c0a" />
        </radialGradient>
        <linearGradient id={`${p}-petal`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbe7a6" />
          <stop offset=".55" stopColor="#d9a845" />
          <stop offset="1" stopColor="#8c5e16" />
        </linearGradient>
        <linearGradient id={`${p}-hinge`} x1="140" y1="0" x2="235" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#000" stopOpacity=".5" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <pattern id={`${p}-grain`} width="16" height="240" patternUnits="userSpaceOnUse">
          <path d="M4 0 Q7 60 4 120 T4 240" fill="none" stroke="#000" strokeOpacity=".2" strokeWidth="1" />
          <path d="M11 0 Q9 80 12 150 T11 240" fill="none" stroke="#ffc2b0" strokeOpacity=".06" strokeWidth="1" />
        </pattern>
        <pattern id={`${p}-jaali`} x="172" y="356" width="22" height="22" patternUnits="userSpaceOnUse">
          <rect width="22" height="22" fill="#3c0711" />
          <path d="M11 0 L22 11 L11 22 L0 11 Z" fill="none" stroke="#d6a548" strokeWidth="1.3" />
          <path d="M0 0 L22 22 M22 0 L0 22" stroke="#d6a548" strokeOpacity=".3" strokeWidth=".8" />
          <circle cx="11" cy="11" r="3" fill="#e9c46a" />
          {[0, 22].flatMap((x) => [0, 22].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" fill="#e9c46a" />))}
        </pattern>
        <pattern id={`${p}-lattice`} x="172" y="1134" width="35.667" height="29" patternUnits="userSpaceOnUse">
          <rect width="35.667" height="29" fill="#4a0a16" />
          <path d="M17.83 0 L35.667 14.5 L17.83 29 L0 14.5 Z" fill="none" stroke="#c9973a" strokeOpacity=".75" strokeWidth="1.3" />
          {[0, 35.667].flatMap((x) =>
            [0, 29].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3.4" fill="#d8a94b" />),
          )}
          <circle cx="17.83" cy="14.5" r="2.2" fill="#e9c46a" />
        </pattern>
        <clipPath id={`${p}-clip`}>
          <path d={DOOR_LEFT} />
        </clipPath>
      </defs>

      <g transform={mirror}>
        <g clipPath={u("clip")}>
          {/* wood */}
          <path d={DOOR_LEFT} fill={u("wood")} />
          <rect x="140" y="290" width="260" height="1050" fill={u("grain")} />
          {[192, 244, 296, 348].map((x) => (
            <line key={x} x1={x} y1="290" x2={x} y2="1340" stroke="#22030a" strokeOpacity=".45" strokeWidth="1.4" />
          ))}
          <rect x="140" y="290" width="100" height="1050" fill={u("hinge")} />

          {/* upper arched jaali panel */}
          <path d={TOP_PANEL} fill={u("jaali")} />
          <path d={TOP_PANEL} fill="none" stroke={u("gold")} strokeWidth="6" />
          <path d={TOP_PANEL} fill="none" stroke="#3c0711" strokeWidth="2" />

          {/* middle panel holding half of the mandala */}
          <rect x="172" y="836" width="214" height="262" fill="#4e0b18" />
          <rect x="172" y="836" width="214" height="262" fill="none" stroke={u("gold")} strokeWidth="6" />
          <rect x="172" y="836" width="214" height="262" fill="none" stroke="#4e0b18" strokeWidth="2" />
          {[
            [182, 846, 1, 1],
            [182, 1088, 1, -1],
          ].map(([x, y, sx, sy]) => (
            <g key={`${x}-${y}`}>
              <path
                d={`M${x},${y + sy * 22} V${y} H${x + sx * 22}`}
                fill="none"
                stroke="#e3b553"
                strokeWidth="2.4"
              />
              <circle cx={x + sx * 6} cy={y + sy * 6} r="3" fill="#e3b553" />
            </g>
          ))}

          {/* the mandala (each door shows one half) */}
          <g transform={`translate(${cx} ${cy})`}>
            <circle r="124" fill="#3a0610" stroke={u("gold")} strokeWidth="5" />
            <circle r="116" fill="none" stroke="#f3d684" strokeOpacity=".7" strokeWidth="1.2" />
            <circle r="108" fill="none" stroke="#e9c35e" strokeWidth="6" strokeDasharray="0 1" pathLength={48} strokeLinecap="round" />
            {ring(16).map((a) => (
              <path key={a} d={petal(52, 100, 20)} transform={`rotate(${a})`} fill={u("petal")} stroke="#6b4410" strokeWidth=".8" />
            ))}
            {ring(16, 11.25).map((a) => (
              <path key={a} d={petal(56, 88, 11)} transform={`rotate(${a})`} fill="#7a1528" stroke="#e3b553" strokeWidth="1" />
            ))}
            <circle r="52" fill="#4a0a15" stroke={u("gold")} strokeWidth="3" />
            {ring(12).map((a) => (
              <path key={a} d={petal(20, 48, 10)} transform={`rotate(${a})`} fill={u("petal")} stroke="#6b4410" strokeWidth=".6" />
            ))}
            <circle r="20" fill={u("stud")} />
          </g>

          {/* lower lattice panel */}
          <rect x="172" y="1134" width="214" height="174" fill={u("lattice")} />
          <rect x="172" y="1134" width="214" height="174" fill="none" stroke={u("gold")} strokeWidth="6" />
          <rect x="172" y="1134" width="214" height="174" fill="none" stroke="#4a0a16" strokeWidth="2" />

          {/* brass studs */}
          {RAILS.map((y) => railStuds.map((x) => <Stud key={`${x}-${y}`} x={x} y={y} fill={u("stud")} />))}
          {edgeStuds.map((y) => (
            <Stud key={y} x={157} y={y} r={4.5} fill={u("stud")} />
          ))}

          {/* ring knocker */}
          <circle cx="366" cy="1158" r="10" fill={u("stud")} />
          <circle cx="366" cy="1190" r="23" fill="none" stroke="#2a0509" strokeOpacity=".6" strokeWidth="8" transform="translate(1.5 2.5)" />
          <circle cx="366" cy="1190" r="23" fill="none" stroke={u("gold")} strokeWidth="6" />
          <circle cx="366" cy="1190" r="23" fill="none" stroke="#fff3c4" strokeOpacity=".5" strokeWidth="1.2" strokeDasharray="20 40" />

          {/* centre astragal where the doors meet */}
          <rect x="388" y="290" width="12" height="1050" fill={u("seam")} />
          <line x1="388.5" y1="290" x2="388.5" y2="1340" stroke="#2a0509" strokeWidth="1.2" />
          <line x1="394" y1="300" x2="394" y2="1336" stroke="#fff3c4" strokeWidth="4" strokeDasharray="0 1" pathLength={74} strokeLinecap="round" />

          {/* door edge */}
          <path d={DOOR_LEFT} fill="none" stroke={u("gold")} strokeWidth="14" />
        </g>
      </g>
    </svg>
  );
}

export default memo(DoorArt);

/**
 * A dark silhouette of the door laid on top of it. Fading this layer in darkens the
 * door as it turns away from the light, without ever repainting the carved artwork.
 */
export const DoorShade = memo(function DoorShade({ side, className }: Props & { className?: string }) {
  return (
    <svg className={className} viewBox={viewBoxFor(side)} width="100%" height="100%" aria-hidden="true" focusable="false">
      <path d={DOOR_LEFT} transform={mirrorFor(side)} fill="#0b0204" />
    </svg>
  );
});
