/** Small geometry helpers for drawing ornaments in SVG. */

/** Round to 2 decimals so server and browser render identical path strings. */
export const n = (v: number) => Math.round(v * 100) / 100;

/** A pointed lotus petal pointing "up" from radius r1 to r2, centred on x = 0. */
export function petal(r1: number, r2: number, w: number): string {
  const a = r1 + (r2 - r1) * 0.38;
  const b = r2 - (r2 - r1) * 0.12;
  return `M0,${n(-r1)} C${n(w)},${n(-a)} ${n(w * 0.55)},${n(-b)} 0,${n(-r2)} C${n(-w * 0.55)},${n(-b)} ${n(-w)},${n(-a)} 0,${n(-r1)} Z`;
}

/** Evenly spaced angles (degrees) around a circle. */
export function ring(count: number, offset = 0): number[] {
  return Array.from({ length: count }, (_, i) => n(offset + (360 / count) * i));
}

type Pt = readonly [number, number];

/** Point on a quadratic bezier. */
export function quadAt(p0: Pt, c: Pt, p1: Pt, t: number): [number, number] {
  const u = 1 - t;
  return [n(u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0]), n(u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1])];
}

/** Wavy "wax seal" outline. */
export function waxOutline(radius: number, lobes: number, depth: number, steps = 180): string {
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * Math.PI * 2;
    const r = radius + depth * Math.cos(lobes * th) + depth * 0.45 * Math.sin(5 * th + 1.3);
    const x = n(Math.sin(th) * r);
    const y = n(-Math.cos(th) * r);
    d += `${i === 0 ? "M" : "L"}${x},${y} `;
  }
  return `${d}Z`;
}
