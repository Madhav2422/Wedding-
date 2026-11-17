import Image from "next/image";
import { memo, type CSSProperties } from "react";
import type { WeddingEvent } from "@/config/wedding";
import { seeded } from "@/lib/random";
import { n } from "@/lib/svg";
import s from "./scenes.module.css";

type Art = WeddingEvent["art"];

/** Petals, sparkles or embers drifting over the painting, by celebration. */
function particles(art: Art) {
  const rnd = seeded(art === "mehendi" ? 7 : art === "sangeet" ? 19 : 31);
  return Array.from({ length: 10 }, (_, i) => ({
    left: `${n(4 + rnd() * 92)}%`,
    top: `${n(8 + rnd() * 70)}%`,
    "--s": `${n(art === "wedding" ? 2 + rnd() * 2.5 : 6 + rnd() * 6)}px`,
    "--drift": `${n((rnd() - 0.5) * 50)}px`,
    animationDuration: `${n(art === "sangeet" ? 1.8 + rnd() * 2 : 6 + rnd() * 6)}s`,
    animationDelay: `${n(-rnd() * 10)}s`,
    background: art === "mehendi" ? (i % 3 === 0 ? "#3f7a35" : i % 3 === 1 ? "#f59e0b" : "#ef6c8f") : undefined,
  })) as CSSProperties[];
}

const MOTES: Record<Art, CSSProperties[]> = {
  mehendi: particles("mehendi"),
  sangeet: particles("sangeet"),
  wedding: particles("wedding"),
};

/**
 * A painting inside the palace arch, made to feel alive: a slow cinematic push-in,
 * a band of golden light that sweeps across now and then, a soft vignette, and the
 * celebration's own petals, sparkles or embers. Everything moves on the GPU.
 */
function Painting({ image, art, active }: { image: NonNullable<WeddingEvent["image"]>; art: Art; active: boolean }) {
  const motes = MOTES[art];
  return (
    <div className={`${s.scene} ${s.painting} ${active ? s.on : ""}`}>
      <div className={s.kenburns}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 900px) 540px, 74vw"
          style={{ objectFit: "cover", objectPosition: image.focus ?? "50% 40%" }}
        />
      </div>
      <div className={s.sheen} aria-hidden="true" />
      <div className={s.vignette} aria-hidden="true" />

      {art === "mehendi" && (
        <div className={s.leaves} aria-hidden="true">
          {motes.map((style, i) => (
            <span key={i} className={s.leaf} style={{ ...style, top: "-4%" }} />
          ))}
        </div>
      )}
      {art === "sangeet" && (
        <div className={s.glitter} aria-hidden="true">
          {motes.map((style, i) => (
            <span key={i} style={style} />
          ))}
        </div>
      )}
      {art === "wedding" && (
        <div className={s.embers} aria-hidden="true">
          {motes.map((style, i) => (
            <span key={i} style={{ ...style, top: "auto" }} />
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(Painting);
