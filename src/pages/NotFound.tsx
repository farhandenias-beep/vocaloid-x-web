import { motion } from "framer-motion";
import { Home, ScanLine } from "lucide-react";
import { Link } from "react-router";
import { LogoMark } from "@/components/vocaloid/logo-mark";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 text-center">
      <div className="vx-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-vx-red/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative flex flex-col items-center"
      >
        <LogoMark className="h-12 w-12 animate-vx-flicker" />

        <p className="vx-mono mt-8 text-[10px] tracking-[0.4em] text-vx-red">
          // SINYAL HILANG
        </p>
        <h1 className="mt-4 font-display text-7xl font-black tracking-tight text-rose-50 sm:text-8xl">
          <span className="vx-glow">404</span>
        </h1>
        <p className="vx-mono mt-3 max-w-md text-[11px] leading-relaxed tracking-[0.18em] text-muted-foreground">
          HALAMAN YANG ANDA CARI TIDAK TERDAFTAR DI SISTEM. PERIKSA KEMBALI
          ALAMAT ATAU KEMBALI KE MARKAS.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            className="vx-cut vx-mono gap-2 text-[11px] tracking-[0.22em]"
          >
            <Link to="/">
              <Home className="size-4" />
              KE BERANDA
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="vx-cut vx-mono border-vx-red/40 bg-transparent gap-2 text-[11px] tracking-[0.22em] text-rose-100 hover:bg-vx-red/10 hover:text-white"
          >
            <Link to="/status-order">
              <ScanLine className="size-4" />
              LACAK ORDER
            </Link>
          </Button>
        </div>

        <p className="vx-mono mt-10 text-[10px] tracking-[0.3em] text-vx-red/60">
          VOCALOID-X // CODE × DEMON × FUTURE
        </p>
      </motion.div>
    </div>
  );
}
