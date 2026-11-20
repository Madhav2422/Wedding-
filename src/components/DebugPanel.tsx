"use client";

import { useEffect, useState } from "react";

/**
 * Hidden test panel: add ?debug to the link (optionally &flat or &nosound to switch suspects
 * off). It shows what a phone actually does while the gate opens, so a problem on a guest's
 * phone can be diagnosed from a single screenshot. Guests never see or download it.
 */
type Entry = { t: number; type: string; target: string; top: string };
type DebugWindow = Window & {
  __dbg?: { log: Entry[]; errors: string[] };
  __gateReady?: boolean;
  __gateReadyAt?: number;
  __gateTap?: number;
};
type UAData = { getHighEntropyValues(hints: string[]): Promise<Record<string, unknown>> };

/** Opening angle of a door from its computed transform (3D swing or flat test version). */
function doorAngle(el: Element | null) {
  if (!el) return 0;
  const m = getComputedStyle(el).transform;
  const v3 = m.match(/matrix3d\(([^)]+)\)/);
  const v2 = m.match(/matrix\(([^)]+)\)/);
  const a = v3 ? Number(v3[1].split(",")[0]) : v2 ? Number(v2[1].split(",")[0]) : 1;
  return Math.round((Math.acos(Math.max(-1, Math.min(1, a))) * 180) / Math.PI);
}

function gpuName() {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (!gl) return "no WebGL";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
  } catch {
    return "unknown";
  }
}

const secs = (t?: number) => (t ? `${(t / 1000).toFixed(2)}s` : "–");

export default function DebugPanel() {
  const [text, setText] = useState("");

  useEffect(() => {
    const w = window as DebugWindow;
    const h = document.documentElement;
    const params = new URLSearchParams(location.search);
    const s = { openedAt: 0, goneAt: 0, maxDoor: 0, maxZoom: 1, fps: 0, minFps: 0, worstGap: 0, frames: 0, winStart: performance.now(), last: performance.now() };
    const opening = () => s.openedAt > 0 && !s.goneAt;

    // frame rate: how often the phone actually draws a new picture
    let raf = 0;
    const tick = (t: number) => {
      if (opening()) s.worstGap = Math.max(s.worstGap, t - s.last);
      s.last = t;
      s.frames++;
      if (t - s.winStart >= 1000) {
        s.fps = Math.round((s.frames * 1000) / (t - s.winStart));
        if (opening()) s.minFps = s.minFps ? Math.min(s.minFps, s.fps) : s.fps;
        s.frames = 0;
        s.winStart = t;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const gpu = gpuName();
    let device = "";
    (navigator as Navigator & { userAgentData?: UAData }).userAgentData
      ?.getHighEntropyValues(["model", "platformVersion"])
      .then((v) => (device = ` · ${v.model || "?"} · Android ${v.platformVersion || "?"}`))
      .catch(() => {});
    const nav = performance.getEntriesByType("navigation")[0] as (PerformanceEntry & { activationStart?: number }) | undefined;
    const prerendered = (nav?.activationStart ?? 0) > 0;
    const browser = navigator.userAgent.match(/(Chrome|Firefox|SamsungBrowser|VivoBrowser|Version)\/[\d.]+/g)?.join(" ") ?? navigator.userAgent.slice(0, 50);
    const tests = [h.classList.contains("dbg-flat") && "FLAT DOORS", params.has("nosound") && "NO SOUND"].filter(Boolean).join(" + ");

    const update = () => {
      const now = performance.now();
      const gate = document.querySelector("[data-gate]");
      const door = document.querySelector('[class*="doorLeft"]');
      const zoom = document.querySelector('[class*="_zoom"]');
      const isOpening = !!gate && (/opening/.test(String(gate.getAttribute("class"))) || h.classList.contains("gate-go"));
      if (isOpening && !s.openedAt) s.openedAt = now;
      if (!gate && s.openedAt && !s.goneAt) s.goneAt = now;
      const deg = doorAngle(door);
      s.maxDoor = Math.max(s.maxDoor, deg);
      const zm = zoom && getComputedStyle(zoom).transform.match(/matrix\(([^,]+)/);
      if (zm) s.maxZoom = Math.max(s.maxZoom, Number(zm[1]));
      const anim = door?.getAnimations
        ? door.getAnimations().map((a) => `${a.playState}@${Math.round(Number(a.currentTime ?? 0))}ms`).join(",") || "none"
        : "n/a";
      const log = w.__dbg?.log ?? [];
      const errors = w.__dbg?.errors ?? [];
      setText(
        [
          `${browser}${device}${prerendered ? " · prerendered" : ""}`,
          `${innerWidth}×${innerHeight} @${devicePixelRatio.toFixed(2)} · motion ${matchMedia("(prefers-reduced-motion: reduce)").matches ? "REDUCED" : "normal"} · dark ${matchMedia("(prefers-color-scheme: dark)").matches ? "on" : "off"} · ${navigator.language}${h.classList.contains("translated-ltr") ? " · TRANSLATED" : ""}`,
          `GPU ${gpu}`,
          tests ? `TEST: ${tests}` : "",
          `page code ready: ${w.__gateReady ? `yes at ${secs(w.__gateReadyAt)}` : "NO"}${w.__gateTap != null ? ` · early tap at ${secs(w.__gateTap)}` : ""}`,
          `touches: ${log.length ? "" : "none yet"}`,
          ...log.slice(-4).map((e) => `  ${e.type} ${secs(e.t)} on ${e.target}${e.top !== e.target ? ` (top: ${e.top})` : ""}`),
          `gate: ${gate ? (isOpening ? `OPENING since ${secs(s.openedAt)}` : "closed") : `gone at ${secs(s.goneAt)}`}`,
          `doors: now ${deg}° · max ${s.maxDoor}° (82° = open) · ${anim}`,
          `walk-in zoom max ${s.maxZoom.toFixed(2)}× (5.5 = full)`,
          `frames ${s.fps}/s · while opening: lowest ${s.minFps || "–"}/s, longest pause ${Math.round(s.worstGap)}ms`,
          `errors: ${errors.length ? errors.slice(-3).join(" | ") : "none"}`,
        ]
          .filter(Boolean)
          .join("\n"),
      );
    };
    update();
    const id = window.setInterval(update, 200);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(id);
    };
  }, []);

  return (
    <pre
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        margin: 0,
        padding: "6px 8px",
        background: "rgba(0, 0, 0, 0.8)",
        color: "#b7ffb7",
        font: "10px/1.4 ui-monospace, Menlo, monospace",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        pointerEvents: "none",
      }}
    >
      {text}
    </pre>
  );
}
