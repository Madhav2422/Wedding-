import { memo, type CSSProperties } from "react";
import { n } from "@/lib/svg";
import s from "./Hero.module.css";

const COUNT = 9;

function LadiSvg({ length }: { length: number }) {
  const flowers = Math.floor(length / 13);
  return (
    <svg width="26" height={length + 36} viewBox={`-13 0 26 ${length + 36}`} aria-hidden="true" focusable="false">
      {/* soft shadow, drawn instead of a CSS filter so swaying stays cheap */}
      <line x1="1.5" y1="6" x2="1.5" y2={length + 4} stroke="#7c2d12" strokeOpacity=".16" strokeWidth="13" strokeLinecap="round" />
      <line x1="0" y1="0" x2="0" y2={length} stroke="#b45309" strokeWidth="1" />
      {Array.from({ length: flowers }, (_, k) => {
        const yellow = k % 2 === 1;
        return (
          <g key={k} transform={`translate(0 ${8 + k * 13})`}>
            <circle r="7" fill={yellow ? "#fbbf24" : "#f97316"} />
            <circle r="6.2" fill="none" stroke={yellow ? "#d97706" : "#c2410c"} strokeWidth="1.6" strokeDasharray="1.4 1.1" />
            <circle r="2.4" fill={yellow ? "#b45309" : "#9a3412"} />
          </g>
        );
      })}
      <g transform={`translate(0 ${length + 10})`}>
        <circle r="6.5" fill="#be123c" />
        <circle r="3" fill="#881337" />
        <line y1="6" y2="18" stroke="#d4a743" strokeWidth="1.5" />
        <circle cy="20" r="2.6" fill="#e9c35e" />
      </g>
    </svg>
  );
}

/** Marigold strings (genda phool ladi) hanging from the top of the screen. */
function Garlands() {
  return (
    <div className={s.garlands} aria-hidden="true">
      <div className={s.garlandTop} />
      {Array.from({ length: COUNT }, (_, i) => {
        const t = Math.abs(i - (COUNT - 1) / 2) / ((COUNT - 1) / 2); // 0 at centre → 1 at the edges
        const length = Math.round(56 + 150 * Math.pow(t, 1.5));
        return (
          <div
            key={i}
            className={`${s.ladiWrap} ${i % 2 ? s.optional : ""}`}
            style={{ left: `${((i + 0.5) / COUNT) * 100}%`, "--t": n(t) } as CSSProperties}
          >
            <div className={s.ladi} style={{ animationDelay: `${-i * 0.7}s` }}>
              <LadiSvg length={length} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default memo(Garlands);
