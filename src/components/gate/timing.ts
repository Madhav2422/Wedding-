/**
 * Timeline of the palace-gate opening, in seconds after the tap.
 *
 * Every moving part of the gate (seal, sparks, doors, light, rays and the walk through
 * the arch) is a CSS animation of `transform` / `opacity` only. Browsers run those on
 * the GPU compositor, independent of JavaScript, so nothing can make them stutter.
 *
 * Shared by the gate, the invitation and the early-tap script in app/layout.tsx.
 */
export const GATE_TIMING = {
  doors: 0.45,
  doorsDuration: 3,
  zoom: 2.2,
  zoomDuration: 2.4,
  /** When the gate is removed and the invitation takes over. */
  total: 4.7,
};

/**
 * Class names the early-tap script puts on <html> (see app/layout.tsx):
 * `gate-go` starts the opening, `gate-gone` hides the gate if the page's JavaScript never
 * arrives. The CSS for both lives in PalaceGate.module.css and Hero.module.css.
 */
export const EARLY_TAP = { go: "gate-go", gone: "gate-gone" } as const;
