import { HudPanel } from "@/components/vocaloid/hud";
import { motion } from "framer-motion";
import { X } from "lucide-react";

/** The `// VOCALOID-X.STORE` config plate from the hero. */
export function CodeConsole({ className }: { className?: string }) {
  const key = "text-vx-red font-medium";
  const str = "text-[#ffb3c1]";
  const kw = "text-vx-ember";

  return (
    <HudPanel
      label="// VOCALOID-X.STORE"
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
          <span className={kw}>const</span> <span className={key}>store</span>
          {" = {"}
          {"\n  "}
          <span className={key}>brand</span>: <span className={str}>"VOCALOID-X"</span>,
          {"\n  "}
          <span className={key}>produk</span>: [<span className={str}>"CHEAT PC"</span>,{" "}
          <span className={str}>"SETTING EMULATOR"</span>],
          {"\n  "}
          <span className={key}>update</span>: <span className={str}>"SETIAP PATCH"</span>,
          {"\n  "}
          <span className={key}>checkout</span>: <span className={str}>"WHATSAPP"</span>,
          {"\n  "}
          <span className={key}>garansi</span>: <span className={str}>"RESET GRATIS"</span>,
          {"\n  "}
          <span className={key}>status</span>: <span className={str}>"OPEN ORDER"</span>,
          {"\n};"}
          {"\n\n"}
          <span className={kw}>function</span> <span className={key}>order</span>(paket) {"{"}
          {"\n  "}
          <span className="text-rose-200/90">chat</span>(admin, paket);
          {"\n  "}
          <span className="text-rose-200/90">bayar</span>();
          {"\n  "}
          <span className="text-rose-200/90">kirim</span>();
          {"\n}"}
          {"\n\n"}
          <span className="text-muted-foreground">
            // update signature tiap hari, aman dipakai push rank
          </span>
          <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-vx-caret bg-vx-red" />
        </code>
      </motion.pre>
    </HudPanel>
  );
}
