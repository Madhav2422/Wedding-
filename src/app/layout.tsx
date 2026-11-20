import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, Great_Vibes, Tiro_Devanagari_Hindi } from "next/font/google";
import { EARLY_TAP, GATE_TIMING } from "@/components/gate/timing";
import { wedding, weddingDate } from "@/config/wedding";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const script = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});
const devanagari = Tiro_Devanagari_Hindi({
  subsets: ["devanagari", "latin"],
  weight: "400",
  variable: "--font-deva",
  display: "swap",
});

const title = `${wedding.groom} & ${wedding.bride} · Wedding Invitation`;
const description = `You are warmly invited to celebrate the wedding of ${wedding.groom} & ${wedding.bride} on ${weddingDate.weekday}, ${weddingDate.day} ${weddingDate.month} ${weddingDate.year} · ${wedding.city}.`;
/** The line under the picture when the link is shared on WhatsApp & co. */
const shareDescription = `${weddingDate.weekday}, ${weddingDate.day} ${weddingDate.month} ${weddingDate.year} · ${wedding.city}. Tap to open the palace gates ✨`;

/*
 * The share picture itself is src/app/opengraph-image.tsx. On Vercel, Next.js gives it the
 * site's full address automatically (custom domain included), which WhatsApp needs.
 */
export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description: shareDescription,
    type: "website",
    siteName: `${wedding.groom} & ${wedding.bride}`,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title, description: shareDescription },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#3b0a12",
};

/*
 * Opens the palace gate the moment it is touched, even before the page's JavaScript has
 * arrived. On a slow phone or network that can take several seconds, and a tap in that time
 * used to do nothing. This tiny script runs as soon as the page starts loading: on the first
 * touch of the gate it adds `gate-go` to <html>, which starts the opening (pure CSS), and
 * Invitation.tsx takes over as soon as it is ready. If the JavaScript never arrives at all,
 * it removes the gate itself once the opening is over, so the invitation can still be read.
 * Written in plain old JavaScript on purpose, so it runs in every browser. (It also fills in
 * two basics that browsers older than Chrome 71 lack, which the page's scripts expect.)
 */
const earlyTap = `(function () {
  var w = window, d = document, h = d.documentElement;
  if (typeof globalThis === "undefined") w.globalThis = w;
  if (!w.queueMicrotask) w.queueMicrotask = function (f) { Promise.resolve().then(f); };
  function go(e) {
    if (w.__gateReady || w.__gateTap != null) return;
    var t = e.target;
    if (!t || !t.closest || !t.closest("[data-gate]")) return;
    if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
    if (e.button > 0) return;
    w.__gateTap = performance.now();
    h.classList.add("${EARLY_TAP.go}");
    setTimeout(function () {
      if (w.__gateReady) return;
      h.classList.add("${EARLY_TAP.gone}");
      h.classList.remove("gate-locked");
    }, ${GATE_TIMING.total * 1000});
  }
  ["pointerdown", "touchstart", "mousedown", "keydown"].forEach(function (type) {
    d.addEventListener(type, go, true);
  });
})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`gate-locked ${cinzel.variable} ${cormorant.variable} ${script.variable} ${devanagari.variable}`}
      // the early-tap script may add a class before React starts; that is expected
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: earlyTap }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
