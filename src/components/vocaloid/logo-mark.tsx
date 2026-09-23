import { cn } from "@/lib/utils";
import { useId, useState } from "react";

/**
 * Drop your own artwork at `public/vocaloid-x-logo.png` and it replaces the
 * SVG sigil everywhere (top bar, rail, footer, console). Falls back to the
 * built-in sigil while the file is missing.
 */
const CUSTOM_LOGO_SRC = "/vocaloid-x-logo.png";

/** VOCALOID-X sigil: eight-point demon star above a cross (built-in fallback). */
export function LogoMark({ className }: { className?: string }) {
  const rawId = useId();
  const id = `vx-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const [hasCustom, setHasCustom] = useState(true);

  if (hasCustom) {
    return (
      <img
        src={CUSTOM_LOGO_SRC}
        alt=""
        aria-hidden="true"
        onError={() => setHasCustom(false)}
        className={cn(
          "h-8 w-8 shrink-0 object-contain select-none drop-shadow-[0_0_10px_rgba(255,42,69,0.45)]",
          className,
        )}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("h-8 w-8", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-mark`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff6a7c" />
          <stop offset="45%" stopColor="#ff2a45" />
          <stop offset="100%" stopColor="#7d0619" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.6" />
        </filter>
      </defs>
      <path
        d="M32 1 L35.4 14.7 L47.6 7.4 L40.3 19.6 L54 23 L40.3 26.4 L47.6 38.6 L35.4 31.3 L32 45 L28.6 31.3 L16.4 38.6 L23.7 26.4 L10 23 L23.7 19.6 L16.4 7.4 L28.6 14.7 Z"
        fill={`url(#${id}-mark)`}
        filter={`url(#${id}-blur)`}
        opacity="0.75"
      />
      <path
        d="M32 1 L35.4 14.7 L47.6 7.4 L40.3 19.6 L54 23 L40.3 26.4 L47.6 38.6 L35.4 31.3 L32 45 L28.6 31.3 L16.4 38.6 L23.7 26.4 L10 23 L23.7 19.6 L16.4 7.4 L28.6 14.7 Z"
        fill={`url(#${id}-mark)`}
      />
      <path
        d="M29.5 47 h5 v4.5 h5 v5 h-5 V64 h-5 v-7.5 h-5 v-5 h5 z"
        fill={`url(#${id}-mark)`}
      />
    </svg>
  );
}

export function LogoLockup({
  className,
  markClassName,
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className={cn("h-8 w-8", markClassName)} />
      <span className="font-display text-lg leading-none font-extrabold tracking-[0.14em] text-foreground">
        VOCALOID
        <span className="text-vx-red vx-glow-soft">-X</span>
      </span>
    </span>
  );
}
