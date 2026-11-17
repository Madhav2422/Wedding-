import { memo } from "react";

/** Gold divider with a lotus in the middle. */
export const Flourish = memo(function Flourish({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 260 30" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="fl-l" x1="0" x2="1">
          <stop offset="0" stopColor="#b8862b" stopOpacity="0" />
          <stop offset="1" stopColor="#b8862b" />
        </linearGradient>
        <linearGradient id="fl-r" x1="0" x2="1">
          <stop offset="0" stopColor="#b8862b" />
          <stop offset="1" stopColor="#b8862b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M4 16 H98" stroke="url(#fl-l)" strokeWidth="1.2" />
      <path d="M162 16 H256" stroke="url(#fl-r)" strokeWidth="1.2" />
      <path d="M100 16 L106 12 L112 16 L106 20 Z" fill="#c8952e" />
      <path d="M148 16 L154 12 L160 16 L154 20 Z" fill="#c8952e" />
      <circle cx="119" cy="16" r="1.8" fill="#c8952e" />
      <circle cx="141" cy="16" r="1.8" fill="#c8952e" />
      {/* lotus */}
      <path d="M130 3 C136 9 136 18 130 24 C124 18 124 9 130 3 Z" fill="#b8862b" />
      <path d="M130 24 C121 22 116 15 115 9 C123 10 128 16 130 24 Z" fill="#d4a743" />
      <path d="M130 24 C139 22 144 15 145 9 C137 10 132 16 130 24 Z" fill="#d4a743" />
      <path d="M121 25 H139" stroke="#b8862b" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
});

/**
 * A thin double-lined palace arch around the invitation. It draws itself once the
 * guest has arrived (see `.settled .archPath` in Hero.module.css).
 */
export const ArchOutline = memo(function ArchOutline({
  className,
  pathClassName,
}: {
  className?: string;
  pathClassName?: string;
}) {
  const outer = "M3,160 V44 C3,25 30,13 46,6 Q49,4.5 50,1 Q51,4.5 54,6 C70,13 97,25 97,44 V160";
  const inner = "M6,160 V45.5 C6,28 31.5,16 46.8,9.6 Q49.2,8.4 50,5.5 Q50.8,8.4 53.2,9.6 C68.5,16 94,28 94,45.5 V160";

  return (
    <svg className={className} viewBox="0 0 100 160" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="arch-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c8952e" />
          <stop offset=".6" stopColor="#b8862b" stopOpacity=".7" />
          <stop offset="1" stopColor="#b8862b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className={pathClassName} d={outer} pathLength={1} fill="none" stroke="url(#arch-gold)" strokeWidth=".32" />
      <path
        className={pathClassName}
        d={inner}
        pathLength={1}
        fill="none"
        stroke="url(#arch-gold)"
        strokeWidth=".16"
        style={{ animationDelay: "0.25s" }}
      />
    </svg>
  );
});
