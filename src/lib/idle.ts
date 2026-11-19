/**
 * Run `fn` when the browser is idle, so heavy one-off work (painting a canvas…) never lands in
 * the middle of a scroll. Safari has no requestIdleCallback, so it gets a short timeout.
 * Returns a function that cancels it.
 */
export function whenIdle(fn: () => void) {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(fn, { timeout: 600 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, 120);
  return () => window.clearTimeout(id);
}

/** Resolves at the browser's next idle moment (for splitting work into small steps). */
export function idle() {
  return new Promise<void>((resolve) => {
    whenIdle(resolve);
  });
}
