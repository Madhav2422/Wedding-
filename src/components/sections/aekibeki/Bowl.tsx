"use client";

import { useEffect, useLayoutEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { idle } from "@/lib/idle";
import { seeded } from "@/lib/random";
import { coin, leaf, makeSprite, marigoldFlower, marigoldPetal, paintMilk, ring, rosePetal, type Sprite } from "./art";

/*
 * The thali of milk. Positions are "normalised": the milk is a circle of radius 1, so the
 * physics doesn't care how big the bowl is on screen. Everything is drawn on one canvas, and
 * the animation loop only runs while something is moving — a still bowl costs nothing.
 */

export type Spot = { x: number; y: number };

type Props = {
  /** Change it to start a new game: the petals swirl back in and everything is hidden again. */
  round: number;
  /** Change it to part the petals over the ring and reveal it ("Show me the ring"). */
  revealSignal: number;
  /** The ring has been found (the celebration takes over, so the bowl stops drawing it). */
  found: boolean;
  /** The ring is uncovered (with where it is), or covered again. */
  onShining: (shining: boolean, at?: Spot) => void;
  onCoin: (at: Spot) => void;
  onFound: (at: Spot) => void;
  onTouch: () => void;
  /** A large picture of the ring, for the celebration. */
  onRingArt: (src: string) => void;
  className?: string;
};

type Kind = { draw: Parameters<typeof makeSprite>[3]; w: number; h: number; weight: number };

const KINDS: Kind[] = [
  { draw: rosePetal(["#ff9fb2", "#e11d48", "#8f1031"]), w: 0.17, h: 0.19, weight: 5 },
  { draw: rosePetal(["#ffc4d8", "#ef4f8b", "#b3175a"]), w: 0.16, h: 0.18, weight: 3 },
  { draw: rosePetal(["#ff8c8c", "#c81e3a", "#760d21"]), w: 0.17, h: 0.19, weight: 3 },
  { draw: marigoldPetal(["#ffe08a", "#f97316", "#c2410c"]), w: 0.1, h: 0.17, weight: 4 },
  { draw: marigoldPetal(["#fff6b8", "#facc15", "#ca8a04"]), w: 0.1, h: 0.16, weight: 2 },
  { draw: marigoldFlower, w: 0.25, h: 0.25, weight: 0.9 },
  { draw: leaf, w: 0.11, h: 0.18, weight: 1.1 },
];
const TOTAL_WEIGHT = KINDS.reduce((s, k) => s + k.weight, 0);

const PETALS = 140; // a heaped thali — the milk shows only between the petals
const COINS = 3;
const RING_R = 0.1;
const COIN_R = 0.075;
const CLEAR_R = 0.13; // the fingertip pushes petals out of this circle
const CARRY_R = 0.3; // petals in this circle drift along with the finger
const MAX_V = 0.0048; // fastest a petal glides (bowl radii per ms)
const RIPPLE_MS = 950;
const TAU = Math.PI * 2;

type Petal = { x: number; y: number; vx: number; vy: number; a: number; va: number; kind: number; k: number; r: number };
type Treasure = { kind: "ring" | "coin"; x: number; y: number; a: number; r: number; gone: boolean; visible: boolean };
type Ripple = { x: number; y: number; t0: number };
type Tween = { t0: number; from: { x: number; y: number; a: number }[]; to: { x: number; y: number; a: number }[] };
type Pointer = { id: number; x: number; y: number; t: number; x0: number; y0: number; t0: number; travel: number; ripple: number; vx: number; vy: number };

/** Where things go in a given round: the ring, the coins, and petals heaped over each of them. */
function layout(round: number) {
  const rnd = seeded(97 + round * 131);
  const polar = (d: number) => {
    const a = rnd() * TAU;
    return { x: Math.cos(a) * d, y: Math.sin(a) * d };
  };
  const ringAt = polar(0.2 + rnd() * 0.42);
  const treasures: Treasure[] = [{ kind: "ring", ...ringAt, a: 0, r: RING_R, gone: false, visible: false }];
  while (treasures.length < 1 + COINS) {
    const at = polar(Math.sqrt(rnd()) * 0.72);
    if (treasures.every((t) => Math.hypot(t.x - at.x, t.y - at.y) > 0.34)) {
      treasures.push({ kind: "coin", ...at, a: rnd() * TAU, r: COIN_R, gone: false, visible: false });
    }
  }
  const spots: { x: number; y: number; a: number }[] = [];
  // heap petals over the treasures so they start hidden
  treasures.forEach((t) => {
    const heap = t.kind === "ring" ? 9 : 5;
    for (let i = 0; i < heap; i++) {
      const a = rnd() * TAU;
      const d = rnd() * (t.r * 0.7);
      spots.push({ x: t.x + Math.cos(a) * d, y: t.y + Math.sin(a) * d, a: rnd() * TAU });
    }
  });
  while (spots.length < PETALS) {
    const at = polar(Math.sqrt(rnd()) * 0.93);
    spots.push({ ...at, a: rnd() * TAU });
  }
  // shuffle, so the heaps aren't always drawn on top
  for (let i = spots.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [spots[i], spots[j]] = [spots[j], spots[i]];
  }
  return { treasures, spots };
}

function makePetals(spots: { x: number; y: number; a: number }[]): Petal[] {
  const rnd = seeded(7);
  return spots.map((s) => {
    let pick = rnd() * TOTAL_WEIGHT;
    let kind = 0;
    while (pick > KINDS[kind].weight && kind < KINDS.length - 1) pick -= KINDS[kind++].weight;
    const k = 0.92 + rnd() * 0.38;
    const r = (Math.max(KINDS[kind].w, KINDS[kind].h) / 2) * k * 0.8;
    return { x: s.x, y: s.y, vx: 0, vy: 0, a: s.a, va: 0, kind, k, r };
  });
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export default function Bowl(props: Props) {
  const { round, revealSignal, found, className } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cb = useRef(props);
  useLayoutEffect(() => {
    cb.current = props;
  });

  const sim = useRef({
    petals: [] as Petal[],
    treasures: [] as Treasure[],
    ripples: [] as Ripple[],
    tween: null as Tween | null,
    sprites: [] as Sprite[],
    ringSprite: null as Sprite | null,
    coinSprite: null as Sprite | null,
    milk: null as HTMLCanvasElement | null,
    size: 0, // canvas size in CSS px
    dpr: 1,
    raf: 0,
    last: 0,
    ready: false,
    building: false,
    pointer: null as Pointer | null,
    shining: false,
    touched: false,
    found: false,
    round: -1,
  });

  /* ---------------- drawing ---------------- */

  const draw = (now: number) => {
    const S = sim.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !S.milk) return;
    const d = S.dpr;
    const R = (S.size / 2) * d;
    const stamp = (sp: Sprite, x: number, y: number, a: number, k: number) => {
      const c = Math.cos(a) * k;
      const s = Math.sin(a) * k;
      ctx.setTransform(c, s, -s, c, (1 + x) * R, (1 + y) * R);
      ctx.drawImage(sp.img, (-sp.w * d) / 2, (-sp.h * d) / 2, sp.w * d, sp.h * d);
    };

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(S.milk, 0, 0, canvas.width, canvas.height);

    if (!S.tween) {
      for (const t of S.treasures) {
        if (t.gone || (t.kind === "ring" && S.found)) continue;
        const sp = t.kind === "ring" ? S.ringSprite : S.coinSprite;
        if (sp) stamp(sp, t.x, t.y, t.a, 1);
      }
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (const rp of S.ripples) {
      const p = (now - rp.t0) / RIPPLE_MS;
      if (p >= 1) continue;
      const fade = (1 - p) ** 1.5;
      const rad = (0.035 + 0.3 * p) * R;
      ctx.lineWidth = 2.2 * d * (1 - p * 0.5);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 * fade})`;
      ctx.beginPath();
      ctx.arc((1 + rp.x) * R, (1 + rp.y) * R, rad, 0, TAU);
      ctx.stroke();
      ctx.lineWidth = 1.4 * d;
      ctx.strokeStyle = `rgba(150, 108, 52, ${0.24 * fade})`;
      ctx.beginPath();
      ctx.arc((1 + rp.x) * R, (1 + rp.y) * R + 1.6 * d, rad, 0, TAU);
      ctx.stroke();
    }

    for (const p of S.petals) stamp(S.sprites[p.kind], p.x, p.y, p.a, p.k);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  };

  /* ---------------- motion ---------------- */

  const stepPhysics = (dt: number) => {
    const S = sim.current;
    const decay = Math.exp(-dt / 190);
    const spin = Math.exp(-dt / 260);
    let moving = false;
    for (const p of S.petals) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.a += p.va * dt;
      p.vx *= decay;
      p.vy *= decay;
      p.va *= spin;
      const v = Math.hypot(p.vx, p.vy);
      if (v > MAX_V) {
        p.vx *= MAX_V / v;
        p.vy *= MAX_V / v;
      }
      // bounce softly off the rim of the thali
      const lim = 1 - p.r * 0.6;
      const dist = Math.hypot(p.x, p.y);
      if (dist > lim) {
        const nx = p.x / dist;
        const ny = p.y / dist;
        p.x = nx * lim;
        p.y = ny * lim;
        const vn = p.vx * nx + p.vy * ny;
        if (vn > 0) {
          p.vx -= 1.4 * vn * nx;
          p.vy -= 1.4 * vn * ny;
        }
      }
      if (v > 2e-5 || Math.abs(p.va) > 2e-4) moving = true;
    }
    return moving;
  };

  const stepTween = (now: number) => {
    const S = sim.current;
    const tw = S.tween;
    if (!tw) return false;
    const t = Math.min(1, (now - tw.t0) / 1150);
    const e = easeInOut(t);
    const swirl = Math.sin(Math.PI * e) * 1.15;
    const cs = Math.cos(swirl);
    const sn = Math.sin(swirl);
    S.petals.forEach((p, i) => {
      const f = tw.from[i];
      const to = tw.to[i];
      const x = f.x + (to.x - f.x) * e;
      const y = f.y + (to.y - f.y) * e;
      p.x = x * cs - y * sn;
      p.y = x * sn + y * cs;
      p.a = f.a + (to.a - f.a) * e + swirl;
      p.vx = p.vy = p.va = 0;
    });
    if (t >= 1) S.tween = null;
    return true;
  };

  /** Which treasures can be seen (no petal over them)? Tells the page when the ring shows. */
  const checkTreasures = () => {
    const S = sim.current;
    if (S.tween) return;
    for (const t of S.treasures) {
      if (t.gone) continue;
      t.visible = S.petals.every((p) => Math.hypot(p.x - t.x, p.y - t.y) > t.r + p.r * 0.55);
    }
    const ringT = S.treasures.find((t) => t.kind === "ring");
    const shining = !!ringT && ringT.visible && !S.found;
    if (shining !== S.shining) {
      S.shining = shining;
      cb.current.onShining(shining, ringT ? { x: ringT.x, y: ringT.y } : undefined);
    }
  };

  const frame = (now: number) => {
    const S = sim.current;
    S.raf = 0;
    const dt = S.last ? Math.min(34, now - S.last) : 16;
    S.last = now;
    let moving = S.tween ? stepTween(now) : stepPhysics(dt);
    S.ripples = S.ripples.filter((r) => now - r.t0 < RIPPLE_MS);
    if (S.ripples.length || S.pointer) moving = true;
    draw(now);
    checkTreasures();
    // keep going only while something moves, and never for a page that is off screen
    const offscreen = !!canvasRef.current?.closest("[data-offscreen]");
    if (moving && !offscreen) S.raf = requestAnimationFrame(frame);
    else S.last = 0;
  };

  const kick = () => {
    const S = sim.current;
    if (S.ready && !S.raf) S.raf = requestAnimationFrame(frame);
  };

  /* ---------------- setting up (in idle moments) ---------------- */

  const build = async () => {
    const S = sim.current;
    const canvas = canvasRef.current;
    if (!canvas || S.building) return;
    const size = canvas.getBoundingClientRect().width;
    if (size < 40) return;
    S.building = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const R = size / 2;
    await idle();
    const milk = paintMilk(size, dpr);
    await idle();
    const sprites = KINDS.map((k) => makeSprite(k.w * R, k.h * R, dpr * 1.35, k.draw));
    const ringSprite = makeSprite(RING_R * 2.1 * R, RING_R * 2.1 * R, dpr * 1.25, ring);
    const coinSprite = makeSprite(COIN_R * 2 * R, COIN_R * 2 * R, dpr * 1.25, coin);
    await idle();
    canvas.width = canvas.height = Math.round(size * dpr);
    Object.assign(S, { milk, sprites, ringSprite, coinSprite, size, dpr });
    if (!S.ready) {
      const { treasures, spots } = layout(round);
      S.treasures = treasures;
      S.petals = makePetals(spots);
      S.round = round;
      S.ready = true;
    }
    S.building = false;
    draw(performance.now());
    await idle();
    const big = makeSprite(120, 120, Math.min(dpr, 2), ring);
    cb.current.onRingArt(big.img.toDataURL());
  };

  // Paint everything while the guest is still about a page away, and again if the size changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          build();
        }
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(canvas);
    const ro = new ResizeObserver(([entry]) => {
      const S = sim.current;
      const w = entry.contentRect.width;
      if (S.ready ? Math.abs(w - S.size) > 4 : w >= 40) build();
    });
    ro.observe(canvas);
    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(sim.current.raf);
      sim.current.raf = 0;
    };
    // build reads the latest round from the closure at first paint only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A new round: the petals swirl back in and settle over freshly hidden treasures.
  useEffect(() => {
    const S = sim.current;
    if (!S.ready || round === S.round) return;
    S.round = round;
    const { treasures, spots } = layout(round);
    S.treasures = treasures;
    S.found = false;
    S.tween = {
      t0: performance.now(),
      from: S.petals.map((p) => ({ x: p.x, y: p.y, a: p.a })),
      to: spots,
    };
    kick();
  }, [round]);

  useEffect(() => {
    sim.current.found = found;
  }, [found]);

  // "Show me the ring": part the petals over it, then reveal it.
  useEffect(() => {
    const S = sim.current;
    if (!revealSignal || !S.ready) return;
    const ringT = S.treasures.find((t) => t.kind === "ring");
    if (!ringT) return;
    for (const p of S.petals) {
      const dx = p.x - ringT.x;
      const dy = p.y - ringT.y;
      const d = Math.hypot(dx, dy) || 1e-4;
      if (d < 0.7) {
        p.vx += (dx / d) * (0.7 - d) * 0.009;
        p.vy += (dy / d) * (0.7 - d) * 0.009;
        p.va += (Math.random() - 0.5) * 0.01;
      }
    }
    S.ripples.push({ x: ringT.x, y: ringT.y, t0: performance.now() });
    kick();
    const t = window.setTimeout(() => {
      if (!S.found) {
        S.found = true;
        cb.current.onFound({ x: ringT.x, y: ringT.y });
      }
    }, 900);
    return () => window.clearTimeout(t);
  }, [revealSignal]);

  /* ---------------- the finger ---------------- */

  const toBowl = (e: { clientX: number; clientY: number }, rect: DOMRect) => ({
    x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
    y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
  });

  const rect = useRef<DOMRect | null>(null);

  /** Petals near the finger move with it, and the ones right under it are pushed aside. */
  const stir = (x: number, y: number, vx: number, vy: number) => {
    for (const p of sim.current.petals) {
      const dx = p.x - x;
      const dy = p.y - y;
      const d = Math.hypot(dx, dy) || 1e-4;
      if (d < CARRY_R) {
        const f = 1 - d / CARRY_R;
        p.vx += (vx - p.vx) * f * 0.3;
        p.vy += (vy - p.vy) * f * 0.3;
        p.va += ((dx * vy - dy * vx) / d) * f * 0.9;
      }
      const reach = CLEAR_R + p.r * 0.5;
      if (d < reach) {
        const push = reach - d;
        p.x += (dx / d) * push * 0.55;
        p.y += (dy / d) * push * 0.55;
        p.vx += (dx / d) * push * 0.006;
        p.vy += (dy / d) * push * 0.006;
      }
    }
  };

  const onDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const S = sim.current;
    if (!S.ready || S.tween) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    rect.current = e.currentTarget.getBoundingClientRect();
    const at = toBowl(e, rect.current);
    const now = performance.now();
    S.pointer = { id: e.pointerId, ...at, t: now, x0: at.x, y0: at.y, t0: now, travel: 0, ripple: now, vx: 0, vy: 0 };
    S.ripples.push({ ...at, t0: now });
    stir(at.x, at.y, 0, 0);
    if (!S.touched) {
      S.touched = true;
      cb.current.onTouch();
    }
    kick();
  };

  const onMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const S = sim.current;
    const P = S.pointer;
    if (!P || P.id !== e.pointerId || !rect.current) return;
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [];
    for (const ev of events.length ? events : [e.nativeEvent]) {
      const at = toBowl(ev, rect.current);
      const now = ev.timeStamp || performance.now();
      const dt = Math.max(1, now - P.t);
      P.vx = P.vx * 0.5 + ((at.x - P.x) / dt) * 0.5;
      P.vy = P.vy * 0.5 + ((at.y - P.y) / dt) * 0.5;
      P.travel += Math.hypot(at.x - P.x, at.y - P.y);
      P.x = at.x;
      P.y = at.y;
      P.t = now;
      stir(at.x, at.y, P.vx, P.vy);
      if (now - P.ripple > 75) {
        P.ripple = now;
        S.ripples.push({ ...at, t0: performance.now() });
      }
    }
    kick();
  };

  const onUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const S = sim.current;
    const P = S.pointer;
    if (!P || P.id !== e.pointerId) return;
    S.pointer = null;
    const tap = P.travel < 0.08 && performance.now() - P.t0 < 450;
    checkTreasures();
    for (const t of S.treasures) {
      if (t.gone || !t.visible || (t.kind === "ring" && S.found)) continue;
      const d = Math.hypot(P.x - t.x, P.y - t.y);
      if (d > t.r + (tap ? 0.08 : 0.02)) continue;
      if (t.kind === "coin") {
        t.gone = true;
        cb.current.onCoin({ x: t.x, y: t.y });
      } else {
        S.found = true;
        // the petals rush away from the ring
        for (const p of S.petals) {
          const dx = p.x - t.x;
          const dy = p.y - t.y;
          const dist = Math.hypot(dx, dy) || 1e-4;
          p.vx += (dx / dist) * 0.0035;
          p.vy += (dy / dist) * 0.0035;
          p.va += (Math.random() - 0.5) * 0.012;
        }
        cb.current.onFound({ x: t.x, y: t.y });
      }
      S.ripples.push({ x: t.x, y: t.y, t0: performance.now() });
      break;
    }
    kick();
  };

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label="A brass thali of milk covered in floating rose and marigold petals. Swirl the petals with your finger to find the hidden ring, or use the button below."
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    />
  );
}
