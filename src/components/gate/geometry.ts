/**
 * The whole palace gate is drawn on an 800 × 1400 canvas (SVG user units).
 * The doorway is a Rajput/Mughal ogee arch; everything else is laid out around it.
 */
export const VIEW_W = 800;
export const VIEW_H = 1400;

const CURVE_L = "C140,470 260,380 370,330 Q395,318 400,290";
const CURVE_R = "Q405,318 430,330 C540,380 660,470 660,620";

/** The doorway opening (closed shape). */
export const ARCH_OPEN = `M140,1340 V620 ${CURVE_L} ${CURVE_R} V1340 Z`;
/** The doorway edge as an open line (sides + arch, no floor). */
export const ARCH_EDGE = `M140,1342 V620 ${CURVE_L} ${CURVE_R} V1342`;
/** Only the curved part of the arch (for the scalloped cusps). */
export const ARCH_CURVE = `M140,620 ${CURVE_L} ${CURVE_R}`;
/** Centre-line of the thick carved frame around the doorway (~44 units outside the opening). */
export const ARCH_MID =
  "M96,1342 V620 C96,445 225,345 352,290 Q392,272 400,240 Q408,272 448,290 C575,345 704,445 704,620 V1342";
/** Left door = left half of the opening. The right door is its mirror image. */
export const DOOR_LEFT = `M140,1340 V620 ${CURVE_L} V1340 Z`;
/**
 * The palace wall with the doorway cut out of it. It reaches far enough to cover
 * ultra-wide and very tall screens, but no further — a smaller drawing is cheaper
 * for the GPU to zoom.
 */
export const WALL = `M-2800,-1200 H3600 V2600 H-2800 Z ${ARCH_OPEN}`;

/** Centre of the mandala that is split across both doors (the seal sits here). */
export const MEDALLION = { cx: 400, cy: 967 };

/** Percentages used to place HTML layers exactly on top of the SVG drawing. */
export const LAYOUT = {
  doorTop: (290 / VIEW_H) * 100,
  doorHeight: (1050 / VIEW_H) * 100,
  doorLeft: (140 / VIEW_W) * 100,
  doorWidth: (260 / VIEW_W) * 100,
  sealTop: (MEDALLION.cy / VIEW_H) * 100,
};
