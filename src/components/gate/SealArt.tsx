import { memo } from "react";
import { initials, wedding } from "@/config/wedding";
import { waxOutline } from "@/lib/svg";

const OUTLINE = waxOutline(88, 14, 3.2);

/** The royal wax seal that holds the gates shut. */
function SealArt() {
  const ringText = `THE WEDDING OF · ${wedding.groom.toUpperCase()} & ${wedding.bride.toUpperCase()} · `;

  return (
    <svg viewBox="-100 -100 200 200" width="100%" height="100%" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="seal-wax" cx=".4" cy=".35" r=".75">
          <stop offset="0" stopColor="#c0304a" />
          <stop offset=".55" stopColor="#8a1528" />
          <stop offset="1" stopColor="#560a18" />
        </radialGradient>
        <linearGradient id="seal-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1b8" />
          <stop offset=".4" stopColor="#e3b452" />
          <stop offset=".7" stopColor="#a8761f" />
          <stop offset="1" stopColor="#f5d98a" />
        </linearGradient>
        <path id="seal-ring" d="M-63,0 A63,63 0 1,1 63,0 A63,63 0 1,1 -63,0" />
      </defs>

      <path d={OUTLINE} fill="url(#seal-wax)" />
      <path d={OUTLINE} fill="none" stroke="#ffc2cc" strokeOpacity=".2" strokeWidth="2" transform="translate(-1 -1.5)" />
      <circle r="79" fill="none" stroke="url(#seal-gold)" strokeWidth="2.6" />
      <circle r="74.5" fill="none" stroke="url(#seal-gold)" strokeWidth=".8" />
      <circle r="51" fill="#6e0f20" stroke="url(#seal-gold)" strokeWidth="2.2" />
      <circle r="46" fill="none" stroke="url(#seal-gold)" strokeOpacity=".6" strokeWidth=".7" />

      <text fontSize="10.5" fill="url(#seal-gold)" style={{ fontFamily: "var(--font-cinzel), serif" }}>
        <textPath href="#seal-ring" textLength="390" lengthAdjust="spacing">
          {ringText}
        </textPath>
      </text>

      <text y="15" textAnchor="middle" fill="url(#seal-gold)" style={{ fontFamily: "var(--font-script), cursive" }}>
        <tspan fontSize="44">{initials.groom}</tspan>
        <tspan fontSize="24" dy="-8" dx="1">
          &amp;
        </tspan>
        <tspan fontSize="44" dy="8" dx="1">
          {initials.bride}
        </tspan>
      </text>
    </svg>
  );
}

export default memo(SealArt);
