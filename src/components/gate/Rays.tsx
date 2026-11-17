import { memo } from "react";
import { n, ring } from "@/lib/svg";

/** A thin wedge of light from the centre, `halfAngle` degrees either side of straight up. */
const wedge = (halfAngle: number, r = 500) => {
  const a = (halfAngle * Math.PI) / 180;
  const x = n(Math.sin(a) * r);
  const y = n(-Math.cos(a) * r);
  return `M0,0 L${-x},${y} L${x},${y} Z`;
};

const WIDE = wedge(5.5);
const NARROW = wedge(2);

/**
 * Soft beams of light fanning out of the doorway. It is drawn once as a static
 * image; the animation only rotates and fades it, which the GPU does for free.
 */
function Rays({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-500 -500 1000 1000" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="rays-fade" cx="0" cy="0" r="500" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff9ea" stopOpacity=".95" />
          <stop offset=".16" stopColor="#fff3d4" stopOpacity=".6" />
          <stop offset=".5" stopColor="#ffeabd" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g fill="url(#rays-fade)">
        {ring(24).map((a) => (
          <path key={`w${a}`} d={WIDE} transform={`rotate(${a})`} opacity=".4" />
        ))}
        {ring(24).map((a) => (
          <path key={`n${a}`} d={NARROW} transform={`rotate(${a})`} />
        ))}
      </g>
    </svg>
  );
}

export default memo(Rays);
