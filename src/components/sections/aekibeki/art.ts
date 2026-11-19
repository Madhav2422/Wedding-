/**
 * Aeki Beki artwork: everything that floats in the thali is painted ONCE into a small image
 * ("sprite") when the browser is idle. Each animation frame then only stamps these images at
 * new positions, which is very cheap on a phone.
 */

const TAU = Math.PI * 2;

export type Sprite = { img: HTMLCanvasElement; w: number; h: number };

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

/** Paints `draw` (a shape of w × h CSS px) into a padded canvas at device resolution. */
export function makeSprite(w: number, h: number, dpr: number, draw: Draw): Sprite {
  const pad = Math.ceil(Math.max(w, h) * 0.3); // room for the soft shadow
  const cw = w + pad * 2;
  const ch = h + pad * 2;
  const img = document.createElement("canvas");
  img.width = Math.ceil(cw * dpr);
  img.height = Math.ceil(ch * dpr);
  const ctx = img.getContext("2d");
  if (ctx) {
    ctx.scale(dpr, dpr);
    ctx.translate(pad, pad);
    draw(ctx, w, h);
  }
  return { img, w: cw, h: ch };
}

/** A soft, round contact shadow — it doesn't change as the petal turns. */
function floatShadow(ctx: CanvasRenderingContext2D, w: number, path: Path2D, color: string) {
  ctx.save();
  ctx.shadowColor = "rgba(92, 62, 28, 0.32)";
  ctx.shadowBlur = w * 0.16;
  ctx.fillStyle = color;
  ctx.fill(path);
  ctx.restore();
}

function sheen(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, alpha: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
  g.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

/* ------------------------------------------------------------------ */
/*  Petals, flowers & leaves                                           */
/* ------------------------------------------------------------------ */

/** A rose petal with a soft notch, veins and a velvety sheen. */
export const rosePetal =
  ([light, mid, dark]: readonly [string, string, string]): Draw =>
  (ctx, w, h) => {
    const p = new Path2D();
    p.moveTo(0.5 * w, 0.98 * h);
    p.bezierCurveTo(0.16 * w, 0.84 * h, 0 * w, 0.56 * h, 0.07 * w, 0.31 * h);
    p.bezierCurveTo(0.12 * w, 0.1 * h, 0.32 * w, 0.01 * h, 0.45 * w, 0.09 * h);
    p.quadraticCurveTo(0.5 * w, 0.13 * h, 0.55 * w, 0.09 * h);
    p.bezierCurveTo(0.68 * w, 0.01 * h, 0.88 * w, 0.1 * h, 0.93 * w, 0.31 * h);
    p.bezierCurveTo(1 * w, 0.56 * h, 0.84 * w, 0.84 * h, 0.5 * w, 0.98 * h);
    p.closePath();
    floatShadow(ctx, w, p, dark);

    const g = ctx.createRadialGradient(0.42 * w, 0.36 * h, 0.02 * w, 0.5 * w, 0.52 * h, 0.62 * h);
    g.addColorStop(0, light);
    g.addColorStop(0.55, mid);
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    ctx.fill(p);

    ctx.save();
    ctx.clip(p);
    ctx.strokeStyle = "rgba(90, 0, 24, 0.2)";
    ctx.lineWidth = 0.022 * w;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (const dx of [-0.24, -0.09, 0.09, 0.24]) {
      ctx.moveTo(0.5 * w, 0.95 * h);
      ctx.quadraticCurveTo((0.5 + dx * 0.5) * w, 0.55 * h, (0.5 + dx) * w, 0.2 * h);
    }
    ctx.stroke();
    sheen(ctx, 0.34 * w, 0.3 * h, 0.42 * w, 0.42);
    ctx.strokeStyle = "rgba(255, 214, 226, 0.4)";
    ctx.lineWidth = 0.06 * w;
    ctx.stroke(p);
    ctx.restore();
  };

/** A long marigold petal with a ruffled tip. */
export const marigoldPetal =
  ([light, mid, dark]: readonly [string, string, string]): Draw =>
  (ctx, w, h) => {
    const p = new Path2D();
    p.moveTo(0.5 * w, 0.98 * h);
    p.bezierCurveTo(0.1 * w, 0.8 * h, 0.02 * w, 0.4 * h, 0.12 * w, 0.17 * h);
    p.quadraticCurveTo(0.22 * w, 0.02 * h, 0.34 * w, 0.12 * h);
    p.quadraticCurveTo(0.5 * w, 0 * h, 0.66 * w, 0.12 * h);
    p.quadraticCurveTo(0.78 * w, 0.02 * h, 0.88 * w, 0.17 * h);
    p.bezierCurveTo(0.98 * w, 0.4 * h, 0.9 * w, 0.8 * h, 0.5 * w, 0.98 * h);
    p.closePath();
    floatShadow(ctx, w, p, dark);

    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, light);
    g.addColorStop(0.5, mid);
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    ctx.fill(p);

    ctx.save();
    ctx.clip(p);
    ctx.strokeStyle = "rgba(124, 45, 18, 0.22)";
    ctx.lineWidth = 0.035 * w;
    ctx.beginPath();
    for (const x of [0.32, 0.5, 0.68]) {
      ctx.moveTo(0.5 * w, 0.94 * h);
      ctx.lineTo(x * w, 0.16 * h);
    }
    ctx.stroke();
    sheen(ctx, 0.38 * w, 0.35 * h, 0.4 * w, 0.35);
    ctx.restore();
  };

