import { memo, type ReactNode } from "react";
import { ARCH, ARCH_MASK, archOutline, cusps, H, W } from "./arch";
import s from "./scenes.module.css";

const OUTER = archOutline(9, H + 4);
const RIM = archOutline(3.5, H);
const CUSPS = cusps(9);

/** A jharokha (palace window): the scene is cut to the arch and framed in gold. */
function ArchWindow({ id, children }: { id: string; children: ReactNode }) {
  const gold = `${id}-gold`;
  return (
    <div className={s.window}>
      <div className={s.inside} style={{ maskImage: ARCH_MASK, WebkitMaskImage: ARCH_MASK }}>
        {children}
      </div>
      <svg className={s.frame} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <defs>
          <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff1b8" />
            <stop offset="0.35" stopColor="#e9c35e" />
            <stop offset="0.65" stopColor="#b9862c" />
            <stop offset="1" stopColor="#f6dc8a" />
          </linearGradient>
        </defs>
        <g fill="none" stroke={`url(#${gold})`} strokeLinecap="round" strokeLinejoin="round">
          <path d={OUTER} strokeWidth={1.4} opacity={0.75} />
          <path d={RIM} strokeWidth={4} />
          <path d={CUSPS} strokeWidth={1.5} opacity={0.85} />
        </g>
        {/* lotus-bud finial on the apex */}
        <path
          d="M200,-30C207,-22 209,-16 200,-8C191,-16 193,-22 200,-30ZM188,-6C194,-12 206,-12 212,-6C206,-3 194,-3 188,-6Z"
          fill={`url(#${gold})`}
        />
        {/* jharokha ledge with little brackets underneath */}
        <path d={`M-16,${H + 2}H${W + 16}V${H + 10}H-16Z`} fill={`url(#${gold})`} />
        <path
          d={Array.from({ length: 8 }, (_, i) => {
            const x = 25 + i * 50;
            return `M${x - 13},${H + 10}C${x - 13},${H + 23} ${x + 13},${H + 23} ${x + 13},${H + 10}`;
          }).join("")}
          fill="none"
          stroke={`url(#${gold})`}
          strokeWidth={1.6}
        />
        <path d={ARCH} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={1} />
      </svg>
    </div>
  );
}

export default memo(ArchWindow);
