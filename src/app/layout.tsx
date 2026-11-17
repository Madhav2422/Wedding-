import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, Great_Vibes, Tiro_Devanagari_Hindi } from "next/font/google";
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`gate-locked ${cinzel.variable} ${cormorant.variable} ${script.variable} ${devanagari.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
