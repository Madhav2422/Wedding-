"use client";

import { useEffect, useState } from "react";

const DAY = 86_400_000;
const HOUR = 3_600_000;
const MINUTE = 60_000;

export type CountdownParts = { days: number; hours: number; minutes: number; seconds: number; done: boolean };

/**
 * Live countdown to `target`. Returns null on the server and on the very first
 * client render (so hydration matches), then ticks every second.
 */
export function useCountdown(target: string, running = true): CountdownParts | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  if (now === null) return null;
  const diff = Math.max(0, new Date(target).getTime() - now);
  return {
    days: Math.floor(diff / DAY),
    hours: Math.floor(diff / HOUR) % 24,
    minutes: Math.floor(diff / MINUTE) % 60,
    seconds: Math.floor(diff / 1000) % 60,
    done: diff === 0,
  };
}