/** A whole marigold, seen from above: rings of ruffled petals around a deep centre. */
export const marigoldFlower: Draw = (ctx, w) => {
  const c = w / 2;
  const disc = new Path2D();
  disc.arc(c, c, 0.47 * w, 0, TAU);
  floatShadow(ctx, w, disc, "#c2410c");

  const rings: [number, number, string, string][] = [
    [0.36, 20, "#b93a0c", "#f97316"],
    [0.29, 17, "#d9530f", "#fb923c"],
    [0.21, 13, "#ea7a0b", "#fbbf24"],
    [0.13, 9, "#f59e0b", "#fde68a"],
  ];
  rings.forEach(([r, count, dark, light], ring) => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * TAU + ring * 0.37;
      ctx.save();
      ctx.translate(c + Math.cos(a) * r * w, c + Math.sin(a) * r * w);
      ctx.rotate(a);
      const len = w * (0.15 - ring * 0.018);
      const g = ctx.createRadialGradient(-len * 0.3, 0, 0, 0, 0, len);
      g.addColorStop(0, light);
      g.addColorStop(1, dark);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 0, len, len * 0.62, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  });
  ctx.fillStyle = "#9a3412";
  ctx.beginPath();
  ctx.arc(c, c, 0.06 * w, 0, TAU);
  ctx.fill();
  sheen(ctx, 0.38 * w, 0.34 * w, 0.32 * w, 0.32);
};

/** A small tulsi leaf with its midrib. */
export const leaf: Draw = (ctx, w, h) => {
  const p = new Path2D();
  p.moveTo(0.5 * w, 0.02 * h);
  p.bezierCurveTo(0.98 * w, 0.26 * h, 0.9 * w, 0.72 * h, 0.5 * w, 0.98 * h);
  p.bezierCurveTo(0.1 * w, 0.72 * h, 0.02 * w, 0.26 * h, 0.5 * w, 0.02 * h);
  p.closePath();
  floatShadow(ctx, w, p, "#14532d");
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#6fd18a");
  g.addColorStop(0.55, "#2f8f4e");
  g.addColorStop(1, "#14532d");
  ctx.fillStyle = g;
  ctx.fill(p);
  ctx.save();
  ctx.clip(p);
  ctx.strokeStyle = "rgba(220, 252, 231, 0.55)";
  ctx.lineWidth = 0.05 * w;
  ctx.beginPath();
  ctx.moveTo(0.5 * w, 0.08 * h);
  ctx.lineTo(0.5 * w, 0.95 * h);
  for (const y of [0.3, 0.48, 0.66]) {
    ctx.moveTo(0.5 * w, y * h + 0.08 * h);
    ctx.lineTo(0.24 * w, y * h);
    ctx.moveTo(0.5 * w, y * h + 0.08 * h);
    ctx.lineTo(0.76 * w, y * h);
  }
  ctx.stroke();
  sheen(ctx, 0.36 * w, 0.3 * h, 0.4 * w, 0.3);
  ctx.restore();
};

/* ------------------------------------------------------------------ */
/*  The treasures                                                      */
/* ------------------------------------------------------------------ */

