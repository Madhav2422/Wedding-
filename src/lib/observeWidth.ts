/**
 * Calls `onWidth` with the element's width now and whenever it changes. Uses ResizeObserver,
 * or window resizes in old phone browsers that don't have it. Returns a function that stops.
 */
export function observeWidth(el: Element, onWidth: (width: number) => void): () => void {
  if (typeof ResizeObserver === "function") {
    const ro = new ResizeObserver(([entry]) => onWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }
  const measure = () => onWidth(el.getBoundingClientRect().width);
  const first = requestAnimationFrame(measure); // like ResizeObserver's first report
  window.addEventListener("resize", measure);
  return () => {
    cancelAnimationFrame(first);
    window.removeEventListener("resize", measure);
  };
}
