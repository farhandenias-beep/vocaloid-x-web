import { CodeConsole } from "@/components/vocaloid/code-console";
import { HeroScene } from "@/components/vocaloid/hero-scene";
import {
  CornerBrackets,
  HexIcon,
  HudPanel,
  MeterBar,
  SectionLabel,
} from "@/components/vocaloid/hud";
import {
  SideRail,
  SiteFooter,
  SiteNav,
} from "@/components/vocaloid/site-chrome";
import { SystemMonitor } from "@/components/vocaloid/system-monitor";
import { SystemTerminal } from "@/components/vocaloid/system-terminal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useActiveSection, scrollToSection } from "@/hooks/use-active-section";
import {
  OPERATIONAL_HOURS,
  ORDER_INTRO,
  STORE_CITY,
  WHATSAPP_LABEL,
  whatsappUrl,
} from "@/lib/brand";
import {
  DEFAULT_PRODUCTS,
  PRODUCT_STATUS_LABEL,
  PRODUCT_STATUS_STYLES,
  customOrderMessage,
  discountPercent,
  formatIDR,
  productOrderMessage,
  type ProductStatus,
  type StoreProduct,
} from "@/lib/products";
import { api } from "@/convex/_generated/api";
import { cn, formatConvexError } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  Activity,
  BadgeCheck,
  Check,
  ChevronDown,
  Clock,
  Flame,
  Headset,
  Loader2,
  Lock,
  MapPin,
  MessageCircle,
  MessageSquareQuote,
  Package,
  ScanLine,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Terminal,
  Ticket,
  TicketPercent,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

const SECTION_IDS = [
  "home",
  "produk",
  "keunggulan",
  "testimoni",
  "cara-order",
  "faq",
  "order",
];

const reveal = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

const PILLARS: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "ANTI-BANNED",
    description:
      "Signature dibuat ulang setiap patch game, jadi akun utama tetap lebih aman saat dipakai push rank.",
    icon: ShieldCheck,
  },
  {
    title: "UPDATE CEPAT",
    description:
      "Maintenance Free Fire selesai, build baru langsung dirilis di hari yang sama.",
    icon: Zap,
  },
  {
    title: "SUPPORT 24 JAM",
    description:
      "Ada kendala instalasi atau config? Chat WhatsApp dibalas langsung oleh admin asli.",
    icon: Headset,
  },
  {
    title: "GARANSI RESET",
    description:
      "Kalau paket bermasalah setelah update game, kami reset atau ganti tanpa biaya tambahan.",
    icon: BadgeCheck,
  },
];

const ORDER_STEPS: { step: string; title: string; detail: string }[] = [
  {
    step: "01",
    title: "PILIH PAKET",
    detail:
      "Tentukan paket cheat atau setingan emulator yang paling cocok dengan kebutuhan rank Anda.",
  },
  {
    step: "02",
    title: "CHAT WHATSAPP",
    detail:
      "Tekan tombol order — rincian paket otomatis terkirim ke WhatsApp admin, tidak perlu ketik ulang.",
  },
  {
    step: "03",
    title: "BAYAR",
    detail:
      "Transfer bank, e-wallet, atau QRIS. Kirim bukti pembayaran ke chat yang sama.",
  },
  {
    step: "04",
    title: "LANGSUNG DIPAKAI",
    detail:
      "File, loader, dan panduan instalasi dikirim setelah pembayaran diverifikasi (±5 menit).",
  },
];

const FALLBACK_PAYMENTS = [
  "BCA",
  "DANA",
  "GOPAY",
  "OVO",
  "SHOPEEPAY",
  "QRIS",
];

// FAQ dummy dihapus — section hanya tampil setelah owner mengisi FAQ asli via console (FaqManager).

