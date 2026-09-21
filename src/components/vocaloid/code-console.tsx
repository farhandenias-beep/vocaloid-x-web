import { HudPanel } from "@/components/vocaloid/hud";
import { motion } from "framer-motion";
import { X } from "lucide-react";

/** The `// VOCALOID-X.SYSTEM` code plate from the reference hero. */
export function CodeConsole({ className }: { className?: string }) {
  const key = "text-vx-red font-medium";
  const str = "text-[#ffb3c1]";
  const kw = "text-vx-ember";

  return (
    <HudPanel
      label="// VOCALOID-X.SYSTEM"
      className={className}
      right={
        <span className="text-vx-red/70">
          <X className="size-3.5" />
        </span>
      }
      bodyClassName="px-4 py-4"
    >
      <motion.pre
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="vx-mono vx-scanlines relative overflow-x-auto text-[11px] leading-5 text-rose-100/85 sm:text-xs"
      >
        <code className="block">
          <span className={kw}>const</span> <span className={key}>vision</span>
          {" = {"}
          {"\n  "}
          <span className={key}>name</span>: <span className={str}>"VOCALOID-X"</span>,
          {"\n  "}
          <span className={key}>type</span>: <span className={str}>"AI + HUMAN"</span>,
          {"\n  "}
          <span className={key}>status</span>: <span className={str}>"ONLINE"</span>,
          {"\n  "}
          <span className={key}>version</span>: <span className={str}>"1.0.0"</span>,
          {"\n  "}
          <span className={key}>future</span>: <span className={str}>"UNLIMITED"</span>,
          {"\n};"}
          {"\n\n"}
          <span className={kw}>while</span> (dreams) {"{"}
          {"\n  "}
          <span className="text-rose-200/90">create</span>();
          {"\n  "}
          <span className="text-rose-200/90">build</span>();
          {"\n  "}
          <span className="text-rose-200/90">improve</span>();
          {"\n}"}
          {"\n\n"}
          <span className="text-muted-foreground">
            // The journey has just begun...
          </span>
          <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-vx-caret bg-vx-red" />
        </code>
      </motion.pre>
    </HudPanel>
  );
}
