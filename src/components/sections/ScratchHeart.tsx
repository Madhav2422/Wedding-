"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { weddingDate } from "@/config/wedding";
import { idle, whenIdle } from "@/lib/idle";
import { seeded } from "@/lib/random";
import { n } from "@/lib/svg";
import s from "./Scratch.module.css";

/** Heart outline on a 100 × 95 canvas. */
const HEART = "M50,92 C20,70 2,52 2,31 C2,14 14,3 29,3 C39,3 46,9 50,18 C54,9 61,3 71,3 C86,3 98,14 98,31 C98,52 80,70 50,92 Z";
const VB_W = 100;
const VB_H = 95;
/** Reveal once this share of the gold foil has been scratched away. */
const REVEAL_AT = 0.48;
/** Check every Nth pixel when measuring how much is scratched (fast, accurate enough). */
const SAMPLE = 6;

/** Hearts & sparkles that burst out when the date is revealed. */
const BURST = (() => {
  const rnd = seeded(14);
  return Array.from({ length: 26 }, (_, i) => {
    const a = (i / 26) * Math.PI * 2 + rnd() * 0.4;
    const d = 90 + rnd() * 120;
    return {
      heart: i % 3 !== 0,
      style: {
        "--x": `${n(Math.cos(a) * d)}px`,
        "--y": `${n(Math.sin(a) * d - 30)}px`,
        "--r": `${n(rnd() * 80 - 40)}deg`,
        "--s": n(0.6 + rnd() * 0.9),
        "--d": `${n(rnd() * 0.25)}s`,
      } as CSSProperties,
    };
  });
})();

type Point = { x: number; y: number };

type Props = {
  revealed: boolean;
  onReveal: () => void;
};

