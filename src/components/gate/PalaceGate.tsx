"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import { seeded } from "@/lib/random";
import { n } from "@/lib/svg";
import GoldDust from "../effects/GoldDust";
import DoorArt, { DoorShade } from "./DoorArt";
import GateFrame from "./GateFrame";
import { LAYOUT } from "./geometry";
import Rays from "./Rays";
import SealArt from "./SealArt";
import s from "./PalaceGate.module.css";

export type GateStage = "closed" | "opening";

/**
 * Timeline of the opening sequence, in seconds after the tap.
 *
 * Every moving part of the gate (seal, sparks, doors, light, rays and the walk through
 * the arch) is a CSS animation of `transform` / `opacity` only. Browsers run those on
 * the GPU compositor, independent of JavaScript, so nothing can make them stutter.
 */
export const GATE_TIMING = {
  doors: 0.45,
  doorsDuration: 3,
  zoom: 2.2,
  zoomDuration: 2.4,
  /** When the gate is removed and the invitation takes over. */
  total: 4.7,
};

const timingVars = {
  "--doors-delay": `${GATE_TIMING.doors}s`,
  "--doors-duration": `${GATE_TIMING.doorsDuration}s`,
  "--zoom-delay": `${GATE_TIMING.zoom}s`,
  "--zoom-duration": `${GATE_TIMING.zoomDuration}s`,
} as CSSProperties;

/** Gold sparks that burst out when the seal breaks. */
const SPARKS = (() => {
  const rnd = seeded(3);
  return Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2 + rnd() * 0.3;
    const d = 55 + rnd() * 75;
    return {
      "--x": `${n(Math.cos(a) * d)}px`,
      "--y": `${n(Math.sin(a) * d)}px`,
      "--s": n(0.6 + rnd() * 0.9),
      "--d": `${n(rnd() * 0.12)}s`,
    } as CSSProperties;
  });
})();

const doorBox: CSSProperties = {
  top: `${LAYOUT.doorTop}%`,
  height: `${LAYOUT.doorHeight}%`,
  width: `${LAYOUT.doorWidth}%`,
};
const doorwayBox: CSSProperties = {
  top: `${LAYOUT.doorTop}%`,
  height: `${LAYOUT.doorHeight}%`,
  left: `${LAYOUT.doorLeft}%`,
  width: `${LAYOUT.doorWidth * 2}%`,
};

type Props = {
  stage: GateStage;
  onOpen: () => void;
  /** Called on finger-down, just before the tap, to warm up anything slow (audio). */
  onPrepare?: () => void;
};

export default function PalaceGate({ stage, onOpen, onPrepare }: Props) {
  const opening = stage === "opening";

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onPrepare?.();
      onOpen();
    }
  };

  return (
    <div
      className={`${s.scene} ${opening ? s.opening : ""}`}
      style={timingVars}
      role="button"
      tabIndex={0}
      aria-label="Tap to open the wedding invitation"
      onPointerDown={onPrepare}
      onClick={onOpen}
      onKeyDown={onKey}
    >
      <div className={s.stage}>
        {/* gateBox: sized drawing + gentle intro zoom-out on load */}
        <div className={s.gateBox}>
          {/* zoom: the camera walking through the arch */}
          <div className={s.zoom}>
            {/* warm light pouring out from inside the palace */}
            <div className={s.innerGlow} style={doorwayBox} />
            <div className={s.backing} style={doorwayBox} />

            {/* the two doors */}
            <div className={s.doorway}>
              <div className={`${s.door} ${s.doorLeft}`} style={{ ...doorBox, left: `${LAYOUT.doorLeft}%` }}>
                <DoorArt side="left" />
                <DoorShade side="left" className={s.shade} />
              </div>
              <div className={`${s.door} ${s.doorRight}`} style={{ ...doorBox, left: "50%" }}>
                <DoorArt side="right" />
                <DoorShade side="right" className={s.shade} />
              </div>
            </div>

            {/* palace façade with the doorway cut out */}
            <GateFrame className={s.frame} />

            {/* light rays */}
            <div className={s.raysWrap}>
              <Rays className={s.rays} />
            </div>

            {/* wax seal */}
            <div className={s.sealWrap} style={{ top: `${LAYOUT.sealTop}%` }}>
              <span className={s.ripple} />
              <span className={s.ripple} style={{ animationDelay: "3.4s" }} />
              <div className={s.seal}>
                <div className={s.sealInner}>
                  <SealArt />
                </div>
              </div>
              {SPARKS.map((style, i) => (
                <span key={i} className={s.spark} style={style} />
              ))}
            </div>

            {/* tap hint */}
            <div className={s.hintWrap}>
              <div className={s.hint}>
                <span className={s.hintStar}>✦</span>
                <span className={s.hintText}>Tap to open</span>
                <span className={s.hintStar}>✦</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={s.overlays}>
        <GoldDust count={26} seed={11} />
        <div className={s.vignette} />
      </div>
      <div className={s.curtain} />
    </div>
  );
}