/** The gold ring with a solitaire, seen from above (also used, larger, for the celebration). */
export const ring: Draw = (ctx, w) => {
  const c = w / 2;
  const band = new Path2D();
  band.ellipse(c, c * 1.1, 0.42 * w, 0.34 * w, 0, 0, TAU);
  band.ellipse(c, c * 1.13, 0.3 * w, 0.23 * w, 0, 0, TAU);

  ctx.save();
  ctx.shadowColor = "rgba(84, 52, 10, 0.4)";
  ctx.shadowBlur = w * 0.1;
  ctx.shadowOffsetY = w * 0.03;
  const g = ctx.createLinearGradient(0, 0, w, w);
  g.addColorStop(0, "#fff4c4");
  g.addColorStop(0.28, "#eec463");
  g.addColorStop(0.55, "#a8761f");
  g.addColorStop(0.76, "#f8dc8e");
  g.addColorStop(1, "#8d5f17");
  ctx.fillStyle = g;
  ctx.fill(band, "evenodd");
  ctx.restore();

  // polished edges
  ctx.lineWidth = w * 0.022;
  ctx.strokeStyle = "rgba(255, 249, 222, 0.85)";
  ctx.beginPath();
  ctx.ellipse(c, c * 1.1, 0.4 * w, 0.32 * w, 0, Math.PI * 1.05, Math.PI * 1.7);
  ctx.stroke();
  ctx.strokeStyle = "rgba(110, 70, 12, 0.55)";
  ctx.lineWidth = w * 0.014;
  ctx.beginPath();
  ctx.ellipse(c, c * 1.13, 0.3 * w, 0.23 * w, 0, 0, TAU);
  ctx.stroke();

  // the setting & the stone, on top of the band
  const sx = c;
  const sy = c * 1.1 - 0.34 * w;
  ctx.fillStyle = "#c9973a";
  ctx.beginPath();
  ctx.arc(sx, sy, 0.13 * w, 0, TAU);
  ctx.fill();
  const facets = 8;
  const stone = new Path2D();
  for (let i = 0; i < facets; i++) {
    const a = (i / facets) * TAU + Math.PI / 8;
    const x = sx + Math.cos(a) * 0.105 * w;
    const y = sy + Math.sin(a) * 0.105 * w;
    if (i === 0) stone.moveTo(x, y);
    else stone.lineTo(x, y);
  }
  stone.closePath();
  const sg = ctx.createRadialGradient(sx - 0.03 * w, sy - 0.03 * w, 0, sx, sy, 0.12 * w);
  sg.addColorStop(0, "#ffffff");
  sg.addColorStop(0.5, "#e0f2fe");
  sg.addColorStop(1, "#7dd3fc");
  ctx.fillStyle = sg;
  ctx.fill(stone);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = w * 0.01;
  ctx.beginPath();
  for (let i = 0; i < facets; i++) {
    const a = (i / facets) * TAU + Math.PI / 8;
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(a) * 0.105 * w, sy + Math.sin(a) * 0.105 * w);
  }
  ctx.stroke();
  // a sparkle on the diamond
  ctx.fillStyle = "#ffffff";
  const k = 0.018 * w;
  const r = 0.12 * w;
  const px = sx + 0.07 * w;
  const py = sy - 0.07 * w;
  ctx.beginPath();
  ctx.moveTo(px, py - r);
  ctx.lineTo(px + k, py - k);
  ctx.lineTo(px + r, py);
  ctx.lineTo(px + k, py + k);
  ctx.lineTo(px, py + r);
  ctx.lineTo(px - k, py + k);
  ctx.lineTo(px - r, py);
  ctx.lineTo(px - k, py - k);
  ctx.closePath();
  ctx.fill();
};

/** A silver coin with an embossed lotus (the decoys hidden in the milk). */
export const coin: Draw = (ctx, w) => {
  const c = w / 2;
  const disc = new Path2D();
  disc.arc(c, c, 0.46 * w, 0, TAU);
  ctx.save();
  ctx.shadowColor = "rgba(60, 60, 70, 0.4)";
  ctx.shadowBlur = w * 0.12;
  ctx.shadowOffsetY = w * 0.03;
  const g = ctx.createRadialGradient(0.38 * w, 0.32 * w, 0, c, c, 0.5 * w);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.55, "#dfe5ec");
  g.addColorStop(1, "#8f9bab");
  ctx.fillStyle = g;
  ctx.fill(disc);
  ctx.restore();
  ctx.strokeStyle = "#a3aebd";
  ctx.lineWidth = w * 0.035;
  ctx.beginPath();
  ctx.arc(c, c, 0.38 * w, 0, TAU);
  ctx.stroke();
  // lotus
  ctx.fillStyle = "#8f9bab";
  for (const a of [-0.55, 0, 0.55]) {
    ctx.save();
    ctx.translate(c, c + 0.12 * w);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(0.09 * w, -0.14 * w, 0, -0.27 * w);
    ctx.quadraticCurveTo(-0.09 * w, -0.14 * w, 0, 0);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillRect(c - 0.16 * w, c + 0.13 * w, 0.32 * w, 0.03 * w);
  sheen(ctx, 0.36 * w, 0.3 * w, 0.3 * w, 0.6);
};