export default function ScratchHeart({ revealed, onReveal }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glintRef = useRef<HTMLSpanElement>(null);
  const st = useRef({
    drawing: false,
    last: null as Point | null,
    rect: null as DOMRect | null,
    total: 0,
    lastCheck: 0,
    width: 0,
    done: false,
    /** Bumped on every repaint, so an older half-finished paint stops. */
    gen: 0,
  });
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);

  const finish = useCallback(() => {
    if (st.current.done) return;
    st.current.done = true;
    navigator.vibrate?.(35);
    onReveal();
  }, [onReveal]);

  /**
   * Paint the gold foil over the heart — in a few small steps, each in an idle moment, so the
   * phone never freezes for a frame while the guest is scrolling.
   */
  const paint = useCallback(async () => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas || st.current.done) return;
    const gen = ++st.current.gen;
    const step = async () => {
      await idle();
      return gen === st.current.gen && !st.current.done;
    };
    const { width, height } = wrap.getBoundingClientRect();
    if (width < 20) return;
    st.current.width = width;

    const family = getComputedStyle(document.documentElement).getPropertyValue("--font-cinzel").trim() || "serif";
    try {
      await document.fonts.load(`600 20px ${family}`);
    } catch {
      /* fall back to whatever font is available */
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.setTransform(canvas.width / VB_W, 0, 0, canvas.height / VB_H, 0, 0);
    ctx.clearRect(0, 0, VB_W, VB_H);
    const heart = new Path2D(HEART);

    // gold foil
    const g = ctx.createLinearGradient(0, 0, VB_W, VB_H);
    const stops: [number, string][] = [
      [0, "#8a5a14"],
      [0.18, "#e9c35e"],
      [0.34, "#fff1b8"],
      [0.5, "#cf9f3f"],
      [0.66, "#f6dc8a"],
      [0.84, "#b8862b"],
      [1, "#7a4f12"],
    ];
    for (const [o, c] of stops) g.addColorStop(o, c);
    ctx.fillStyle = g;
    ctx.fill(heart);
    if (!(await step())) return;

    ctx.save();
    ctx.clip(heart);
    // brushed-metal lines — one path, one stroke (hundreds of separate draws stalled phones)
    ctx.globalAlpha = 0.16;
    ctx.strokeStyle = "#fff8dc";
    ctx.lineWidth = 0.22;
    ctx.beginPath();
    for (let x = -VB_H; x < VB_W; x += 1.6) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x + VB_H, VB_H);
    }
    ctx.stroke();
    if (!(await step())) return;
    // glitter — grouped into four brightness levels, one fill each
    const rnd = seeded(77);
    const levels = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
    for (let i = 0; i < 170; i++) {
      const level = levels[Math.min(3, Math.floor(rnd() * 4))];
      const x = rnd() * VB_W;
      const y = rnd() * VB_H;
      const r = 0.15 + rnd() * 0.45;
      level.moveTo(x + r, y);
      level.arc(x, y, r, 0, Math.PI * 2);
    }
    ctx.fillStyle = "#fffbe6";
    levels.forEach((dots, i) => {
      ctx.globalAlpha = 0.3 + (i + 0.5) * 0.15;
      ctx.fill(dots);
    });
    ctx.globalAlpha = 1;
    // inner dotted heart
    ctx.setLineDash([0.01, 2.3]);
    ctx.lineCap = "round";
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = "rgba(122, 79, 18, 0.6)";
    ctx.translate(50, 47);
    ctx.scale(0.84, 0.84);
    ctx.translate(-50, -47);
    ctx.stroke(heart);
    ctx.restore();
    ctx.setLineDash([]);
    if (!(await step())) return;

    // embossed edge
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = "#7a4f12";
    ctx.stroke(heart);

    // "Scratch here" lettering, embossed
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const emboss = (text: string, size: number, y: number) => {
      ctx.font = `600 ${size}px ${family}`;
      ctx.fillStyle = "rgba(255, 248, 220, 0.8)";
      ctx.fillText(text, 50.35, y + 0.35);
      ctx.fillStyle = "#6b4410";
      ctx.fillText(text, 50, y);
    };
    emboss("SCRATCH", 7, 36);
    emboss("HERE", 7, 45);
    ctx.font = "8px serif";
    ctx.fillStyle = "#9b1c31";
    ctx.fillText("♥", 50, 56);
    if (!(await step())) return;

    // measure how much foil there is, so we know when enough is scratched off
    st.current.total = countOpaque(canvas);
    setReady(true);
  }, []);

  // The very first drawing canvas on a page is slow to set up (a one-off ~20 ms on a phone).
  // Get that out of the way while the guest is still at the palace gates, not mid-scroll.
  useEffect(
    () =>
      whenIdle(() => {
        const warm = document.createElement("canvas");
        warm.width = warm.height = 2;
        warm.getContext("2d", { willReadFrequently: true })?.fillRect(0, 0, 1, 1);
      }),
    [],
  );

  // Draw the foil while the guest is still about a page away, in idle time, so arriving on the
  // page is instant; draw again if the width changes.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let cancelIdle: (() => void) | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        cancelIdle = whenIdle(() => paint());
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(wrap);
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (st.current.width && !st.current.done && Math.abs(w - st.current.width) > 2) paint();
    });
    ro.observe(wrap);
    return () => {
      io.disconnect();
      ro.disconnect();
      cancelIdle?.();
    };
  }, [paint]);

  const toCanvas = (clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current!;
    const r = st.current.rect ?? canvas.getBoundingClientRect();
    return {
      x: (clientX - r.left) * (canvas.width / r.width),
      y: (clientY - r.top) * (canvas.height / r.height),
    };
  };

  const scratch = (to: Point) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !ctx) return;
    const from = st.current.last ?? to;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = canvas.width * 0.12;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x + 0.01, to.y);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    st.current.last = to;
  };

  const moveGlint = (clientX: number, clientY: number) => {
    const r = st.current.rect;
    const glint = glintRef.current;
    if (!r || !glint) return;
    glint.style.transform = `translate3d(${clientX - r.left}px, ${clientY - r.top}px, 0)`;
  };

  const checkProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas || !st.current.total) return;
    const cleared = 1 - countOpaque(canvas) / st.current.total;
    if (cleared >= REVEAL_AT) finish();
  };

  const onDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (st.current.done || !ready) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    st.current.drawing = true;
    st.current.rect = e.currentTarget.getBoundingClientRect();
    st.current.last = null;
    if (!started) setStarted(true);
    wrapRef.current?.classList.add(s.scratching);
    moveGlint(e.clientX, e.clientY);
    scratch(toCanvas(e.clientX, e.clientY));
  };

  const onMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!st.current.drawing || st.current.done) return;
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [];
    if (events.length) {
      for (const ev of events) scratch(toCanvas(ev.clientX, ev.clientY));
    } else {
      scratch(toCanvas(e.clientX, e.clientY));
    }
    moveGlint(e.clientX, e.clientY);
    const now = performance.now();
    if (now - st.current.lastCheck > 300) {
      st.current.lastCheck = now;
      checkProgress();
    }
  };

  const onUp = () => {
    if (!st.current.drawing) return;
    st.current.drawing = false;
    st.current.last = null;
    wrapRef.current?.classList.remove(s.scratching);
    checkProgress();
  };

  const classes = [s.heartWrap, ready && s.ready, started && s.started, revealed && s.revealed].filter(Boolean).join(" ");

  return (
    <div className={s.heartArea}>
      <div ref={wrapRef} className={classes}>
        {/* the date, hidden under the foil */}
        <div className={s.dateHeart}>
          <svg className={s.dateSvg} viewBox="0 0 100 95" aria-hidden="true" focusable="false">
            <defs>
              <radialGradient id="dh-fill" cx=".5" cy=".38" r=".7">
                <stop offset="0" stopColor="#fffdf7" />
                <stop offset=".7" stopColor="#f9ecd2" />
                <stop offset="1" stopColor="#efd6a8" />
              </radialGradient>
            </defs>
            <path d={HEART} fill="url(#dh-fill)" stroke="#c8952e" strokeWidth="1.3" />
            <path
              d={HEART}
              fill="none"
              stroke="#c8952e"
              strokeWidth=".7"
              strokeDasharray="0.01 2.3"
              strokeLinecap="round"
              transform="translate(50 47) scale(0.84) translate(-50 -47)"
            />
          </svg>
          <div className={s.dateText}>
            <span className={s.save}>Save the Date</span>
            <span className={s.dd}>{weddingDate.day}</span>
            <span className={s.mm}>{weddingDate.month}</span>
            <span className={s.yy}>
              {weddingDate.weekday} · {weddingDate.year}
            </span>
          </div>
        </div>

        {/* the gold foil you scratch */}
        <canvas
          ref={canvasRef}
          className={s.foil}
          aria-label="Gold scratch card hiding the wedding date. Scratch it, or use the reveal button below."
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />

        {/* hints */}
        <span className={s.trail} aria-hidden="true" />
        <span ref={glintRef} className={s.glint} aria-hidden="true" />

        {revealed && (
          <div className={s.burst} aria-hidden="true">
            {BURST.map((b, i) => (
              <span key={i} className={b.heart ? s.burstHeart : s.burstSpark} style={b.style} />
            ))}
          </div>
        )}
      </div>

      <button type="button" className={s.revealBtn} onClick={finish} disabled={revealed} tabIndex={revealed ? -1 : 0}>
        or tap here to reveal
      </button>
    </div>
  );
}

let probe: HTMLCanvasElement | null = null;

/**
 * Count the pixels that still have foil on them — on a small copy of the canvas. Reading back
 * every pixel of the full-size canvas froze phones for a moment right as the page scrolled in.
 */
function countOpaque(canvas: HTMLCanvasElement) {
  const w = Math.max(1, Math.round(canvas.width / SAMPLE));
  const h = Math.max(1, Math.round(canvas.height / SAMPLE));
  probe ??= document.createElement("canvas");
  probe.width = w;
  probe.height = h;
  const ctx = probe.getContext("2d", { willReadFrequently: true });
  if (!ctx) return 0;
  ctx.imageSmoothingEnabled = false; // plain sampling: much faster, and all we need for counting
  ctx.drawImage(canvas, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  let count = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > 100) count++;
  return count;
}
