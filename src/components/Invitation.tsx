"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { wedding } from "@/config/wedding";
import { fadeIn, playTempleBell, prepareAudio, prepareMusic } from "@/lib/sound";
import MusicToggle from "./effects/MusicToggle";
import PetalShower from "./effects/PetalShower";
import PalaceGate, { GATE_TIMING } from "./gate/PalaceGate";
import Hero from "./hero/Hero";
import CountdownSection from "./sections/CountdownSection";
import EventSection from "./sections/EventSection";
import InviteSection from "./sections/InviteSection";
import RsvpSection from "./sections/RsvpSection";
import ScratchSection from "./sections/ScratchSection";

type Stage = "closed" | "opening" | "open";

const MUSIC: string = wedding.music;
const MUSIC_START: number = wedding.musicStart;

/**
 * The landing experience:
 *   closed  → palace gates shown, waiting for a tap
 *   opening → seal breaks, doors swing, we walk through the arch
 *   open    → gates removed, invitation is fully interactive
 *
 * Tip: add ?skipIntro to the URL to jump straight to the invitation while designing.
 */
export default function Invitation() {
  const [stage, setStage] = useState<Stage>("closed");
  const [skipped, setSkipped] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoPaused = useRef(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("skipIntro")) {
      setSkipped(true);
      setStage("open");
    }
    // quietly download the bell (and the song) once the page has settled, so the tap is instant
    const warm = window.setTimeout(() => {
      if (wedding.chime) prepareAudio();
      prepareMusic(MUSIC, MUSIC_START);
    }, 1500);
    // pause the song while the guest is in another app or tab, resume when they return
    const onVisibility = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.hidden && !audio.paused) {
        audio.pause();
        autoPaused.current = true;
      } else if (!document.hidden && autoPaused.current) {
        autoPaused.current = false;
        audio.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearTimeout(timer.current);
      window.clearTimeout(warm);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Lock scrolling while the gates are on screen.
  useEffect(() => {
    document.documentElement.classList.toggle("gate-locked", stage !== "open");
  }, [stage]);

  // Finger-down: make sure the bell is loading (iPhones only fetch audio after a touch).
  const prepare = useCallback(() => {
    if (wedding.chime) prepareAudio();
  }, []);

  const open = useCallback(() => {
    if (stage !== "closed") return;
    setStage("opening");

    if (wedding.chime) playTempleBell();
    const audio = prepareMusic(MUSIC, MUSIC_START);
    if (audio) {
      audioRef.current = audio;
      audio.volume = 0;
      audio
        .play()
        .then(() => {
          setMusicOn(true);
          fadeIn(audio, 0.7, 3500);
        })
        .catch(() => {
          /* no song file yet, or the browser said no — the invitation works without it */
        });
    }

    timer.current = window.setTimeout(() => setStage("open"), GATE_TIMING.total * 1000);
  }, [stage]);

  return (
    <main>
      <Hero
        revealed={stage !== "closed"}
        settled={stage === "open"}
        delay={skipped ? 0 : GATE_TIMING.zoom}
        approach={GATE_TIMING.zoomDuration}
      />
      {/* The pages, revealed one by one as the guest scrolls */}
      <InviteSection />
      <ScratchSection />
      <CountdownSection />
      {wedding.events.map((event, i) => (
        <EventSection key={event.id} event={event} index={i} />
      ))}
      <RsvpSection />

      {stage !== "open" && <PalaceGate stage={stage} onOpen={open} onPrepare={prepare} />}

      {stage !== "closed" && !skipped && (
        <PetalShower count={48} seed={21} startDelay={0.9} spread={2.4} minDuration={4.5} maxDuration={7.5} />
      )}

      {musicOn && <MusicToggle audioRef={audioRef} />}
    </main>
  );
}
