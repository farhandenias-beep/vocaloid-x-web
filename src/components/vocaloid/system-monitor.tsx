import { HudPanel, MeterBar } from "@/components/vocaloid/hud";
import { useEffect, useMemo, useState } from "react";

type Metric = {
  key: string;
  label: string;
  base: number;
  data: number[];
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const seedSeries = (base: number, seed: number) =>
  Array.from({ length: 26 }, (_, i) =>
    clamp(base + Math.sin((i + seed) * 0.62) * 13 + (((i * seed) % 9) - 4), 8, 97),
  );

function Spark({ data }: { data: number[] }) {
  const points = useMemo(
    () =>
      data
        .map((value, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 27 - (value / 100) * 25;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" "),
    [data],
  );

  return (
    <svg
      viewBox="0 0 100 28"
      preserveAspectRatio="none"
      className="h-6 w-20 shrink-0 sm:w-24"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke="#ff2a45"
        strokeWidth="1.6"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
      <polyline
        points={points}
        fill="none"
        stroke="#ff9db0"
        strokeWidth="3"
        opacity="0.25"
        vectorEffect="non-scaling-stroke"
        filter="blur(2px)"
      />
    </svg>
  );
}

/** Live-looking CPU / GPU / RAM telemetry HUD. */
export function SystemMonitor({ className }: { className?: string }) {
  const [metrics, setMetrics] = useState<Metric[]>(() => [
    { key: "cpu", label: "CPU", base: 64, data: seedSeries(64, 1) },
    { key: "gpu", label: "GPU", base: 53, data: seedSeries(53, 3) },
    { key: "ram", label: "RAM", base: 58, data: seedSeries(58, 6) },
  ]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const t = Date.now();
      setMetrics((prev) =>
        prev.map((metric, index) => {
          const last = metric.data[metric.data.length - 1];
          const drift = Math.sin(t / (1100 + index * 320)) * 12;
          const next = Math.round(
            clamp(last * 0.7 + (metric.base + drift) * 0.3, 10, 97),
          );
          return { ...metric, data: [...metric.data.slice(1), next] };
        }),
      );
    }, 1500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <HudPanel
      label="// SYSTEM MONITOR"
      className={className}
      right={
        <span className="vx-mono text-[10px] text-vx-red/80">
          <span className="mr-1.5 inline-block size-1.5 animate-vx-pulse rounded-full bg-vx-red align-middle" />
          LIVE
        </span>
      }
      bodyClassName="space-y-2.5 px-3 py-3"
    >
      {metrics.map((metric) => {
        const value = metric.data[metric.data.length - 1];
        return (
          <div key={metric.key} className="flex items-center gap-2.5">
            <span className="vx-mono w-7 text-[10px] tracking-widest text-muted-foreground">
              {metric.label}
            </span>
            <MeterBar value={value} className="flex-1" />
            <span className="vx-mono w-8 text-right text-[10px] text-vx-red">
              {value}%
            </span>
            <Spark data={metric.data} />
          </div>
        );
      })}
    </HudPanel>
  );
}
