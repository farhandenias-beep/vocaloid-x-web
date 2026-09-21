import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** HUD plate with a notched corner, /// label header and CRT scanlines. */
export function HudPanel({
  label,
  right,
  children,
  className,
  bodyClassName,
  scanlines = true,
}: {
  label: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  scanlines?: boolean;
}) {
  return (
    <div className={cn("vx-panel vx-cut transition-colors", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-vx-red/20 px-3 py-2">
        <span className="vx-label">{label}</span>
        {right}
      </div>
      <div
        className={cn(
          "relative px-3 py-3",
          scanlines && "vx-scanlines",
          bodyClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** `// ABOUT VOCALOID-X` style eyebrow with the small red tick. */
export function SectionLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="h-3 w-1 bg-vx-red shadow-[0_0_12px_rgba(255,42,69,0.9)]" />
      <span className="vx-label">{children}</span>
    </span>
  );
}

/** Hexagon-framed icon used by the feature cards. */
export function HexIcon({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative flex h-12 w-12 items-center justify-center text-vx-red",
        className,
      )}
    >
      <span className="absolute inset-0 vx-hex border border-vx-red/45 bg-vx-red/10 shadow-[0_0_22px_-6px_rgba(255,42,69,0.9)]" />
      <span className="relative">{children}</span>
    </span>
  );
}

/** Segmented meter bar in the reference art's HUD style. */
export function MeterBar({
  value,
  className,
  tone = "red",
}: {
  value: number;
  className?: string;
  tone?: "red" | "ember";
}) {
  return (
    <span
      className={cn(
        "relative block h-2.5 w-full overflow-hidden rounded-sm border border-vx-red/25 bg-vx-blood/25",
        className,
      )}
    >
      <span
        className={cn(
          "block h-full transition-[width] duration-700 ease-out",
          tone === "red"
            ? "bg-gradient-to-r from-vx-crimson via-vx-red to-[#ff8093] shadow-[0_0_14px_rgba(255,42,69,0.85)]"
            : "bg-gradient-to-r from-[#7a2a06] via-vx-ember to-[#ffd0a8] shadow-[0_0_14px_rgba(255,122,61,0.75)]",
        )}
        style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
      />
    </span>
  );
}

/** Corner bracket frame that floats above a section. */
export function CornerBrackets({ className }: { className?: string }) {
  return (
    <span
      className={cn("pointer-events-none absolute inset-0", className)}
      aria-hidden="true"
    >
      <span className="absolute top-0 left-0 h-5 w-5 border-t-2 border-l-2 border-vx-red/60" />
      <span className="absolute top-0 right-0 h-5 w-5 border-t-2 border-r-2 border-vx-red/60" />
      <span className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-vx-red/60" />
      <span className="absolute right-0 bottom-0 h-5 w-5 border-b-2 border-r-2 border-vx-red/60" />
    </span>
  );
}
