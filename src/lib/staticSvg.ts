import { Fragment, createElement, isValidElement, type ReactNode } from "react";

const MEMO = Symbol.for("react.memo");

type AnyProps = Record<string, unknown> & { children?: ReactNode };

/**
 * Expands SVG art components (<GateFrame />, <DoorArt /> …) into plain <svg>, <path>, <g> …
 * elements, so `next/og` can draw them into an image — it only understands built-in SVG tags.
 *
 * On the way:
 * - `className` / `style` are dropped (they only drive the CSS animations);
 * - `<text>` is dropped (`next/og` cannot draw SVG text; put lettering on top as normal text);
 * - `pathLength` is turned into real lengths, because the image renderer ignores it and the
 *   beads, pearls and marigold strings are drawn as dashes measured in `pathLength` units.
 *
 * Only for hook-free drawing components.
 */
export function staticSvg(node: ReactNode): ReactNode {
  if (Array.isArray(node)) return node.map(staticSvg);
  if (!isValidElement(node)) return node;

  let type: unknown = node.type;
  const props = node.props as AnyProps;
  while (typeof type === "object" && type !== null && (type as { $$typeof?: symbol }).$$typeof === MEMO) {
    type = (type as { type: unknown }).type;
  }

  if (typeof type === "function") return staticSvg((type as (p: AnyProps) => ReactNode)(props));
  if (type === Fragment) return staticSvg(props.children);
  if (type === "text" || typeof type !== "string") return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children, className, style, pathLength, ...attributes } = props;
  if (pathLength != null) {
    const k = shapeLength(type, attributes) / Number(pathLength);
    if (Number.isFinite(k) && k > 0) {
      if (attributes.strokeDasharray != null) {
        attributes.strokeDasharray = String(attributes.strokeDasharray)
          .split(/[\s,]+/)
          .filter(Boolean)
          .map((v) => Number(v) * k)
          .join(" ");
      }
      if (attributes.strokeDashoffset != null) attributes.strokeDashoffset = Number(attributes.strokeDashoffset) * k;
    }
  }
  return createElement(type, { ...attributes, key: node.key ?? undefined }, staticSvg(children));
}

/** Real length of a shape's outline, in user units (NaN if unknown). */
function shapeLength(type: string, a: Record<string, unknown>): number {
  const v = (key: string) => Number(a[key] ?? 0);
  switch (type) {
    case "circle":
      return 2 * Math.PI * v("r");
    case "rect":
      return 2 * (v("width") + v("height"));
    case "line":
      return Math.hypot(v("x2") - v("x1"), v("y2") - v("y1"));
    case "path":
      return pathLengthOf(String(a.d ?? ""));
    default:
      return NaN;
  }
}

type Pt = [number, number];

/** Length of a cubic (or quadratic, with c1 === c2) bezier, by sampling. */
function bezierLength(p0: Pt, c1: Pt, c2: Pt, p1: Pt): number {
  let len = 0;
  let [px, py] = p0;
  for (let i = 1; i <= 32; i++) {
    const t = i / 32;
    const u = 1 - t;
    const x = u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p1[0];
    const y = u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p1[1];
    len += Math.hypot(x - px, y - py);
    px = x;
    py = y;
  }
  return len;
}

/** Length of an SVG path's `d` (M L H V C S Q T Z, absolute or relative; arcs counted as straight). */
function pathLengthOf(d: string): number {
  const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) ?? [];
  let i = 0;
  let cmd = "";
  let len = 0;
  let cur: Pt = [0, 0];
  let start: Pt = [0, 0];
  let ctrl: Pt = [0, 0]; // last control point, for S / T
  const num = () => Number(tokens[i++]);

  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++];
    const rel = cmd === cmd.toLowerCase();
    const pt = (): Pt => {
      const x = num();
      const y = num();
      return rel ? [cur[0] + x, cur[1] + y] : [x, y];
    };
    const C = cmd.toUpperCase();

    if (C === "M") {
      cur = start = ctrl = pt();
      cmd = rel ? "l" : "L"; // extra pairs after a moveto are linetos
    } else if (C === "L" || C === "H" || C === "V" || C === "A") {
      if (C === "A") i += 5; // rx ry rotation large-arc sweep
      const next: Pt =
        C === "H" ? [rel ? cur[0] + num() : num(), cur[1]] : C === "V" ? [cur[0], rel ? cur[1] + num() : num()] : pt();
      len += Math.hypot(next[0] - cur[0], next[1] - cur[1]);
      cur = ctrl = next;
    } else if (C === "C" || C === "S") {
      const c1: Pt = C === "S" ? [2 * cur[0] - ctrl[0], 2 * cur[1] - ctrl[1]] : pt();
      const c2 = pt();
      const end = pt();
      len += bezierLength(cur, c1, c2, end);
      ctrl = c2;
      cur = end;
    } else if (C === "Q" || C === "T") {
      const q: Pt = C === "T" ? [2 * cur[0] - ctrl[0], 2 * cur[1] - ctrl[1]] : pt();
      const end = pt();
      // a quadratic as a cubic
      const c1: Pt = [cur[0] + (2 / 3) * (q[0] - cur[0]), cur[1] + (2 / 3) * (q[1] - cur[1])];
      const c2: Pt = [end[0] + (2 / 3) * (q[0] - end[0]), end[1] + (2 / 3) * (q[1] - end[1])];
      len += bezierLength(cur, c1, c2, end);
      ctrl = q;
      cur = end;
    } else if (C === "Z") {
      len += Math.hypot(start[0] - cur[0], start[1] - cur[1]);
      cur = ctrl = start;
    } else {
      i++; // unknown token: skip it
    }
  }
  return len;
}
