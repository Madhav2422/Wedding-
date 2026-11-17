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

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website" },
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
