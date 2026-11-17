import { memo } from "react";
import { petal } from "@/lib/svg";

const LEAVES = [-64, -32, 0, 32, 64];

/** The auspicious kalash — a brass pot crowned with mango leaves and a coconut. */
function Kalash({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 140" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="k-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8f6218" />
          <stop offset=".28" stopColor="#f3d684" />
          <stop offset=".55" stopColor="#c8952e" />
          <stop offset=".78" stopColor="#f6dc8a" />
          <stop offset="1" stopColor="#8f6218" />
        </linearGradient>
        <linearGradient id="k-leaf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f5a2f" />
          <stop offset="1" stopColor="#4c9a4a" />
        </linearGradient>
        <radialGradient id="k-coco" cx=".4" cy=".35" r=".75">
          <stop offset="0" stopColor="#b07b42" />
          <stop offset=".6" stopColor="#6b4220" />
          <stop offset="1" stopColor="#3e240f" />
        </radialGradient>
      </defs>

      {/* mango leaves */}
      <g transform="translate(60 58)">
        {LEAVES.map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <path d="M0,0 C8,-11 8,-31 0,-46 C-8,-31 -8,-11 0,0 Z" fill="url(#k-leaf)" />
            <path d="M0,-3 V-42" stroke="#b9dfa9" strokeOpacity=".6" strokeWidth=".8" />
          </g>
        ))}
      </g>

      {/* coconut */}
      <ellipse cx="60" cy="41" rx="13" ry="16" fill="url(#k-coco)" />
      <path d="M53,31 C56,37 56,46 53,53 M60,26 V56 M67,31 C64,37 64,46 67,53" stroke="#2e1a0b" strokeOpacity=".35" strokeWidth=".9" fill="none" />
      <path d="M60,26 C57,20 54,19 51,18 M60,26 C61,20 64,18 68,17 M60,26 V17" stroke="#6b4220" strokeWidth="1.4" fill="none" strokeLinecap="round" />

      {/* neck, rim & sacred red thread */}
      <rect x="47" y="56" width="26" height="9" rx="2" fill="url(#k-gold)" />
      <ellipse cx="60" cy="56" rx="16" ry="3.2" fill="url(#k-gold)" stroke="#7a5416" strokeWidth=".6" />
      <path d="M47,61.5 Q60,64.5 73,61.5" stroke="#c81e3a" strokeWidth="1.6" fill="none" />
      <path d="M72,62 l3,6 M72,62 l-1,7" stroke="#c81e3a" strokeWidth="1.2" strokeLinecap="round" />

      {/* pot */}
      <path
        d="M46,65 C26,69 16,86 18,102 C20,120 38,129 60,129 C82,129 100,120 102,102 C104,86 94,69 74,65 Z"
        fill="url(#k-gold)"
        stroke="#7a5416"
        strokeWidth=".8"
      />
      <path d="M33,82 C27,92 27,106 33,116" stroke="#fff3c4" strokeOpacity=".55" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M21,92 C40,98 80,98 99,92" stroke="#b3173a" strokeWidth="5" fill="none" />
      <path d="M21,92 C40,98 80,98 99,92" stroke="#fff3c4" strokeWidth="1.6" strokeDasharray="0 6" strokeLinecap="round" fill="none" />
      <g transform="translate(60 118)">
        {[-42, 0, 42].map((a) => (
          <path key={a} d={petal(0, 14, 5)} transform={`rotate(${a})`} fill="#9b1c31" stroke="#f3d684" strokeWidth=".5" />
        ))}
      </g>
      <path d="M46,128 h28 l4,7 h-36 Z" fill="url(#k-gold)" stroke="#7a5416" strokeWidth=".6" />
    </svg>
  );
}

export default memo(Kalash);
