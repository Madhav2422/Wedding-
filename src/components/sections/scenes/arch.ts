import { n } from "@/lib/svg";

/*
 * The palace-arch window every celebration scene is drawn inside.
 * Scenes use a 400 × 460 canvas; the arch fills it exactly.
 */

export const W = 400;
export const H = 460;

type P = readonly [number, number];
/** The four curves of the pointed (ogee) arch, left to right. */
const CURVES: readonly (readonly [P, P, P, P])[] = [
  [[0, 170], [0, 95], [70, 58], [130, 40]],
  [[130, 40], [165, 29], [190, 14], [200, 0]],
  [[200, 0], [210, 14], [235, 29], [270, 40]],
  [[270, 40], [330, 58], [400, 95], [400, 170]],
];

export const ARCH = "M0,460L0,170C0,95 70,58 130,40C165,29 190,14 200,0C210,14 235,29 270,40C330,58 400,95 400,170L400,460Z";

const at = ([p0, c1, c2, p1]: readonly [P, P, P, P], t: number): [number, number] => {
  const u = 1 - t;
  return [
    u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p1[0],
    u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p1[1],
  ];
};

/** Dense samples along the arch top (left → right). */
const SAMPLES = CURVES.flatMap((c, ci) => Array.from({ length: 60 }, (_, i) => at(c, (i + (ci === 3 ? 1 : 0)) / 60)));

/** Height of the arch edge at x (where hanging decorations attach). */
export function archY(x: number) {
  for (let i = 1; i < SAMPLES.length; i++) {
    const [x0, y0] = SAMPLES[i - 1];
    const [x1, y1] = SAMPLES[i];
    if (x >= x0 && x <= x1) return n(y0 + ((x - x0) / (x1 - x0 || 1)) * (y1 - y0));
  }
  return 170;
}

/** The arch grown outward by `d` — a simple offset along each sample's normal. */
function offsetPoints(d: number) {
  return SAMPLES.map(([x, y], i) => {
    const [ax, ay] = SAMPLES[Math.max(0, i - 1)];
    const [bx, by] = SAMPLES[Math.min(SAMPLES.length - 1, i + 1)];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    // outward normal of a left→right curve is (dy, -dx)
    return [n(x + ((by - ay) / len) * d), n(y - ((bx - ax) / len) * d)] as const;
  });
}

export function archOutline(d: number, bottom = H) {
  const pts = offsetPoints(d);
  return `M${n(-d)},${bottom}L${pts.map((p) => p.join(",")).join("L")}L${n(W + d)},${bottom}`;
}

/** Scalloped cusps just inside the arch — the hallmark of a Rajput window. */
export function cusps(inset: number, count = 13) {
  const pts = offsetPoints(-inset);
  const picks = Array.from({ length: count + 1 }, (_, i) => pts[Math.round((i / count) * (pts.length - 1))]);
  let d = `M${picks[0][0]},${picks[0][1]}`;
  for (let i = 1; i < picks.length; i++) {
    const [x0, y0] = picks[i - 1];
    const [x1, y1] = picks[i];
    const r = n(Math.hypot(x1 - x0, y1 - y0) * 0.56);
    d += `A${r},${r} 0 0 0 ${x1},${y1}`;
  }
  return d;
}

/** CSS mask that cuts any box to the arch shape. */
export const ARCH_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${W} ${H}' preserveAspectRatio='none'><path d='${ARCH}'/></svg>`,
)}")`;
