"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { wedding } from "@/config/wedding";
import { fadeIn, playTempleBell, prepareAudio, prepareMusic } from "@/lib/sound";
import MusicToggle from "./effects/MusicToggle";
import PetalShower from "./effects/PetalShower";
import PalaceGate, { GATE_TIMING } from "./gate/PalaceGate";
import Hero from "./hero/Hero";
import AekiBekiSection from "./sections/AekiBekiSection";
import CountdownSection from "./sections/CountdownSection";
import EventSection from "./sections/EventSection";
import InviteSection from "./sections/InviteSection";
import RsvpSection from "./sections/RsvpSection";
import ScratchSection from "./sections/ScratchSection";

type Stage = "closed" | "opening" | "open";

const MUSIC: string = wedding.music;
const MUSIC_START: number = wedding.musicStart;
/** Seconds after the tap when the petal shower is created (its first petals fall at 0.9 s). */
const SHOWER_AFTER = 0.35;

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
  const [shower, setShower] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoPaused = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const showerTimer = useRef<number | undefined>(undefined);
  const begun = useRef(false);
  const soundStarted = useRef(false);

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
      window.clearTimeout(showerTimer.current);
      window.clearTimeout(warm);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Pause every animation on pages that are off screen (see globals.css). One observer, no
  // React re-renders: it only flips an attribute when a page comes near or leaves the screen.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.toggleAttribute("data-offscreen", !e.isIntersecting);
      },
      // -2px: a page whose edge merely touches the screen's edge doesn't count as visible
      { rootMargin: "-2px 0px" },
    );
    document.querySelectorAll("main > section").forEach((section) => io.observe(section));
    return () => io.disconnect();
  }, []);

  // Lock scrolling while the gates are on screen.
  useEffect(() => {
    document.documentElement.classList.toggle("gate-locked", stage !== "open");
  }, [stage]);

  // Finger-down: make sure the bell is loading (iPhones only fetch audio after a touch).
  const prepare = useCallback(() => {
    if (wedding.chime) prepareAudio();
  }, []);

  /**
   * Finger down on the gate: the seal breaks and the doors start straight away. Everything
   * else waits a moment (the petal shower is created 350 ms later), so the first frame after
   * the touch stays light and the doors move instantly — even on slower phones.
   */
  const begin = useCallback(() => {
    if (begun.current) return;
    begun.current = true;
    setStage("opening");
    showerTimer.current = window.setTimeout(() => setShower(true), SHOWER_AFTER * 1000);
    timer.current = window.setTimeout(() => setStage("open"), GATE_TIMING.total * 1000);
  }, []);

  /** The completed tap: phones only allow sound from a finished tap, so the bell & song start here. */
  const open = useCallback(() => {
    begin();
    if (soundStarted.current) return;
    soundStarted.current = true;

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
  }, [begin]);

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
      {wedding.aekiBeki && <AekiBekiSection />}
      <RsvpSection />

      {stage !== "open" && <PalaceGate stage={stage} onBegin={begin} onOpen={open} onPrepare={prepare} />}

      {shower && !skipped && (
        <PetalShower
          count={48}
          seed={21}
          startDelay={0.9 - SHOWER_AFTER}
          spread={2.4}
          minDuration={4.5}
          maxDuration={7.5}
        />
      )}

      {musicOn && <MusicToggle audioRef={audioRef} />}
    </main>
  );
}