function Hero() {
  return (
    <section
      id="home"
      className="relative isolate flex min-h-[100svh] scroll-mt-20 flex-col justify-center overflow-hidden pt-16"
    >
      <HeroScene />
      <div className="vx-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

      <div className="relative mx-auto w-full max-w-[1600px] px-5 py-14 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-10 xl:grid-cols-12">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
            }}
            className="xl:col-span-6"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, x: -18 },
                show: { opacity: 1, x: 0 },
              }}
              className="vx-cut-sm inline-flex items-center gap-2 border border-vx-red/35 bg-vx-red/5 px-3 py-1.5"
            >
              <span className="vx-mono text-[10px] tracking-[0.3em] text-vx-red">
                //
              </span>
              <span className="vx-mono text-[10px] tracking-[0.3em] text-rose-100/90">
                TOKO RESMI OPEN ORDER
              </span>
            </motion.div>

            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 22 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.6 }}
              className="mt-6 font-display text-5xl leading-[0.95] font-black tracking-tight uppercase sm:text-6xl lg:text-7xl xl:text-[5.2rem]"
            >
              <span className="animate-vx-flicker bg-gradient-to-b from-white via-rose-200 to-vx-red bg-clip-text text-transparent drop-shadow-[0_0_38px_rgba(255,42,69,0.55)]">
                VOCALOID-X
              </span>
            </motion.h1>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0 },
              }}
              className="mt-5 font-display text-base font-bold tracking-[0.32em] text-rose-100 sm:text-lg"
            >
              CHEAT <span className="text-vx-red">×</span> SETTING FF PC{" "}
              <span className="text-vx-red">×</span> EMULATOR
            </motion.p>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0 },
              }}
              className="mt-6 max-w-xl text-base leading-relaxed text-rose-100/70 sm:text-lg"
            >
              Katalog paket cheat PC dan setingan emulator Free Fire. Update
              signature harian, config diracik ulang sampai nyaman, order
              langsung lewat WhatsApp tanpa ribet.
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0 },
              }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <Button
                type="button"
                size="lg"
                onClick={() => scrollToSection("produk")}
                className="vx-cut vx-mono gap-2 px-7 text-[11px] tracking-[0.24em] shadow-[0_0_36px_-8px_rgba(255,42,69,0.9)]"
              >
                <ShoppingBag className="size-4" />
                LIHAT PRODUK
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="vx-cut vx-mono border-vx-red/40 bg-transparent px-7 text-[11px] tracking-[0.24em] text-rose-100 hover:border-vx-red/80 hover:bg-vx-red/10 hover:text-white"
              >
                <a
                  href={whatsappUrl(`${ORDER_INTRO} paket cheat / setting FF PC.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-4" />
                  ORDER VIA WA
                </a>
              </Button>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0 },
              }}
              className="vx-mono mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] tracking-[0.2em] text-muted-foreground"
            >
              {[
                { icon: BadgeCheck, label: "PAKET TERKURASI" },
                { icon: Clock, label: "ORDER < 5 MENIT" },
                { icon: MessageCircle, label: `WA ${WHATSAPP_LABEL}` },
              ].map((item) => (
                <span key={item.label} className="inline-flex items-center gap-2">
                  <item.icon className="size-3.5 text-vx-red" />
                  {item.label}
                </span>
              ))}
            </motion.div>

            <TrustStrip />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="space-y-5 xl:col-span-4 xl:col-start-9"
          >
            <CodeConsole />
            <SystemMonitor />
            <div className="vx-cut-sm flex items-center justify-between border border-vx-red/25 bg-[#0a0509]/80 px-4 py-2.5">
              <span className="vx-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                STATUS TOKO
              </span>
              <span className="vx-mono text-[10px] tracking-[0.2em] text-[#7dffb0]">
                READY ORDER
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollToSection("produk")}
        className="vx-mono absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] tracking-[0.3em] text-muted-foreground transition-colors hover:text-vx-red lg:flex"
      >
        <span className="flex size-8 items-center justify-center rounded-md border border-vx-red/40 text-vx-red">
          <ChevronDown className="size-4 animate-bounce" />
        </span>
        LIHAT KATALOG
      </button>
    </section>
  );
}

/** Live social-proof strip: real order counters from the database + promises. */
function TrustStrip() {
  const counters = useQuery(api.orders.publicCount);
  const testimonials = useQuery(api.testimonials.listPublic);

  const avgRating = useMemo(() => {
    if (!testimonials || testimonials.length === 0) return null;
    const total = testimonials.reduce((sum, item) => sum + item.rating, 0);
    return (total / testimonials.length).toFixed(1);
  }, [testimonials]);

  const metrics = [
    {
      icon: ShieldCheck,
      label: "TRANSAKSI SELESAI",
      value: counters ? `${counters.doneCount}+` : "—",
    },
    {
      icon: Package,
      label: "ORDER DITERIMA",
      value: counters ? `${counters.total}+` : "—",
    },
    { icon: Clock, label: "RESPON ADMIN", value: "< 5 MNT" },
    // Rating hanya ditampilkan kalau testimoni asli sudah ada di database;
    // sebelum itu diganti janji garansi supaya tidak ada angka palsu.
    avgRating
      ? { icon: Star, label: "RATING PEMBELI", value: `${avgRating}/5` }
      : { icon: BadgeCheck, label: "GARANSI RESET", value: "AKTIF" },
  ];

  return (
    <div className="vx-panel vx-cut mt-8 grid grid-cols-2 gap-px overflow-hidden border-vx-red/25 bg-vx-red/10 sm:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="flex items-center gap-3 bg-[#0a0509]/90 px-4 py-3.5"
        >
          <metric.icon className="size-4 shrink-0 text-vx-red" />
          <div className="min-w-0">
            <p className="vx-mono truncate text-[9px] tracking-[0.22em] text-muted-foreground">
              {metric.label}
            </p>
            <p className="vx-mono text-base font-bold text-rose-50">
              {metric.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusPill({
  status,
  live = false,
}: {
  status: ProductStatus;
  live?: boolean;
}) {
  return (
    <span
      className={cn(
        "vx-mono inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[9px] tracking-[0.24em]",
        PRODUCT_STATUS_STYLES[status],
      )}
    >
      {live && (
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-current" />
        </span>
      )}
      {PRODUCT_STATUS_LABEL[status]}
    </span>
  );
}

function ProductCard({
  product,
  index,
  live = false,
}: {
  product: StoreProduct;
  index: number;
  live?: boolean;
}) {
  const locked = product.status !== "available";

  return (
    <motion.article
      {...reveal}
      transition={{ ...reveal.transition, delay: index * 0.06 }}
      className="vx-panel vx-cut group relative flex flex-col p-5 transition-transform duration-300 hover:-translate-y-1.5"
    >
      <CornerBrackets className="opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-3">
        <StatusPill status={product.status} live={live} />
        {product.badge && (
          <span className="vx-mono inline-flex items-center gap-1 border border-vx-red/40 bg-vx-red/10 px-2 py-0.5 text-[9px] tracking-[0.2em] text-rose-100">
            <Flame className="size-3 text-vx-red" />
            {product.badge}
          </span>
        )}
      </div>

      <p className="vx-mono mt-4 text-[10px] tracking-[0.28em] text-vx-red/80">
        {product.category}
      </p>
      <h3 className="mt-1.5 font-display text-lg font-bold tracking-[0.06em] text-rose-50">
        {product.name}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {product.tagline}
      </p>

      <div className="mt-5 flex items-end justify-between gap-3 border-t border-vx-red/15 pt-4">
        <div>
          {discountPercent(product) > 0 && (
            <p className="vx-mono text-[11px] font-bold text-muted-foreground">
              <span className="line-through decoration-vx-red/80">
                {formatIDR(product.compareAtPrice as number)}
              </span>{" "}
              <span className="text-vx-ember">
                -{discountPercent(product)}%
              </span>
            </p>
          )}
          <p className="vx-mono text-2xl font-bold text-vx-red">
            {formatIDR(product.price)}
          </p>
          <p className="vx-mono mt-1.5 text-[10px] tracking-[0.2em] text-muted-foreground">
            DURASI {product.duration}
          </p>
          {product.stockNote && (
            <p className="vx-mono mt-2 inline-flex w-fit items-center gap-1.5 border border-vx-ember/35 bg-vx-ember/10 px-2 py-0.5 text-[9px] tracking-[0.16em] text-vx-ember">
              <Activity className="size-3" />
              {product.stockNote}
            </p>
          )}
        </div>
        <HexIcon className="h-10 w-10">
          <Package className="size-4" />
        </HexIcon>
      </div>

      <ul className="mt-5 space-y-2">
        {product.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="mt-0.5 size-3.5 shrink-0 text-vx-red" />
            <span className="vx-mono text-[11px] leading-5 text-muted-foreground">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {locked ? (
        <Button
          type="button"
          variant="outline"
          disabled
          className="vx-cut vx-mono mt-6 w-full gap-2 text-[11px] tracking-[0.22em]"
        >
          {product.status === "sold_out" ? "STOK HABIS" : "SEGERA HADIR"}
        </Button>
      ) : (
        <Button
          asChild
          className="vx-cut vx-mono mt-6 w-full gap-2 text-[11px] tracking-[0.22em]"
        >
          <a
            href={whatsappUrl(productOrderMessage(product))}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="size-4" />
            ORDER SEKARANG
          </a>
        </Button>
      )}
    </motion.article>
  );
}

function Catalog() {
  const live = useQuery(api.products.listPublic);
  const [category, setCategory] = useState("SEMUA");
  const loading = live === undefined;

  const catalog: StoreProduct[] = live && live.length > 0 ? live : DEFAULT_PRODUCTS;

  const categories = useMemo(
    () => ["SEMUA", ...Array.from(new Set(catalog.map((item) => item.category)))],
    [catalog],
  );

  const visible = useMemo(
    () =>
      category === "SEMUA"
        ? catalog
        : catalog.filter((product) => product.category === category),
    [catalog, category],
  );

  const saleProducts = useMemo(
    () => catalog.filter((product) => discountPercent(product) > 0),
    [catalog],
  );

  return (
    <section
      id="produk"
      className="relative scroll-mt-20 border-t border-vx-red/15 bg-[#07040a] py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8">
        <motion.div
          {...reveal}
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <SectionLabel>// KATALOG PRODUK</SectionLabel>
            <h2 className="mt-5 font-display text-3xl leading-tight font-black uppercase sm:text-4xl lg:text-[2.9rem]">
              PAKET <span className="vx-glow text-vx-red">SIAP ORDER</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Pilih paket, tekan order, dan rinciannya otomatis terkirim ke
            WhatsApp admin. Semua paket termasuk panduan instalasi dan garansi
            reset saat update game.
          </p>
        </motion.div>

        <motion.div {...reveal} className="mt-9 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={cn(
                "vx-mono vx-cut-sm border px-3.5 py-1.5 text-[10px] tracking-[0.22em] transition-colors",
                category === item
                  ? "border-vx-red/70 bg-vx-red/15 text-rose-50"
                  : "border-vx-red/20 bg-transparent text-muted-foreground hover:border-vx-red/50 hover:text-rose-100",
              )}
            >
              {item}
            </button>
          ))}
        </motion.div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="vx-panel vx-cut flex flex-col gap-4 p-5"
                >
                  <Skeleton className="h-4 w-24 bg-vx-red/10" />
                  <Skeleton className="h-5 w-3/4 bg-vx-red/10" />
                  <Skeleton className="h-3.5 w-full bg-vx-red/15" />
                  <Skeleton className="h-3.5 w-2/3 bg-vx-red/15" />
                  <div className="mt-3 flex items-end justify-between border-t border-vx-red/15 pt-4">
                    <Skeleton className="h-7 w-28 bg-vx-red/20" />
                    <Skeleton className="h-9 w-24 bg-vx-red/10" />
                  </div>
                </div>
              ))
            : visible.map((product, index) => (
                <ProductCard
                  key={product._id ?? product.name}
                  product={product}
                  index={index}
                  live={Boolean(product._id)}
                />
              ))}
        </div>

        {saleProducts.length > 0 && (
          <motion.div
            {...reveal}
            className="vx-panel vx-cut mt-6 flex flex-wrap items-center gap-4 border-vx-ember/30 p-4"
          >
            <HexIcon className="h-10 w-10">
              <TicketPercent className="size-4" />
            </HexIcon>
            <div className="min-w-0 flex-1">
              <p className="vx-mono text-[11px] font-bold tracking-[0.14em] text-vx-ember">
                {saleProducts.length} PAKET LAGI FLASH SALE
              </p>
              <p className="vx-mono mt-1 text-[10px] text-muted-foreground">
                {saleProducts
                  .slice(0, 3)
                  .map(
                    (item) =>
                      `${item.name} -${discountPercent(item)}%`,
                  )
                  .join(" • ")}
                {saleProducts.length > 3 ? " • ..." : ""}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => setCategory("SEMUA")}
              className="vx-cut vx-mono gap-2 text-[10px] tracking-[0.2em]"
            >
              <TicketPercent className="size-3.5" />
              LIHAT PROMO
            </Button>
          </motion.div>
        )}

        <motion.div
          {...reveal}
          className="vx-panel vx-cut mt-8 flex flex-col items-center justify-between gap-5 p-6 sm:flex-row"
        >
          <div className="flex items-center gap-4">
            <HexIcon className="h-11 w-11">
              <Sparkles className="size-5" />
            </HexIcon>
            <div>
              <p className="font-display text-sm font-bold tracking-[0.1em] text-rose-50">
                BUTUH PAKET KHUSUS?
              </p>
              <p className="vx-mono mt-1 text-[11px] text-muted-foreground">
                Ceritakan device dan target rank Anda, admin racik paketnya.
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            className="vx-cut vx-mono border-vx-red/40 bg-transparent gap-2 px-6 text-[11px] tracking-[0.22em] text-rose-100 hover:bg-vx-red/10 hover:text-white"
          >
            <a
              href={whatsappUrl(`${ORDER_INTRO} paket custom, bisa dibantu?`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="size-4" />
              TANYA ADMIN
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

function Advantages() {
  return (
    <section
      id="keunggulan"
      className="relative scroll-mt-20 border-t border-vx-red/15 py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8">
        <motion.div
          {...reveal}
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <SectionLabel>// KEUNGGULAN</SectionLabel>
            <h2 className="mt-5 font-display text-3xl leading-tight font-black uppercase sm:text-4xl lg:text-[2.9rem]">
              KENAPA ORDER DI <span className="vx-glow text-vx-red">SINI</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Bukan sekadar jual file. Kami menjaga build tetap jalan setelah
            setiap patch game dan menemani Anda sampai config-nya pas.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 lg:grid-cols-12">
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {PILLARS.map((pillar, index) => (
              <motion.article
                key={pillar.title}
                {...reveal}
                transition={{ ...reveal.transition, delay: index * 0.08 }}
                className="vx-panel vx-cut group relative p-5 transition-transform duration-300 hover:-translate-y-1"
              >
                <CornerBrackets className="opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <HexIcon>
                  <pillar.icon className="size-5" />
                </HexIcon>
                <h3 className="vx-mono mt-5 text-[12px] font-bold tracking-[0.14em] text-rose-50">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {pillar.description}
                </p>
              </motion.article>
            ))}
          </div>

          <motion.div {...reveal} className="lg:col-span-5">
            <SystemTerminal />
            <HudPanel
              label="// TRACK RECORD"
              className="mt-5"
              bodyClassName="space-y-3 px-4 py-4"
            >
              {[
                { label: "ORDER SUKSES", value: 99.4, display: "99.4%" },
                { label: "RESPON CHAT", value: 97, display: "< 5 MIN" },
                { label: "GARANSI", value: 100, display: "AKTIF" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="vx-mono w-28 text-[10px] tracking-[0.18em] text-muted-foreground">
                    {row.label}
                  </span>
                  <MeterBar value={row.value} className="flex-1" />
                  <span className="vx-mono w-16 text-right text-[10px] text-vx-red">
                    {row.display}
                  </span>
                </div>
              ))}
            </HudPanel>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const testimonials = useQuery(api.testimonials.listPublic);

  if (testimonials !== undefined && testimonials.length === 0) {
    return null;
  }

  return (
    <section
      id="testimoni"
      className="relative scroll-mt-20 border-t border-vx-red/15 bg-[#07040a] py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8">
        <motion.div
          {...reveal}
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <SectionLabel>// TESTIMONI PEMBELI</SectionLabel>
            <h2 className="mt-5 font-display text-3xl leading-tight font-black uppercase sm:text-4xl lg:text-[2.9rem]">
              KATA MEREKA YANG <span className="vx-glow text-vx-red">SUDAH PUSH</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Ulasan asli dari pembeli VOCALOID-X — dikumpulkan langsung dari chat
            WhatsApp admin.
          </p>
        </motion.div>

        {testimonials === undefined ? (
          <div className="mt-12 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span className="vx-mono text-[11px] tracking-[0.2em]">MEMUAT ULASAN...</span>
          </div>
        ) : (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((item, index) => (
              <motion.article
                key={item._id}
                {...reveal}
                transition={{ ...reveal.transition, delay: (index % 3) * 0.07 }}
                className="vx-panel vx-cut relative flex flex-col p-5"
              >
                <MessageSquareQuote className="absolute top-4 right-4 size-8 text-vx-red/15" />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="vx-mono text-[11px] font-bold tracking-[0.08em] text-rose-50">
                    {item.buyerName}
                  </span>
                  {item.verified && (
                    <span className="vx-mono inline-flex items-center gap-1 rounded-sm border border-[#4ade80]/40 bg-[#4ade80]/10 px-1.5 py-0.5 text-[9px] tracking-[0.18em] text-[#7dffb0]">
                      <BadgeCheck className="size-3" />
                      VERIFIED
                    </span>
                  )}
                </div>
                {item.product && (
                  <span className="vx-mono mt-2 inline-block w-fit border border-vx-red/20 bg-vx-red/5 px-1.5 py-0.5 text-[9px] tracking-[0.16em] text-rose-100/70">
                    {item.product}
                  </span>
                )}
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  “{item.message}”
                </p>
                <div
                  className="mt-4 flex items-center gap-0.5"
                  aria-label={`Rating ${item.rating} dari 5`}
                >
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      className={cn(
                        "size-3.5",
                        starIndex < item.rating
                          ? "fill-vx-ember text-vx-ember"
                          : "text-vx-red/25",
                      )}
                    />
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function HowToOrder() {
  const settings = useQuery(api.settings.get);
  const payments = settings?.paymentMethods ?? FALLBACK_PAYMENTS;

  return (
    <section
      id="cara-order"
      className="relative scroll-mt-20 border-t border-vx-red/15 bg-[#07040a] py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8">
        <motion.div {...reveal}>
          <SectionLabel>// CARA ORDER</SectionLabel>
          <h2 className="mt-5 font-display text-3xl leading-tight font-black uppercase sm:text-4xl lg:text-[2.9rem]">
            EMPAT LANGKAH <span className="vx-glow text-vx-red">SELESAI</span>
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {ORDER_STEPS.map((item, index) => (
            <motion.article
              key={item.step}
              {...reveal}
              transition={{ ...reveal.transition, delay: index * 0.07 }}
              className="vx-panel vx-cut relative flex flex-col p-5"
            >
              <span className="font-display text-3xl font-black text-vx-red/25">
                {item.step}
              </span>
              <h3 className="vx-mono mt-3 text-[12px] font-bold tracking-[0.16em] text-rose-50">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.detail}
              </p>
            </motion.article>
          ))}
        </div>

        <motion.div
          {...reveal}
          className="vx-panel vx-cut mt-6 flex flex-wrap items-center gap-4 p-5"
        >
          <span className="vx-mono inline-flex items-center gap-2 text-[10px] tracking-[0.24em] text-muted-foreground">
            <Wallet className="size-3.5 text-vx-red" />
            METODE PEMBAYARAN
          </span>
          <div className="flex flex-wrap gap-2">
            {payments.map((payment) => (
              <span
                key={payment}
                className="vx-mono border border-vx-red/20 bg-vx-red/5 px-2.5 py-1 text-[10px] tracking-[0.18em] text-rose-100/80"
              >
                {payment}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FaqSection() {
  const live = useQuery(api.faqs.listPublic);

  // Sembunyikan section sampai owner mengisi FAQ asli via console (FaqManager).
  if (!live || live.length === 0) {
    return null;
  }

  const faqs = (live ?? []).map((item) => ({
    question: item.question,
    answer: item.answer,
  }));

  return (
    <section
      id="faq"
      className="relative scroll-mt-20 border-t border-vx-red/15 py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <motion.div {...reveal} className="lg:col-span-4">
            <SectionLabel>// FAQ</SectionLabel>
            <h2 className="mt-5 font-display text-3xl leading-tight font-black uppercase sm:text-4xl">
              SERING <span className="vx-glow text-vx-red">DITANYAKAN</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
              Jawaban cepat untuk pertanyaan yang paling sering masuk ke chat
              admin. Belum terjawab? Tanya langsung lewat WhatsApp — dibalas
              admin asli, bukan bot.
            </p>
            <Button
              asChild
              variant="outline"
              className="vx-cut vx-mono mt-6 border-vx-red/40 bg-transparent gap-2 px-6 text-[11px] tracking-[0.22em] text-rose-100 hover:bg-vx-red/10 hover:text-white"
            >
              <a
                href={whatsappUrl(`${ORDER_INTRO}, mau tanya soal paket dulu.`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="size-4" />
                TANYA ADMIN
              </a>
            </Button>
          </motion.div>

          <motion.div {...reveal} className="lg:col-span-8">
            <HudPanel label="// BASE PENGETAHUAN" bodyClassName="px-4 py-4 sm:px-5">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((item, index) => (
                  <AccordionItem
                    key={item.question}
                    value={`faq-${index}`}
                    className="border-vx-red/15"
                  >
                    <AccordionTrigger className="vx-mono gap-3 py-4 text-left text-[12px] font-bold tracking-[0.06em] text-rose-50 hover:no-underline hover:text-vx-red">
                      <span className="vx-mono mr-1 text-vx-red/70">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </HudPanel>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function OrderForm({ catalog }: { catalog: StoreProduct[] }) {
  const submitOrder = useMutation(api.orders.submit);
  const checkVoucher = useMutation(api.vouchers.check);
  const [productName, setProductName] = useState(catalog[0]?.name ?? "");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Voucher state — diterapkan realtime di form sebelum order dikirim.
  const [voucherCode, setVoucherCode] = useState("");
  const [voucher, setVoucher] = useState<
    { code: string; percentOff: number; finalPrice: number } | null
  >(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [isCheckingVoucher, setIsCheckingVoucher] = useState(false);
  const [lastOrderCode, setLastOrderCode] = useState<string | null>(null);

  const selected = catalog.find((product) => product.name === productName);
  const basePrice = selected?.price ?? 0;
  const finalPrice = voucher ? voucher.finalPrice : basePrice;

  const handleApplyVoucher = async () => {
    const code = voucherCode.trim();
    if (!code || !selected) return;
    setIsCheckingVoucher(true);
    setVoucherError(null);
    try {
      const result = await checkVoucher({ code, price: basePrice });
      setVoucher(result);
      toast.success(
        `VOUCHER AKTIF // ${result.percentOff}% off — total ${formatIDR(result.finalPrice)}`,
      );
    } catch (err) {
      setVoucher(null);
      setVoucherError(formatConvexError(err, "Voucher tidak bisa dipakai."));
    } finally {
      setIsCheckingVoucher(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "");
    const contact = String(data.get("contact") ?? "");
    const note = String(data.get("note") ?? "");

    setIsSending(true);
    setError(null);
    try {
      const result = await submitOrder({
        name,
        contact,
        productName,
        price: finalPrice,
        note,
      });
      setLastOrderCode(result?.orderCode ?? null);
      form.reset();
      window.open(
        whatsappUrl(
          customOrderMessage({
            name,
            productName,
            price: finalPrice,
            note: [
              note,
              voucher ? `Voucher: ${voucher.code} (-${voucher.percentOff}%)` : "",
            ]
              .filter(Boolean)
              .join(" | ") || undefined,
          }),
        ),
        "_blank",
        "noopener,noreferrer",
      );
      toast.success("ORDER DICATAT // Lanjutkan pembayaran di WhatsApp.");
    } catch (err) {
      setError(formatConvexError(err, "Gagal mengirim order. Coba lagi."));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="vx-label block">// NAMA / IGN</span>
          <Input
            name="name"
            required
            minLength={2}
            disabled={isSending}
            placeholder="Vocaloid Zero"
            className="vx-mono vx-cut-sm h-11 border-vx-red/25 bg-[#0a0509] text-sm placeholder:text-muted-foreground/60 focus-visible:border-vx-red/70"
          />
        </label>
        <label className="block space-y-2">
          <span className="vx-label block">// NO WHATSAPP</span>
          <Input
            name="contact"
            required
            minLength={9}
            disabled={isSending}
            placeholder="0812xxxxxxx"
            className="vx-mono vx-cut-sm h-11 border-vx-red/25 bg-[#0a0509] text-sm placeholder:text-muted-foreground/60 focus-visible:border-vx-red/70"
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="vx-label block">// PILIH PAKET</span>
        <Select
          value={productName}
          onValueChange={setProductName}
          disabled={isSending}
        >
          <SelectTrigger className="vx-mono vx-cut-sm h-11 w-full border-vx-red/25 bg-[#0a0509] text-[12px] tracking-[0.12em]">
            <SelectValue placeholder="Pilih paket" />
          </SelectTrigger>
          <SelectContent>
            {catalog.map((product) => (
              <SelectItem key={product.name} value={product.name}>
                {product.name} — {formatIDR(product.price)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      <label className="block space-y-2">
        <span className="vx-label block">// CATATAN (OPSIONAL)</span>
        <Textarea
          name="note"
          rows={4}
          maxLength={500}
          disabled={isSending}
          placeholder="Contoh: pakai Gameloop 64-bit, RAM 8GB, butuh setting sensi."
          className="vx-mono vx-cut-sm border-vx-red/25 bg-[#0a0509] text-sm placeholder:text-muted-foreground/60 focus-visible:border-vx-red/70"
        />
      </label>

      {selected && (
        <div className="vx-cut-sm space-y-3 border border-vx-red/25 bg-vx-red/5 px-4 py-3">
          <div className="flex flex-wrap items-end gap-2">
            <label className="min-w-0 flex-1 space-y-1.5">
              <span className="vx-mono block text-[10px] tracking-[0.2em] text-muted-foreground">
                KODE VOUCHER (OPSIONAL)
              </span>
              <div className="flex gap-2">
                <Input
                  value={voucherCode}
                  onChange={(event) => setVoucherCode(event.target.value.toUpperCase())}
                  disabled={isSending || isCheckingVoucher}
                  placeholder="HEMAT20"
                  className="vx-mono vx-cut-sm h-10 border-vx-ember/40 bg-[#0a0509] text-sm uppercase placeholder:text-muted-foreground/50 focus-visible:border-vx-ember/70"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleApplyVoucher}
                  disabled={isCheckingVoucher || isSending || !voucherCode.trim()}
                  className="vx-cut-sm vx-mono h-10 shrink-0 gap-2 border-vx-ember/40 bg-transparent px-4 text-[10px] tracking-[0.18em] text-vx-ember hover:bg-vx-ember/10 hover:text-vx-ember"
                >
                  {isCheckingVoucher ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Ticket className="size-3.5" />
                  )}
                  PAKAI
                </Button>
              </div>
            </label>
          </div>
          {voucherError && (
            <p className="vx-mono text-[10px] tracking-[0.08em] text-vx-red">
              {voucherError}
            </p>
          )}
          {voucher && (
            <div className="flex flex-wrap items-center justify-between gap-2 border border-vx-ember/35 bg-vx-ember/10 px-3 py-2">
              <span className="vx-mono inline-flex items-center gap-1.5 text-[10px] tracking-[0.16em] text-vx-ember">
                <TicketPercent className="size-3.5" />
                {voucher.code} // -{voucher.percentOff}%
              </span>
              <button
                type="button"
                onClick={() => {
                  setVoucher(null);
                  setVoucherCode("");
                }}
                className="vx-mono text-[9px] tracking-[0.18em] text-muted-foreground transition-colors hover:text-vx-red"
              >
                HAPUS
              </button>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-vx-red/15 pt-2">
            <span className="vx-mono text-[10px] tracking-[0.2em] text-muted-foreground">
              TOTAL {selected.category}
            </span>
            <span className="vx-mono flex items-baseline gap-2">
              {voucher && (
                <span className="text-[11px] text-muted-foreground line-through decoration-vx-red/70">
                  {formatIDR(basePrice)}
                </span>
              )}
              <span className="text-sm font-bold text-vx-red">
                {formatIDR(finalPrice)}
              </span>
            </span>
          </div>
        </div>
      )}

      {error && (
        <p className="vx-mono border border-vx-red/40 bg-vx-red/10 px-3 py-2 text-[11px] tracking-[0.1em] text-rose-200">
          ERROR // {error}
        </p>
      )}

      {lastOrderCode && (
        <div className="vx-cut-sm flex flex-wrap items-center gap-3 border border-[#4ade80]/35 bg-[#4ade80]/10 px-4 py-3">
          <ScanLine className="size-4 text-[#7dffb0]" />
          <div className="min-w-0">
            <p className="vx-mono text-[10px] tracking-[0.18em] text-[#7dffb0]">
              ORDER TERCATAT — KODE PELACAKAN ANDA
            </p>
            <p className="vx-mono mt-0.5 text-base font-bold tracking-[0.14em] text-rose-50">
              {lastOrderCode}
            </p>
          </div>
          <Link
            to={`/status-order?kode=${encodeURIComponent(lastOrderCode)}`}
            className="vx-mono ml-auto text-[10px] tracking-[0.18em] text-vx-red transition-opacity hover:opacity-70"
          >
            LACAK STATUS →
          </Link>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isSending}
        className="vx-cut vx-mono w-full gap-2 text-[11px] tracking-[0.24em] shadow-[0_0_36px_-10px_rgba(255,42,69,0.9)] sm:w-auto sm:px-8"
      >
        {isSending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <MessageCircle className="size-4" />
        )}
        {isSending ? "MEMPROSES..." : "KIRIM & LANJUT KE WHATSAPP"}
      </Button>
    </form>
  );
}

function PaymentPanel() {
  const settings = useQuery(api.settings.get);
  const payments = settings?.paymentMethods ?? FALLBACK_PAYMENTS;
  const qrisUrl = settings?.qrisUrl;

  return (
    <HudPanel label="// PEMBAYARAN" bodyClassName="px-5 py-5">
      <div className="flex flex-wrap gap-2">
        {payments.map((payment) => (
          <span
            key={payment}
            className={cn(
              "vx-mono border px-2.5 py-1 text-[10px] tracking-[0.18em]",
              payment === "QRIS"
                ? "border-vx-red/50 bg-vx-red/15 text-rose-50"
                : "border-vx-red/20 bg-vx-red/5 text-rose-100/80",
            )}
          >
            {payment}
          </span>
        ))}
      </div>

      {qrisUrl ? (
        <div className="vx-cut-sm mt-4 flex flex-col items-center gap-3 border border-vx-red/25 bg-white/95 p-4">
          <img
            src={qrisUrl}
            alt="QRIS VOCALOID-X"
            className="h-auto w-full max-w-[260px] object-contain"
          />
          <p className="vx-mono text-[10px] tracking-[0.2em] text-[#40020e]">
            SCAN QRIS UNTUK BAYAR
          </p>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="vx-mono vx-cut-sm border-vx-red/35 bg-transparent text-[10px] tracking-[0.18em] text-rose-100 hover:bg-vx-red/10 hover:text-white"
          >
            <a href={qrisUrl} target="_blank" rel="noopener noreferrer">
              BUKA / PERBESAR QRIS
            </a>
          </Button>
        </div>
      ) : (
        <p className="vx-mono mt-4 text-[11px] leading-5 text-muted-foreground">
          QRIS belum diunggah. Minta QR ke admin lewat WhatsApp di atas, atau
          unggah gambar QRIS Anda dari store console.
        </p>
      )}

      {settings?.paymentNote && (
        <p className="vx-mono mt-4 text-[11px] leading-5 text-muted-foreground">
          {settings.paymentNote}
        </p>
      )}
    </HudPanel>
  );
}

function Order() {
  const live = useQuery(api.products.listPublic);
  const catalog: StoreProduct[] = live && live.length > 0 ? live : DEFAULT_PRODUCTS;

  return (
    <section
      id="order"
      className="relative scroll-mt-20 border-t border-vx-red/15 py-20 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <motion.div {...reveal} className="lg:col-span-7">
            <HudPanel label="// FORM ORDER" bodyClassName="p-6 sm:p-8">
              <SectionLabel>// CHECKOUT VIA WHATSAPP</SectionLabel>
              <h2 className="mt-5 font-display text-3xl leading-tight font-black uppercase sm:text-4xl">
                ISI DATA, CHAT{" "}
                <span className="vx-glow text-vx-red">TERBUKA</span>
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-rose-100/65">
                Order Anda tercatat otomatis di console operator, lalu WhatsApp
                terbuka dengan rincian paket yang sudah lengkap. Tidak perlu
                mengetik ulang.
              </p>
              <div className="mt-8">
                <OrderForm catalog={catalog} />
              </div>
            </HudPanel>
          </motion.div>

          <motion.div {...reveal} className="space-y-5 lg:col-span-5">
            <HudPanel label="// CHANNEL ORDER" bodyClassName="space-y-4 px-5 py-5">
              {[
                { icon: MessageCircle, label: "WHATSAPP", value: WHATSAPP_LABEL },
                { icon: Clock, label: "ADMIN ONLINE", value: OPERATIONAL_HOURS },
                { icon: MapPin, label: "BASE", value: STORE_CITY },
                { icon: Zap, label: "PENGIRIMAN", value: "< 5 menit setelah bayar" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="vx-cut-sm flex size-9 shrink-0 items-center justify-center border border-vx-red/25 bg-vx-red/5 text-vx-red">
                    <row.icon className="size-4" />
                  </span>
                  <div>
                    <p className="vx-label">{row.label}</p>
                    <p className="vx-mono text-[12px] text-rose-100/85">
                      {row.value}
                    </p>
                  </div>
                </div>
              ))}
              <Button
                asChild
                className="vx-cut vx-mono w-full gap-2 text-[11px] tracking-[0.22em]"
              >
                <a
                  href={whatsappUrl(`${ORDER_INTRO}, boleh minta info dulu?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-4" />
                  CHAT ADMIN SEKARANG
                </a>
              </Button>
            </HudPanel>

            <PaymentPanel />

            <HudPanel label="// FAQ" bodyClassName="space-y-4 px-5 py-5">
              <p className="vx-mono text-[11px] leading-5 text-muted-foreground">
                Ada pertanyaan soal paket, garansi, atau instalasi? Cek base
                pengetahuan toko atau lacak status order Anda.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/"
                  onClick={() => scrollToSection("faq")}
                  className="vx-mono vx-cut-sm border border-vx-red/30 bg-vx-red/5 px-3 py-1.5 text-[10px] tracking-[0.2em] text-rose-100 transition-colors hover:border-vx-red/70 hover:text-vx-red"
                >
                  BUKA FAQ
                </Link>
                <Link
                  to="/status-order"
                  className="vx-mono vx-cut-sm border border-vx-red/30 bg-vx-red/5 px-3 py-1.5 text-[10px] tracking-[0.2em] text-rose-100 transition-colors hover:border-vx-red/70 hover:text-vx-red"
                >
                  LACAK ORDER
                </Link>
                <Link
                  to="/kebijakan"
                  className="vx-mono vx-cut-sm border border-vx-red/30 bg-vx-red/5 px-3 py-1.5 text-[10px] tracking-[0.2em] text-rose-100 transition-colors hover:border-vx-red/70 hover:text-vx-red"
                >
                  KEBIJAKAN
                </Link>
              </div>
            </HudPanel>

            <HudPanel label="// MEMBER AREA" bodyClassName="px-5 py-5">
              <div className="flex items-center gap-3">
                <Lock className="size-4 text-vx-red" />
                <p className="vx-mono text-[11px] leading-5 text-muted-foreground">
                  Console operator bersifat privat — hanya email owner toko yang
                  bisa mengelola katalog, QRIS, dan memproses order masuk.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to="/auth?returnTo=%2Fdashboard"
                  className="vx-mono vx-cut-sm border border-vx-red/30 bg-vx-red/5 px-3 py-1.5 text-[10px] tracking-[0.2em] text-rose-100 transition-colors hover:border-vx-red/70 hover:text-vx-red"
                >
                  MASUK OPERATOR
                </Link>
                <Link
                  to="/dashboard"
                  className="vx-mono vx-cut-sm border border-vx-red/30 bg-vx-red/5 px-3 py-1.5 text-[10px] tracking-[0.2em] text-rose-100 transition-colors hover:border-vx-red/70 hover:text-vx-red"
                >
                  PANEL OPERATOR
                </Link>
              </div>
            </HudPanel>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  const active = useActiveSection(SECTION_IDS);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <SiteNav active={active} />
      <SideRail active={active} />
      <main className="xl:pl-60">
        <Hero />
        <Catalog />
        <Advantages />
        <Testimonials />
        <HowToOrder />
        <FaqSection />
        <TrustStrip />
        <Order />
        <SiteFooter />
      </main>
    </div>
  );
}
