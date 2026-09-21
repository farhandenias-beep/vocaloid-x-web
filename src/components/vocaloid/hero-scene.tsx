import { cn } from "@/lib/utils";
import { useState } from "react";

const rnd = (i: number) => {
  const v = Math.sin(i * 12.9898) * 43758.5453;
  return v - Math.floor(v);
};

const SPIRES = Array.from({ length: 12 }, (_, i) => ({
  x: i * 128 - 40,
  width: 72 + rnd(i + 1) * 96,
  height: 140 + rnd(i + 21) * 270,
}));

const EMBERS = Array.from({ length: 28 }, (_, i) => ({
  cx: rnd(i + 3) * 1440,
  cy: 90 + rnd(i + 33) * 680,
  r: 0.9 + rnd(i + 63) * 2.2,
  delay: rnd(i + 91) * 9,
  duration: 9 + rnd(i + 111) * 11,
}));

/**
 * Layered cyber-cathedral backdrop: blood moon, ruined spires, lightning and
 * drifting embers. If `public/vocaloid-x-hero.png` exists it is composited on
 * top as the character artwork slot.
 */
export function HeroScene({ className }: { className?: string }) {
  const [hasArtwork, setHasArtwork] = useState(true);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="vx-sky" cx="70%" cy="22%" r="80%">
            <stop offset="0%" stopColor="#6b0215" />
            <stop offset="42%" stopColor="#250309" />
            <stop offset="100%" stopColor="#050407" />
          </radialGradient>
          <radialGradient id="vx-moon" cx="48%" cy="46%" r="52%">
            <stop offset="0%" stopColor="#ff6d81" stopOpacity="0.95" />
            <stop offset="52%" stopColor="#c1122c" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#40020e" stopOpacity="0.12" />
          </radialGradient>
          <linearGradient id="vx-spire" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34060f" />
            <stop offset="100%" stopColor="#08050b" />
          </linearGradient>
          <filter id="vx-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="34" />
          </filter>
          <filter id="vx-bolt" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        <rect width="1440" height="900" fill="url(#vx-sky)" />

        {/* blood moon */}
        <circle
          cx="1010"
          cy="215"
          r="230"
          fill="#ff2a45"
          opacity="0.2"
          filter="url(#vx-soft)"
        />
        <circle cx="1010" cy="215" r="148" fill="url(#vx-moon)" />
        <circle
          cx="1010"
          cy="215"
          r="148"
          fill="none"
          stroke="#ff8093"
          strokeOpacity="0.35"
          strokeWidth="1"
        />

        {/* lightning */}
        <g
          stroke="#ff2a45"
          strokeWidth="2.2"
          fill="none"
          filter="url(#vx-bolt)"
          className="animate-vx-flicker"
        >
          <path d="M300 0 L286 170 L318 168 L262 392 L296 380 L232 640" opacity="0.75" />
          <path d="M1180 0 L1206 150 L1172 158 L1236 360 L1200 356 L1268 560" opacity="0.5" />
          <path d="M760 0 L742 120 L776 128 L720 300" opacity="0.35" />
        </g>

        {/* ruined spires */}
        <g fill="url(#vx-spire)" stroke="rgba(255,42,69,0.4)" strokeWidth="1.1">
          {SPIRES.map((spire, index) => {
            const top = 900 - spire.height;
            const tip = top - 74;
            const mid = spire.x + spire.width / 2;
            return (
              <path
                key={index}
                d={`M${spire.x} 900 L${spire.x} ${top} L${mid} ${tip} L${spire.x + spire.width} ${top} L${spire.x + spire.width} 900 Z`}
                opacity={0.9}
              />
            );
          })}
        </g>

        {/* ground glow */}
        <ellipse cx="720" cy="900" rx="620" ry="120" fill="#ff2a45" opacity="0.16" filter="url(#vx-soft)" />

        {/* embers */}
        <g fill="#ff6a7c">
          {EMBERS.map((ember, index) => (
            <circle
              key={index}
              cx={ember.cx}
              cy={ember.cy}
              r={ember.r}
              opacity={0.55}
              style={{
                animation: `vx-drift ${ember.duration}s linear ${ember.delay}s infinite`,
              }}
            />
          ))}
        </g>
      </svg>

      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_85%_at_50%_10%,transparent_20%,rgba(5,4,7,0.72)_65%,#050407_100%)]" />

      {/* character artwork slot — drop your own art at public/vocaloid-x-hero.png */}
      {hasArtwork && (
        <img
          src="/vocaloid-x-hero.png"
          alt=""
          onError={() => setHasArtwork(false)}
          className="absolute bottom-0 left-[56%] h-[94%] max-w-none -translate-x-1/2 object-contain opacity-95 drop-shadow-[0_0_70px_rgba(255,42,69,0.4)] [mask-image:radial-gradient(115%_100%_at_50%_38%,#000_58%,transparent_92%)] select-none"
        />
      )}
    </div>
  );
}
