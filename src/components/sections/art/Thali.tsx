import { memo } from "react";

/** A silver thali seen from above: katoris of dal, paneer, raita & kheer, rice, roti and a laddoo. */
function Thali({ id }: { id: string }) {
  const silver = `${id}-silver`;
  return (
    <svg viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={silver} cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#dedede" />
          <stop offset="1" stopColor="#a9a9a9" />
        </radialGradient>
      </defs>
      <circle r={47} fill={`url(#${silver})`} stroke="#9c9c9c" strokeWidth={1.4} />
      <circle r={39} fill="#ececec" stroke="#c4c4c4" strokeWidth={1} />
      {[
        [-26, -13, "#e3a52a"],
        [-8, -28, "#d8641d"],
        [13, -27, "#f6f1e4"],
        [28, -11, "#f1dfb4"],
      ].map(([x, y, food]) => (
        <g key={`${x}`}>
          <circle cx={x} cy={y} r={10.5} fill="#d4d4d4" stroke="#a4a4a4" strokeWidth={0.9} />
          <circle cx={x} cy={y} r={8} fill={food as string} />
        </g>
      ))}
      <circle cx={13} cy={-27} r={1.1} fill="#5b8f2a" />
      <circle cx={10} cy={-25} r={0.9} fill="#5b8f2a" />
      <circle cx={-8} cy={-28} r={2.6} fill="#f4e6c8" />
      {/* rice */}
      <ellipse cx={-10} cy={16} rx={17} ry={11} fill="#fbfaf4" stroke="#e6e1cf" strokeWidth={0.8} />
      <path d="M-18,13h3M-12,18h3M-6,12h3M-3,19h3M-15,21h3" stroke="#e2dcc6" strokeWidth={1} strokeLinecap="round" />
      {/* roti */}
      <circle cx={16} cy={13} r={13} fill="#e8c084" stroke="#c99a56" strokeWidth={0.9} />
      <circle cx={12} cy={9} r={1.6} fill="#b97a3a" opacity={0.6} />
      <circle cx={20} cy={16} r={2} fill="#b97a3a" opacity={0.5} />
      <circle cx={15} cy={20} r={1.2} fill="#b97a3a" opacity={0.6} />
      {/* laddoo */}
      <circle cx={2} cy={32} r={6} fill="#f2a417" stroke="#c97a0c" strokeWidth={0.8} />
      <circle cx={0.5} cy={30.5} r={1.4} fill="#ffd27a" />
    </svg>
  );
}

export default memo(Thali);
