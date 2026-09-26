import { HexIcon, HudPanel, SectionLabel } from "@/components/vocaloid/hud";
import { LogoLockup } from "@/components/vocaloid/logo-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { ORDER_INTRO, WHATSAPP_LABEL, whatsappUrl } from "@/lib/brand";
import { formatIDR } from "@/lib/products";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import {
  ArrowLeft,
  CircleCheck,
  Clock,
  Loader2,
  MessageCircle,
  ScanLine,
  SearchX,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";

function StatusBadge({ status }: { status: "new" | "done" }) {
  const done = status === "done";
  return (
    <span
      className={cn(
        "vx-mono inline-flex items-center gap-2 rounded-sm border px-3 py-1 text-[10px] tracking-[0.24em]",
        done
          ? "border-[#4ade80]/40 bg-[#4ade80]/10 text-[#7dffb0]"
          : "border-vx-red/40 bg-vx-red/10 text-vx-red",
      )}
    >
      {done ? <CircleCheck className="size-3.5" /> : <Clock className="size-3.5" />}
      {done ? "SELESAI / TERKIRIM" : "SEDANG DIPROSES"}
    </span>
  );
}

export default function OrderStatusPage() {
  const [params] = useSearchParams();
  const [codeInput, setCodeInput] = useState(params.get("kode") ?? "");
  const [trackedCode, setTrackedCode] = useState("");
  const [isTracked, setIsTracked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const result = useQuery(
    api.orders.publicStatus,
    isTracked && trackedCode ? { code: trackedCode } : "skip",
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = codeInput.trim().toUpperCase();
    setError(null);
    if (!code) {
      setError("Masukkan kode order dulu.");
      return;
    }
    setTrackedCode(code);
    setIsTracked(true);
  };

  // Kode lewat URL (?kode=VX-XXXX) langsung dilacak saat halaman dibuka.
  useEffect(() => {
    const urlCode = params.get("kode");
    if (urlCode) {
      setTrackedCode(urlCode.trim().toUpperCase());
      setIsTracked(true);
    }
  }, [params]);

  return (
    <div className="relative min-h-screen bg-background">
      <div className="vx-grid pointer-events-none fixed inset-0 opacity-25" />

      <header className="sticky top-0 z-40 border-b border-vx-red/20 bg-[#07040a]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1100px] items-center gap-4 px-5 sm:px-8">
          <Link to="/" className="shrink-0">
            <LogoLockup markClassName="h-7 w-7" className="[&_span]:text-base" />
          </Link>
          <span className="vx-label hidden sm:inline">// LACAK ORDER</span>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="vx-cut vx-mono ml-auto border-vx-red/35 bg-transparent gap-2 text-[10px] tracking-[0.18em] text-rose-100 hover:bg-vx-red/10 hover:text-white"
          >
            <Link to="/">
              <ArrowLeft className="size-3.5" />
              KEMBALI KE TOKO
            </Link>
          </Button>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-vx-red/60 to-transparent" />
      </header>

      <main className="relative mx-auto w-full max-w-[1100px] px-5 py-14 sm:px-8">
        <SectionLabel>// CEK STATUS ORDER</SectionLabel>
        <h1 className="mt-4 font-display text-3xl font-black uppercase sm:text-4xl">
          LACAK <span className="vx-glow text-vx-red">PESANAN ANDA</span>
        </h1>
        <p className="vx-mono mt-3 max-w-xl text-[11px] leading-5 text-muted-foreground">
          Masukkan kode order yang muncul setelah Anda kirim form checkout
          (contoh: VX-8KQ2). Status diperbarui realtime oleh admin toko.
        </p>

        <div className="mt-9 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <HudPanel label="// INPUT KODE" bodyClassName="p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block space-y-2">
                  <span className="vx-label block">// KODE ORDER</span>
                  <Input
                    value={codeInput}
                    onChange={(event) =>
                      setCodeInput(event.target.value.toUpperCase())
                    }
                    placeholder="VX-XXXX"
                    maxLength={12}
                    className="vx-mono vx-cut-sm h-12 border-vx-red/25 bg-[#0a0509] text-center text-base font-bold tracking-[0.24em] uppercase placeholder:text-muted-foreground/40 focus-visible:border-vx-red/70"
                  />
                </label>
                {error && (
                  <p className="vx-mono border border-vx-red/40 bg-vx-red/10 px-3 py-2 text-[11px] text-rose-200">
                    ERROR // {error}
                  </p>
                )}
                <Button
                  type="submit"
                  className="vx-cut vx-mono w-full gap-2 text-[11px] tracking-[0.22em]"
                >
                  <ScanLine className="size-4" />
                  LACAK SEKARANG
                </Button>
              </form>

              <p className="vx-mono mt-5 border-t border-vx-red/15 pt-4 text-[10px] leading-5 text-muted-foreground">
                Kehilangan kode order? Chat admin dengan menyertakan nama dan
                paket yang dibeli — order Anda akan dicari manual.
              </p>
              <Button
                asChild
                variant="outline"
                className="vx-cut vx-mono mt-3 w-full gap-2 border-vx-red/35 bg-transparent text-[10px] tracking-[0.18em] text-rose-100 hover:bg-vx-red/10 hover:text-white"
              >
                <a
                  href={whatsappUrl(
                    `${ORDER_INTRO}, saya lupa kode order. Nama saya: `,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-3.5" />
                  TANYA ADMIN ({WHATSAPP_LABEL})
                </a>
              </Button>
            </HudPanel>
          </div>

          <div className="lg:col-span-7">
            <HudPanel label="// HASIL PELACAKAN" bodyClassName="p-5">
              {!isTracked ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <HexIcon className="h-14 w-14">
                    <ScanLine className="size-6" />
                  </HexIcon>
                  <p className="vx-mono text-[11px] leading-5 text-muted-foreground">
                    Masukkan kode order di panel kiri untuk melihat status
                    pesanan Anda.
                  </p>
                </div>
              ) : result === undefined ? (
                <div className="flex items-center gap-2 py-10 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  <span className="vx-mono text-[11px]">
                    MEMERIKSA {trackedCode}...
                  </span>
                </div>
              ) : result === null ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <SearchX className="size-8 text-vx-red" />
                  <p className="vx-mono text-[11px] leading-5 text-rose-200">
                    Kode <span className="font-bold">{trackedCode}</span> tidak
                    ditemukan.
                  </p>
                  <p className="vx-mono text-[10px] leading-5 text-muted-foreground">
                    Periksa lagi kodenya, atau chat admin untuk bantuan.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="vx-label">// KODE ORDER</p>
                      <p className="vx-mono mt-1 text-xl font-bold tracking-[0.16em] text-vx-red">
                        {result.orderCode}
                      </p>
                    </div>
                    <StatusBadge status={result.status} />
                  </div>

                  <div className="grid gap-3 border-t border-vx-red/15 pt-4 sm:grid-cols-2">
                    <div>
                      <p className="vx-label">// PAKET</p>
                      <p className="vx-mono mt-1 text-[12px] text-rose-100">
                        {result.productName}
                      </p>
                    </div>
                    <div>
                      <p className="vx-label">// TOTAL</p>
                      <p className="vx-mono mt-1 text-[12px] font-bold text-vx-red">
                        {formatIDR(result.price)}
                      </p>
                    </div>
                    <div>
                      <p className="vx-label">// DIBUAT</p>
                      <p className="vx-mono mt-1 text-[12px] text-rose-100/85">
                        {new Date(result.createdAt).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  <div className="vx-cut-sm border border-vx-red/20 bg-vx-red/5 px-4 py-3">
                    <p className="vx-mono text-[10px] leading-5 text-muted-foreground">
                      {result.status === "new"
                        ? "Order Anda sedang diantrian. Setelah pembayaran diverifikasi, file & panduan dikirim ke WhatsApp Anda (±5 menit)."
                        : "Order selesai dikirim. Kalau ada kendala instalasi, chat admin — garansi reset tetap aktif."}
                    </p>
                  </div>
                </div>
              )}
            </HudPanel>
          </div>
        </div>
      </main>
    </div>
  );
}
