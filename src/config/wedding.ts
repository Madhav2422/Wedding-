import { dateParts } from "@/lib/dates";

/**
 * ✏️  Edit everything about the invitation here.
 * Every page and animation reads from this one file.
 */

export type WeddingEvent = {
  id: string;
  /** Which animated scene to show: the henna hand, the dholak, or the sacred knot. */
  art: "mehendi" | "sangeet" | "wedding";
  name: string;
  /** The name in Hindi, shown above the English one. */
  deva: string;
  /** Small line above the name. */
  kicker: string;
  tagline: string;
  /** Start & end in India time (keep the +05:30 offset). */
  start: string;
  end: string;
  venue: string;
  /** Full address — the "Directions" button searches Google Maps for venue + address. */
  address: string;
  dressCode: string;
  highlights: readonly string[];
  /**
   * Optional: your own short clip of the couple (e.g. "/videos/mehendi.mp4" in /public).
   * When set, it plays inside the palace arch instead of the illustration.
   */
  video?: string;
  /**
   * Optional: a picture shown inside the palace arch instead of the animated scene (gently
   * animated). Put the file in /public/art. `focus` is which part stays in view when cropped
   * ("50% 30%" = centre, upper third); `credit` is the small caption under the arch.
   */
  image?: { src: string; alt: string; credit: string; focus?: string };
};

const events: readonly WeddingEvent[] = [
  {
    id: "mehendi",
    art: "mehendi",
    name: "Mehendi",
    deva: "मेहंदी",
    kicker: "The festivities begin",
    tagline: "An afternoon of henna, folk songs & laughter",
    start: "2026-12-10T16:00:00+05:30",
    end: "2026-12-10T20:00:00+05:30",
    venue: "Bagh-e-Mehtab Gardens",
    address: "Fateh Sagar Lake Road, Udaipur, Rajasthan 313001",
    dressCode: "Shades of green & marigold",
    highlights: ["Henna artists from 4 pm", "Chai, chaat & dhol"],
    video: "",
  },
  {
    id: "sangeet",
    art: "sangeet",
    name: "Sangeet",
    deva: "संगीत",
    kicker: "Let the music play",
    tagline: "A night of music, dance & dandiya",
    start: "2026-12-11T19:30:00+05:30",
    end: "2026-12-12T00:30:00+05:30",
    venue: "The Durbar Hall",
    address: "City Palace Complex, Old City, Udaipur, Rajasthan 313001",
    dressCode: "Indo-western glam",
    highlights: ["Family performances at 8 pm", "Dinner & DJ till late"],
    video: "",
  },
  {
    id: "wedding",
    art: "wedding",
    name: "The Wedding",
    deva: "शुभ विवाह",
    kicker: "The sacred union",
    tagline: "Seven vows by the sacred fire",
    start: "2026-12-12T19:00:00+05:30",
    end: "2026-12-12T23:30:00+05:30",
    venue: "The Lake Palace Lawns",
    address: "Lake Pichola, Old City, Udaipur, Rajasthan 313001",
    dressCode: "Royal traditional",
    highlights: ["Baraat 7 pm", "Varmala 8:30 pm", "Pheras 9:30 pm"],
    video: "",
  },
];

export const wedding = {
  groom: "Rohan",
  bride: "Priya",
  /** The city everything happens in. */
  city: "Udaipur, Rajasthan",

  /** Page 1 */
  invocation: "॥ श्री गणेशाय नमः ॥",
  tagline: "are getting married",
  /** Written on the palace gate above the doors. */
  gateTitle: "॥ शुभ विवाह ॥",

  /** Page 2 — "We invite you" */
  blessing: "With the blessings of our elders",
  /** The family sending the invitation (the groom's parents). */
  hosts: "Mr. & Mrs. Ramesh Sharma",
  inviteLine: "request the honour of your presence at the wedding of their son",
  /** Shown under the bride's name. */
  brideFamily: "daughter of Mr. & Mrs. Suresh Mehta",
  closingLine: "Your presence and blessings will make our celebration complete.",

  /**
   * The celebrations, in order — each gets its own animated page.
   * The one with id "wedding" drives the countdown and the scratch-the-heart date.
   */
  events,

  /** The last page: guests tell you how many are coming, so no food goes to waste. */
  rsvp: {
    /** "Kindly respond by …" */
    respondBy: "2026-11-25T23:59:00+05:30",
    /**
     * WhatsApp number that receives the replies: country code + number, digits only,
     * e.g. "919876543210". Leave empty while testing.
     */
    whatsapp: "",
    /** Optional: a Google Sheet web-app link that collects every reply (see README). */
    sheetUrl: "",
    maxGuests: 10,
  },

  hashtag: "#RohanWedsPriya",
  signOff: "With love, the Sharma family",

  /** Play a soft temple-bell chime when the gates open. */
  chime: true,
  /**
   * Background song — starts on the tap that opens the gates, with a small music button.
   * Put the file in /public/music (mp3 or m4a) and keep this path in sync with its name.
   * Leave empty ("") for no music.
   */
  music: "/music/vachindamma.m4a",
  /** Start the song this many seconds in (e.g. 30 to begin at your favourite line). */
  musicStart: 0,
} as const;

/** The wedding ceremony itself. */
export const weddingEvent = events.find((e) => e.id === "wedding") ?? events[events.length - 1];

/** Wedding date pieces, always in Indian time. */
export const weddingDate = dateParts(weddingEvent.start);

export const initials = {
  groom: wedding.groom.trim().charAt(0).toUpperCase(),
  bride: wedding.bride.trim().charAt(0).toUpperCase(),
};