/* ------------------------------------------------------------------ */
/*  The milk                                                           */
/* ------------------------------------------------------------------ */

/**
 * Kesar milk in the thali: creamy white with a whisper of saffron and kumkum swirled in,
 * a few saffron threads, a glossy reflection and the shade of the rim. Painted once.
 */
export function paintMilk(d: number, dpr: number) {
  const img = document.createElement("canvas");
  img.width = img.height = Math.ceil(d * dpr);
  const ctx = img.getContext("2d");
  if (!ctx) return img;
  ctx.scale(dpr, dpr);
  const c = d / 2;

  const base = ctx.createRadialGradient(c * 0.82, c * 0.78, d * 0.04, c, c, c);
  base.addColorStop(0, "#fffefa");
  base.addColorStop(0.62, "#fbf3e3");
  base.addColorStop(1, "#ead9bb");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, d, d);

  // a warm blush of kesar in the middle
  const kesar = ctx.createRadialGradient(c * 0.9, c * 0.95, 0, c, c, c * 0.8);
  kesar.addColorStop(0, "rgba(245, 186, 84, 0.12)");
  kesar.addColorStop(1, "rgba(245, 186, 84, 0)");
  ctx.fillStyle = kesar;
  ctx.fillRect(0, 0, d, d);

  // saffron & kumkum stirred into soft spirals (layered strokes, faint, so they look dissolved)
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const spiral = (r0: number, r1: number, a0: number, turns: number, color: string) => {
    for (const [width, alpha] of [
      [0.075, 0.03],
      [0.04, 0.045],
      [0.016, 0.06],
    ] as const) {
      ctx.strokeStyle = color.replace("A", String(alpha));
      ctx.lineWidth = width * d;
      ctx.beginPath();
      for (let i = 0; i <= 72; i++) {
        const t = i / 72;
        const a = a0 + t * turns * TAU;
        const r = (r0 + (r1 - r0) * t) * d;
        const x = c + Math.cos(a) * r;
        const y = c + Math.sin(a) * r;
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
  };
  spiral(0.03, 0.37, 0.4, 1.15, "rgba(232, 146, 34, A)");
  spiral(0.07, 0.43, 3.4, 0.95, "rgba(214, 40, 80, A)");

  // saffron threads
  const threads = [
    [0.3, 0.36, 0.6],
    [0.62, 0.28, 2.1],
    [0.7, 0.62, 4.0],
    [0.4, 0.72, 5.2],
    [0.55, 0.5, 1.1],
    [0.24, 0.55, 3.0],
  ];
  ctx.strokeStyle = "rgba(194, 65, 12, 0.75)";
  ctx.lineWidth = Math.max(0.8, d * 0.0035);
  for (const [x, y, a] of threads) {
    const len = d * 0.035;
    ctx.beginPath();
    ctx.moveTo(x * d, y * d);
    ctx.quadraticCurveTo(x * d + Math.cos(a + 0.8) * len, y * d + Math.sin(a + 0.8) * len, x * d + Math.cos(a) * len * 1.6, y * d + Math.sin(a) * len * 1.6);
    ctx.stroke();
  }

  // glossy reflection
  ctx.save();
  ctx.translate(c * 0.62, c * 0.5);
  ctx.rotate(-0.6);
  const gloss = ctx.createRadialGradient(0, 0, 0, 0, 0, d * 0.22);
  gloss.addColorStop(0, "rgba(255, 255, 255, 0.75)");
  gloss.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.scale(1, 0.42);
  ctx.fillStyle = gloss;
  ctx.beginPath();
  ctx.arc(0, 0, d * 0.22, 0, TAU);
  ctx.fill();
  ctx.restore();

  // shade under the rim
  const rim = ctx.createRadialGradient(c, c, c * 0.74, c, c, c);
  rim.addColorStop(0, "rgba(120, 84, 36, 0)");
  rim.addColorStop(1, "rgba(120, 84, 36, 0.38)");
  ctx.fillStyle = rim;
  ctx.fillRect(0, 0, d, d);
  return img;
}
