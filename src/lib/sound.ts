/**
 * Sound helpers.
 *
 * The temple-bell chime is a small pre-rendered audio file (public/sounds/) played
 * with a plain <audio> element. That is deliberately NOT Web Audio: creating a Web
 * Audio context freezes the page for 100ms+ on many devices, and iPhones mute Web
 * Audio when the silent switch is on — whereas <audio> plays like any other media.
 */

let bell: HTMLAudioElement | null = null;

/** Start downloading the bell in the background (safe to call many times). */
export function prepareAudio() {
  if (bell || typeof window === "undefined") return;
  const audio = new Audio();
  const aac = audio.canPlayType('audio/mp4; codecs="mp4a.40.2"');
  audio.src = aac ? "/sounds/temple-bell.m4a" : "/sounds/temple-bell.wav";
  audio.preload = "auto";
  audio.volume = 0.85;
  audio.load();
  bell = audio;
}

/** Ring the temple bell (call from the tap that opens the gates). */
export function playTempleBell() {
  prepareAudio();
  if (!bell) return;
  try {
    bell.currentTime = 0;
  } catch {
    /* not loaded yet — it will simply start from the beginning */
  }
  bell.play().catch(() => {
    /* sound is a nice-to-have; never break the page for it */
  });
}

let music: HTMLAudioElement | null = null;

/**
 * Start buffering the background song (safe to call many times). It plays from
 * `start` seconds in, and loops back to that point when it ends.
 */
export function prepareMusic(src: string, start = 0) {
  if (music || !src || typeof window === "undefined") return music;
  const audio = new Audio();
  audio.src = src;
  audio.preload = "auto";
  const seek = () => {
    if (start > 0 && audio.currentTime < start) audio.currentTime = start;
  };
  audio.addEventListener("loadedmetadata", seek, { once: true });
  if (start > 0) {
    audio.addEventListener("ended", () => {
      audio.currentTime = start;
      audio.play().catch(() => {});
    });
  } else {
    audio.loop = true; // the browser's own loop has no gap
  }
  audio.load();
  music = audio;
  return audio;
}

/** Fade an <audio> element's volume in smoothly (iPhones ignore volume and play at full). */
export function fadeIn(audio: HTMLAudioElement, to = 0.6, ms = 3000) {
  audio.volume = 0;
  const steps = 30;
  let i = 0;
  const id = window.setInterval(() => {
    i++;
    audio.volume = Math.min(to, (to * i) / steps);
    if (i >= steps) window.clearInterval(id);
  }, ms / steps);
}
