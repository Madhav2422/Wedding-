"use client";

import { useState, type RefObject } from "react";
import s from "./effects.module.css";

/** Small floating button to pause / resume the background music. */
export default function MusicToggle({ audioRef }: { audioRef: RefObject<HTMLAudioElement | null> }) {
  const [playing, setPlaying] = useState(true);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  return (
    <button type="button" className={s.music} onClick={toggle} aria-label={playing ? "Pause music" : "Play music"}>
      <span className={`${s.bars} ${playing ? s.barsOn : ""}`}>
        <i />
        <i />
        <i />
        <i />
      </span>
    </button>
  );
}
