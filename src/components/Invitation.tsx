"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { wedding } from "@/config/wedding";
import { fadeIn, playTempleBell, prepareAudio, prepareMusic } from "@/lib/sound";
import MusicToggle from "./effects/MusicToggle";
import PetalShower from "./effects/PetalShower";
import SafeSection from "./SafeSection";
import PalaceGate from "./gate/PalaceGate";
import { GATE_TIMING } from "./gate/timing";
import Hero from "./hero/Hero";
import AekiBekiSection from "./sections/AekiBekiSection";
import CountdownSection from "./sections/CountdownSection";
import EventSection from "./sections/EventSection";
import InviteSection from "./sections/InviteSection";
import RsvpSection from "./sections/RsvpSection";
import ScratchSection from "./sections/ScratchSection";

/** Hidden test panel (?debug) — only downloaded when asked for. */
const DebugPanel = dynamic(() => import("./DebugPanel"), { ssr: false });

type Stage = "closed" | "opening" | "open";

/** Left on `window` by the early-tap script in app/layout.tsx. */
type EarlyTapWindow = Window & { __gateReady?: boolean; __gateReadyAt?: number; __gateTap?: number };

const MUSIC: string = wedding.music;
const MUSIC_START: number = wedding.musicStart;
/** Seconds after the tap when the petal shower is created… */
const SHOWER_AFTER = 0.35;
/** …and when its first petals fall. */
const PETALS_AT = 0.9;
/** Phone test (?nosound): leave all sound out, to rule it out as the cause of a problem. */
const soundOff = () => new URLSearchParams(window.location.search).has("nosound");

/**
 * The landing experience:
 *   closed  → palace gates shown, waiting for a tap
 *   opening → seal breaks, doors swing, we walk through the arch
 *   open    → gates removed, invitation is fully interactive
 *
 * Tip: add ?skipIntro to the URL to jump straight to the invitation while designing.
 * Testing a phone: ?debug shows what it does (see DebugPanel); &nosound leaves out the sound.
 */
export default function Invitation() {
  const [stage, setStage] = useState<Stage>("closed");
  const [skipped, setSkipped] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [debug, setDebug] = useState(false);
  /** Delay (s) before the petal shower's first petals; null = no shower yet. */
  const [shower, setShower] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoPaused = useRef(false);
  /** When the gate was tapped (performance.now() time); null until then. */
  const tappedAt = useRef<number | null>(null);
  const soundStarted = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("debug")) setDebug(true);
    if (params.has("skipIntro")) {
      setSkipped(true);
      setStage("open");
    }
    // quietly download the bell (and the song) once the page has settled, so the tap is instant
    const warm = window.setTimeout(() => {
      if (soundOff()) return;
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
      window.clearTimeout(warm);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Pause every animation on pages that are off screen (see globals.css). One observer, no
  // React re-renders: it only flips an attribute when a page comes near or leaves the screen.
  useEffect(() => {
    if (typeof IntersectionObserver !== "function") return; // very old browser: animate everything
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.removeAttribute("data-offscreen");
          else e.target.setAttribute("data-offscreen", "");
        }
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
    if (wedding.chime && !soundOff()) prepareAudio();
  }, []);

  /**
   * Finger down on the gate: the seal breaks and the doors start straight away. Everything
   * else waits a moment (the petal shower is created 350 ms later), so the first frame after
   * the touch stays light and the doors move instantly — even on slower phones.
   *
   * The doors themselves were already set off by the early-tap script in app/layout.tsx, at
   * the very first touch (`__gateTap`); this times everything else from that same moment.
   */
  const begin = useCallback(() => {
    if (tappedAt.current !== null) return;
    tappedAt.current = (window as EarlyTapWindow).__gateTap ?? performance.now();
    setStage("opening");
  }, []);

  // The rest of the opening, timed from the tap itself: the petal shower, then the gate leaves.
  useEffect(() => {
    if (stage !== "opening" || tappedAt.current === null) return;
    const elapsed = (performance.now() - tappedAt.current) / 1000;
    const petalsIn = Math.max(0, PETALS_AT - Math.max(elapsed, SHOWER_AFTER));
    const showerTimer = window.setTimeout(() => setShower(petalsIn), Math.max(0, SHOWER_AFTER - elapsed) * 1000);
    const openTimer = window.setTimeout(() => setStage("open"), Math.max(0, GATE_TIMING.total - elapsed) * 1000);
    return () => {
      window.clearTimeout(showerTimer);
      window.clearTimeout(openTimer);
    };
  }, [stage]);

  /** The bell (only right after the tap) and the song. */
  const startSound = useCallback((elapsed = 0) => {
    if (soundStarted.current) return;
    soundStarted.current = true;
    if (soundOff()) return;

    if (wedding.chime && elapsed < 1.5) playTempleBell();
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
  }, []);

  /** The completed tap: phones only allow sound from a finished tap, so the bell & song start here. */
  const open = useCallback(() => {
    begin();
    startSound();
  }, [begin, startSound]);

  // React is ready. If the guest tapped while the page was still loading, the early-tap script
  // (app/layout.tsx) has already started the opening: catch up with it.
  useEffect(() => {
    const w = window as EarlyTapWindow;
    w.__gateReady = true;
    w.__gateReadyAt = performance.now();
    if (w.__gateTap == null) return;
    begin();
    startSound((performance.now() - w.__gateTap) / 1000); // Android allows it after a tap; iPhones may not — fine
  }, [begin, startSound]);

  return (
    <main>
      <SafeSection>
        <Hero
          revealed={stage !== "closed"}
          settled={stage === "open"}
          delay={skipped ? 0 : GATE_TIMING.zoom}
          approach={GATE_TIMING.zoomDuration}
        />
      </SafeSection>
      {/* The pages, revealed one by one as the guest scrolls */}
      <SafeSection>
        <InviteSection />
      </SafeSection>
      <SafeSection>
        <ScratchSection />
      </SafeSection>
      <SafeSection>
        <CountdownSection />
      </SafeSection>
      {wedding.events.map((event, i) => (
        <SafeSection key={event.id}>
          <EventSection event={event} index={i} />
        </SafeSection>
      ))}
      {wedding.aekiBeki && (
        <SafeSection>
          <AekiBekiSection />
        </SafeSection>
      )}
      <SafeSection>
        <RsvpSection />
      </SafeSection>

      {stage !== "open" && <PalaceGate stage={stage} onBegin={begin} onOpen={open} onPrepare={prepare} />}

      {shower !== null && !skipped && (
        <PetalShower
          count={48}
          seed={21}
          startDelay={shower}
          spread={2.4}
          minDuration={4.5}
          maxDuration={7.5}
        />
      )}

      {musicOn && <MusicToggle audioRef={audioRef} />}
      {debug && <DebugPanel />}
    </main>
  );
}
