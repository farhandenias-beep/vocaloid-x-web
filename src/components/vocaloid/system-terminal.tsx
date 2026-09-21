import { HudPanel } from "@/components/vocaloid/hud";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const BOOT_LOG = [
  "booting vocaloid-x kernel v1.0.0 ...",
  "mounting /dev/demon-core ............ ok",
  "loading neural weights (12.4M params)",
  "handshake with human operator ...... ok",
  "armoring fortress layer ............ ok",
  "realtime sync channel .............. online",
  "future-proofing runtime ............ engaged",
  "system ready. awaiting input _",
];

/** Terminal that replays a boot sequence on a loop. */
export function SystemTerminal({ className }: { className?: string }) {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const id = window.setInterval(() => {
      setCount((prev) => (prev >= BOOT_LOG.length ? 1 : prev + 1));
    }, 1200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <HudPanel
      label="// CORE.LOG"
      className={cn("h-full", className)}
      right={
        <span className="vx-mono text-[10px] text-muted-foreground">
          tail -f
        </span>
      }
      bodyClassName="h-full"
    >
      <div className="vx-mono space-y-1.5 text-[11px] leading-5 sm:text-xs">
        {BOOT_LOG.slice(0, count).map((line, index) => (
          <p key={line} className="flex gap-2">
            <span className="text-vx-red/70">
              [{String(index + 1).padStart(2, "0")}]
            </span>
            <span
              className={cn(
                index === count - 1
                  ? "text-rose-100"
                  : "text-muted-foreground",
              )}
            >
              {line}
            </span>
          </p>
        ))}
        <p className="flex gap-2">
          <span className="text-vx-red/70">[--]</span>
          <span className="inline-block h-3.5 w-1.5 animate-vx-caret bg-vx-red" />
        </p>
      </div>
    </HudPanel>
  );
}
