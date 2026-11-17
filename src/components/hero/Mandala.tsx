import { memo } from "react";
import { petal, ring } from "@/lib/svg";

/** Fine line-art mandala drawn in `currentColor`. */
function Mandala({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-200 -200 400 400" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <circle r="196" />
        <circle r="189" strokeWidth="3" strokeDasharray="0 1" pathLength={96} strokeLinecap="round" />
        {ring(48).map((a) => (
          <path key={a} d={petal(160, 184, 7)} transform={`rotate(${a})`} />
        ))}
        <circle r="158" />
        {ring(24).map((a) => (
          <path key={a} d={petal(108, 156, 17)} transform={`rotate(${a})`} />
        ))}
        {ring(24).map((a) => (
          <path key={a} d={petal(116, 146, 8)} transform={`rotate(${a})`} />
        ))}
        {ring(24, 7.5).map((a) => (
          <circle key={a} cx="0" cy="-150" r="2.2" fill="currentColor" transform={`rotate(${a})`} />
        ))}
        <circle r="106" />
        <circle r="100" strokeWidth="3" strokeDasharray="0 1" pathLength={64} strokeLinecap="round" />
        {ring(16).map((a) => (
          <path key={a} d={petal(58, 94, 15)} transform={`rotate(${a})`} />
        ))}
        {ring(16, 11.25).map((a) => (
          <path key={a} d={petal(62, 84, 7)} transform={`rotate(${a})`} />
        ))}
        <circle r="56" />
        {ring(8).map((a) => (
          <path key={a} d={petal(18, 54, 13)} transform={`rotate(${a})`} />
        ))}
        {ring(8, 22.5).map((a) => (
          <path key={a} d={petal(22, 44, 7)} transform={`rotate(${a})`} />
        ))}
        <circle r="16" />
        <circle r="7" />
      </g>
    </svg>
  );
}

export default memo(Mandala);
