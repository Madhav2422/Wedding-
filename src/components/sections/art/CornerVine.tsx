import { memo } from "react";
import { petal, ring } from "@/lib/svg";

const LEAF = "M0,0 C3,-3 3,-8 0,-11 C-3,-8 -3,-3 0,0 Z";
const LEAVES: [number, number, number][] = [
  [6, 70, -20],
  [6, 52, 20],
  [22, 94, 70],
  [40, 94, 110],
  [26, 60, 30],
  [38, 74, 60],
];

/** A gold floral vine for the bottom-left corner of a card (mirror it for the right). */
function CornerVine({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <g fill="none" stroke="#b8862b" strokeLinecap="round">
        <path d="M6,94 V36 C6,26 12,20 20,20 C26,20 29,25 26,29" strokeWidth="1.2" />
        <path d="M6,94 H64 C74,94 80,88 80,80 C80,74 75,71 71,74" strokeWidth="1.2" />
        <path d="M13,87 C24,78 30,66 30,52" strokeWidth=".9" />
        <path d="M13,87 C22,76 34,72 48,72" strokeWidth=".9" />
      </g>
      {LEAVES.map(([x, y, r]) => (
        <path key={`${x}-${y}`} d={LEAF} transform={`translate(${x} ${y}) rotate(${r})`} fill="#c8952e" />
      ))}
      <circle cx="30" cy="52" r="2" fill="#c8952e" />
      <circle cx="48" cy="72" r="2" fill="#c8952e" />
      <g transform="translate(13 87)">
        {ring(6).map((a) => (
          <path key={a} d={petal(1.5, 8, 3)} transform={`rotate(${a})`} fill="#b3173a" stroke="#e9c35e" strokeWidth=".4" />
        ))}
        <circle r="2" fill="#e9c35e" />
      </g>
    </svg>
  );
}

export default memo(CornerVine);
