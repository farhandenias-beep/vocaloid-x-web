import { LogoLockup, LogoMark } from "@/components/vocaloid/logo-mark";
import {
  HexIcon,
  HudPanel,
  MeterBar,
  SectionLabel,
} from "@/components/vocaloid/hud";
import { SystemMonitor } from "@/components/vocaloid/system-monitor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { DEVELOPER_NAME, normalizeWhatsApp } from "@/lib/brand";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_STATUS_CYCLE,
  PRODUCT_STATUS_LABEL,
  PRODUCT_STATUS_STYLES,
  formatIDR,
  type ProductStatus,
} from "@/lib/products";
import { cn, formatConvexError } from "@/lib/utils";
import { FaqManager, SalesStats, VoucherManager } from "@/pages/console-panels";
import { useMutation, useQuery } from "convex/react";
import {
  Bell,
  BellRing,
  ChefHat,
  Download,
  FileDown,
  Inbox,
  LogOut,
  Loader2,
  MessageCircle,
  MessageSquareQuote,
  Package,
  Pencil,
  Plus,
  QrCode,
  Save,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Trash2,
  Upload,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

function timeAgo(timestamp: number) {
  const minutes = Math.floor(Math.max(0, Date.now() - timestamp) / 60_000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  return `${Math.floor(hours / 24)} hari lalu`;
}

/** Turns a local 08xx number into an international wa.me link. */
function contactLink(contact: string, message: string) {
  return `https://wa.me/${normalizeWhatsApp(contact)}?text=${encodeURIComponent(message)}`;
}

/** Short two-tone chime for incoming orders (no audio file needed). */
function playChime() {
  try {
    type WindowWithWebkit = Window & {
      webkitAudioContext?: typeof AudioContext;
    };
    const Ctor =
      typeof window === "undefined"
        ? undefined
        : (window.AudioContext ?? (window as WindowWithWebkit).webkitAudioContext);
    if (!Ctor) return;
    const ctx = new Ctor();
    const now = ctx.currentTime;
    [
      { freq: 880, at: 0 },
      { freq: 1245, at: 0.16 },
    ].forEach(({ freq, at }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + at);
      gain.gain.exponentialRampToValueAtTime(0.16, now + at + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + at);
      osc.stop(now + at + 0.3);
    });
    setTimeout(() => void ctx.close(), 1200);
  } catch {
    // Audio not available — stay silent.
  }
}

function ConsoleHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-vx-red/20 bg-[#07040a]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center gap-4 px-5 sm:px-8">
        <Link to="/" className="shrink-0">
          <LogoLockup markClassName="h-7 w-7" className="[&_span]:text-base" />
        </Link>
        <span className="vx-label hidden sm:inline">// STORE CONSOLE</span>
        <div className="ml-auto flex items-center gap-3">
          <span className="vx-mono hidden items-center gap-2 text-[10px] tracking-[0.2em] text-muted-foreground md:inline-flex">
            <span className="size-1.5 animate-vx-pulse rounded-full bg-vx-red" />
            SESSION ACTIVE
          </span>
          <span className="vx-mono hidden max-w-[180px] truncate text-[11px] text-rose-100/80 sm:block">
            {user?.email ?? user?.name ?? "operator"}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="vx-mono vx-cut-sm border-vx-red/35 bg-transparent gap-2 text-[10px] tracking-[0.18em] text-rose-100 hover:bg-vx-red/10 hover:text-white"
          >
            <LogOut className="size-3.5" />
            SIGN OUT
          </Button>
        </div>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-vx-red/60 to-transparent" />
    </header>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="vx-panel vx-cut px-4 py-3.5">
      <p className="vx-label">{label}</p>
      <p className="vx-mono mt-2 text-2xl font-bold text-vx-red">{value}</p>
      <p className="vx-mono mt-1 text-[10px] tracking-[0.16em] text-muted-foreground">
        {hint}
      </p>
    </div>
  );
}

function ProductManager({
  products,
}: {
  products: Doc<"products">[] | undefined;
}) {
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const removeProduct = useMutation(api.products.remove);
  const updateStatus = useMutation(api.products.setStatus);
  const seedProducts = useMutation(api.products.seed);

  const [status, setStatus] = useState<ProductStatus>("available");
  const [category, setCategory] = useState(PRODUCT_CATEGORIES[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Inline edit state — one product at a time
  const [editingId, setEditingId] = useState<Id<"products"> | null>(null);
  const [editStatus, setEditStatus] = useState<ProductStatus>("available");
  const [editCategory, setEditCategory] = useState(PRODUCT_CATEGORIES[0]);
  const [isUpdating, setIsUpdating] = useState(false);

  const closeEdit = () => {
    setEditingId(null);
  };

  const openEdit = (product: Doc<"products">) => {
    setEditingId(product._id);
    setEditStatus(product.status);
    setEditCategory(product.category);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setIsSaving(true);
    try {
      await createProduct({
        name: String(data.get("name") ?? ""),
        category,
        tagline: String(data.get("tagline") ?? ""),
        price: Number(data.get("price") ?? 0),
        duration: String(data.get("duration") ?? ""),
        features: String(data.get("features") ?? ""),
        status,
        badge: String(data.get("badge") ?? ""),
        stockNote: String(data.get("stockNote") ?? ""),
      });
      form.reset();
      setStatus("available");
      setCategory(PRODUCT_CATEGORIES[0]);
      toast.success("PAKET DITAMBAHKAN // Katalog tersinkron.");
    } catch (error) {
      toast.error(formatConvexError(error, "Gagal menyimpan paket."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const inserted = await seedProducts({});
      toast.success(`${inserted} PAKET DEFAULT DIMUAT.`);
    } catch (error) {
      toast.error(formatConvexError(error, "Gagal memuat paket default."));
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCycleStatus = async (
    productId: Id<"products">,
    current: ProductStatus,
  ) => {
    try {
      await updateStatus({ productId, status: PRODUCT_STATUS_CYCLE[current] });
    } catch (error) {
      toast.error(formatConvexError(error, "Gagal mengubah status."));
    }
  };

  const handleRemove = async (productId: Id<"products">) => {
    try {
      await removeProduct({ productId });
      if (editingId === productId) closeEdit();
      toast.success("PAKET DIHAPUS.");
    } catch (error) {
      toast.error(formatConvexError(error, "Gagal menghapus paket."));
    }
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const rawCompare = String(data.get("compareAtPrice") ?? "").trim();
    setIsUpdating(true);
    try {
      await updateProduct({
        productId: editingId,
        name: String(data.get("name") ?? ""),
        category: editCategory,
        tagline: String(data.get("tagline") ?? ""),
        price: Number(data.get("price") ?? 0),
        duration: String(data.get("duration") ?? ""),
        features: String(data.get("features") ?? ""),
        status: editStatus,
        badge: String(data.get("badge") ?? ""),
        compareAtPrice: rawCompare ? Number(rawCompare) : undefined,
        stockNote: String(data.get("stockNote") ?? ""),
      });
      closeEdit();
      toast.success("PAKET DIPERBARUI // Katalog tersinkron.");
    } catch (error) {
      toast.error(formatConvexError(error, "Gagal memperbarui paket."));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <HudPanel
      label="// PRODUCT MANAGER"
      right={
        <span className="vx-mono text-[10px] text-vx-red">
          {products?.length ?? 0} PAKET
        </span>
      }
      bodyClassName="p-5"
    >
      <form onSubmit={handleCreate} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="vx-label block">// NAMA PAKET</span>
            <Input
              name="name"
              required
              minLength={2}
              maxLength={60}
              disabled={isSaving}
              placeholder="VOCALOID-X WEEKLY"
              className="vx-mono vx-cut-sm h-11 border-vx-red/25 bg-[#0a0509] text-sm focus-visible:border-vx-red/70"
            />
          </label>
          <label className="block space-y-2">
            <span className="vx-label block">// HARGA (RP)</span>
            <Input
              name="price"
              type="number"
              min={0}
              step={1000}
              required
              disabled={isSaving}
              placeholder="65000"
              className="vx-mono vx-cut-sm h-11 border-vx-red/25 bg-[#0a0509] text-sm focus-visible:border-vx-red/70"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block space-y-2">
            <span className="vx-label block">// KATEGORI</span>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={isSaving}
            >
              <SelectTrigger className="vx-mono vx-cut-sm h-11 w-full border-vx-red/25 bg-[#0a0509] text-[11px] tracking-[0.16em]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="block space-y-2">
            <span className="vx-label block">// DURASI</span>
            <Input
              name="duration"
              disabled={isSaving}
              placeholder="7 HARI"
              className="vx-mono vx-cut-sm h-11 border-vx-red/25 bg-[#0a0509] text-sm focus-visible:border-vx-red/70"
            />
          </label>
          <label className="block space-y-2">
            <span className="vx-label block">// BADGE</span>
            <Input
              name="badge"
              maxLength={20}
              disabled={isSaving}
              placeholder="TERPOPULER"
              className="vx-mono vx-cut-sm h-11 border-vx-red/25 bg-[#0a0509] text-sm focus-visible:border-vx-red/70"
            />
          </label>
          <label className="block space-y-2">
            <span className="vx-label block">// CATATAN STOK LIVE</span>
            <Input
              name="stockNote"
              maxLength={40}
              disabled={isSaving}
              placeholder="SLOT 8/10 HARI INI"
              className="vx-mono vx-cut-sm h-11 border-vx-ember/40 bg-[#0a0509] text-sm focus-visible:border-vx-ember/70"
            />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="vx-label block">// DESKRIPSI SINGKAT</span>
          <Textarea
            name="tagline"
            rows={2}
            maxLength={220}
            disabled={isSaving}
            placeholder="Satu kalimat tentang paket ini."
            className="vx-mono vx-cut-sm border-vx-red/25 bg-[#0a0509] text-sm focus-visible:border-vx-red/70"
          />
        </label>

        <label className="block space-y-2">
          <span className="vx-label block">
            // FITUR (SATU PER BARIS / PISAH KOMA)
          </span>
          <Textarea
            name="features"
            rows={3}
            disabled={isSaving}
            placeholder={"Aimbot smooth\nESP player + loot\nAnti-banned dasar"}
            className="vx-mono vx-cut-sm border-vx-red/25 bg-[#0a0509] text-sm focus-visible:border-vx-red/70"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as ProductStatus)}
            disabled={isSaving}
          >
            <SelectTrigger className="vx-mono vx-cut-sm h-11 w-[170px] border-vx-red/25 bg-[#0a0509] text-[11px] tracking-[0.18em]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["available", "sold_out", "coming_soon"] as ProductStatus[]).map(
                (item) => (
                  <SelectItem key={item} value={item}>
                    {PRODUCT_STATUS_LABEL[item]}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>

          <Button
            type="submit"
            disabled={isSaving}
            className="vx-cut vx-mono gap-2 text-[11px] tracking-[0.22em]"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            TAMBAH PAKET
          </Button>

          {(products?.length ?? 0) === 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSeed}
              disabled={isSeeding}
              className="vx-cut vx-mono border-vx-red/35 bg-transparent gap-2 text-[11px] tracking-[0.18em] text-rose-100 hover:bg-vx-red/10 hover:text-white"
            >
              {isSeeding ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              MUAT PAKET DEFAULT
            </Button>
          )}
        </div>
      </form>

      <div className="mt-6 border-t border-vx-red/15 pt-2">
        {products === undefined ? (
          <div className="flex items-center gap-2 py-6 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span className="vx-mono text-[11px]">MEMUAT KATALOG...</span>
          </div>
        ) : products.length === 0 ? (
          <p className="vx-mono py-6 text-[11px] leading-5 text-muted-foreground">
            Katalog kosong. Landing page sementara menampilkan paket contoh —
            tambahkan paket asli Anda di atas agar tampil permanen.
          </p>
        ) : (
          <ul className="divide-y divide-vx-red/12">
            {products.map((product) => (
              <li key={product._id} className="py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-sm font-bold tracking-[0.06em] text-rose-50">
                    {product.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      handleCycleStatus(product._id, product.status)
                    }
                    title="Klik untuk mengubah status"
                    className={cn(
                      "vx-mono rounded-sm border px-2 py-0.5 text-[9px] tracking-[0.22em] transition-opacity hover:opacity-80",
                      PRODUCT_STATUS_STYLES[product.status],
                    )}
                  >
                    {PRODUCT_STATUS_LABEL[product.status]}
                  </button>
                  <span className="vx-mono text-[10px] text-muted-foreground">
                    {product.category}
                  </span>
                  <span className="vx-mono ml-auto text-[12px] font-bold text-vx-red">
                    {product.compareAtPrice ? (
                      <span className="mr-2 text-[10px] font-normal text-muted-foreground line-through">
                        {formatIDR(product.compareAtPrice)}
                      </span>
                    ) : null}
                    {formatIDR(product.price)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${product.name}`}
                    onClick={() => openEdit(product)}
                    className="size-8 text-muted-foreground hover:bg-vx-red/10 hover:text-rose-100"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Hapus ${product.name}`}
                    onClick={() => handleRemove(product._id)}
                    className="size-8 text-muted-foreground hover:bg-vx-red/10 hover:text-vx-red"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                {product.tagline && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {product.tagline}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="vx-mono border border-vx-red/25 bg-vx-red/5 px-1.5 py-0.5 text-[9px] tracking-[0.16em] text-rose-100/70">
                    {product.duration}
                  </span>
                  {product.badge && (
                    <span className="vx-mono border border-vx-ember/40 bg-vx-ember/10 px-1.5 py-0.5 text-[9px] tracking-[0.16em] text-vx-ember">
                      {product.badge}
                    </span>
                  )}
                  {product.stockNote && (
                    <span className="vx-mono border border-vx-ember/30 bg-vx-ember/5 px-1.5 py-0.5 text-[9px] tracking-[0.14em] text-vx-ember/90">
                      {product.stockNote}
                    </span>
                  )}
                  {product.features.slice(0, 4).map((feature) => (
                    <span
                      key={feature}
                      className="vx-mono border border-vx-red/20 bg-vx-red/5 px-1.5 py-0.5 text-[9px] tracking-[0.16em] text-rose-100/70"
                    >
                      {feature}
                    </span>
                  ))}
                  {product.features.length > 4 && (
                    <span className="vx-mono text-[9px] text-muted-foreground">
                      +{product.features.length - 4} fitur
                    </span>
                  )}
                </div>

                {editingId === product._id && (
                  <form
                    onSubmit={handleUpdate}
                    className="mt-4 space-y-4 border border-vx-red/30 bg-[#0a0509] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="vx-label">// EDIT PAKET</span>
                      <button
                        type="button"
                        onClick={closeEdit}
                        aria-label="Tutup form edit"
                        className="vx-mono text-[10px] tracking-[0.2em] text-muted-foreground transition-colors hover:text-vx-red"
                      >
                        <X className="size-4" />
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block space-y-2">
                        <span className="vx-label block">// NAMA PAKET</span>
                        <Input
                          name="name"
                          required
                          minLength={2}
                          maxLength={60}
                          defaultValue={product.name}
                          disabled={isUpdating}
                          className="vx-mono vx-cut-sm h-11 border-vx-red/25 bg-[#050407] text-sm focus-visible:border-vx-red/70"
                        />
                      </label>
                      <label className="block space-y-2">
                        <span className="vx-label block">// HARGA PROMO (RP)</span>
                        <Input
                          name="price"
                          type="number"
                          min={0}
                          step={1000}
                          required
                          defaultValue={product.price}
                          disabled={isUpdating}
                          className="vx-mono vx-cut-sm h-11 border-vx-red/25 bg-[#050407] text-sm focus-visible:border-vx-red/70"
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <label className="block space-y-2">
                        <span className="vx-label block">// KATEGORI</span>
                        <Select
                          value={editCategory}
                          onValueChange={setEditCategory}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="vx-mono vx-cut-sm h-11 w-full border-vx-red/25 bg-[#050407] text-[11px] tracking-[0.16em]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRODUCT_CATEGORIES.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </label>
                      <label className="block space-y-2">
                        <span className="vx-label block">// DURASI</span>
                        <Input
                          name="duration"
                          defaultValue={product.duration}
                          disabled={isUpdating}
                          className="vx-mono vx-cut-sm h-11 border-vx-red/25 bg-[#050407] text-sm focus-visible:border-vx-red/70"
                        />
                      </label>
                      <label className="block space-y-2">
                        <span className="vx-label block">// BADGE</span>
                        <Input
                          name="badge"
                          maxLength={20}
                          defaultValue={product.badge ?? ""}
                          disabled={isUpdating}
                          className="vx-mono vx-cut-sm h-11 border-vx-red/25 bg-[#050407] text-sm focus-visible:border-vx-red/70"
                        />
                      </label>
                    </div>

                    <label className="block space-y-2">
                      <span className="vx-label block">// DESKRIPSI SINGKAT</span>
                      <Textarea
                        name="tagline"
                        rows={2}
                        maxLength={220}
                        defaultValue={product.tagline}
                        disabled={isUpdating}
                        className="vx-mono vx-cut-sm border-vx-red/25 bg-[#050407] text-sm focus-visible:border-vx-red/70"
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="vx-label block">
                        // FITUR (SATU PER BARIS / PISAH KOMA)
                      </span>
                      <Textarea
                        name="features"
                        rows={3}
                        defaultValue={product.features.join("\n")}
                        disabled={isUpdating}
                        className="vx-mono vx-cut-sm border-vx-red/25 bg-[#050407] text-sm focus-visible:border-vx-red/70"
                      />
                    </label>

                    <div className="flex flex-wrap items-center gap-3">
                      <Select
                        value={editStatus}
                        onValueChange={(value) => setEditStatus(value as ProductStatus)}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="vx-mono vx-cut-sm h-11 w-[170px] border-vx-red/25 bg-[#050407] text-[11px] tracking-[0.18em]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            ["available", "sold_out", "coming_soon"] as ProductStatus[]
                          ).map((item) => (
                            <SelectItem key={item} value={item}>
                              {PRODUCT_STATUS_LABEL[item]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <label className="block space-y-2">
                        <span className="vx-label block">// HARGA CORET (FLASH SALE)</span>
                        <Input
                          name="compareAtPrice"
                          type="number"
                          min={0}
                          step={1000}
                          placeholder="Kosong = tanpa promo"
                          defaultValue={product.compareAtPrice ?? ""}
                          disabled={isUpdating}
                          className="vx-mono vx-cut-sm h-11 w-[210px] border-vx-ember/40 bg-[#050407] text-sm focus-visible:border-vx-ember/70"
                        />
                      </label>

                      <label className="block space-y-2">
                        <span className="vx-label block">// CATATAN STOK LIVE</span>
                        <Input
                          name="stockNote"
                          maxLength={40}
                          placeholder="Kosong = tanpa catatan"
                          defaultValue={product.stockNote ?? ""}
                          disabled={isUpdating}
                          className="vx-mono vx-cut-sm h-11 w-[210px] border-vx-ember/40 bg-[#050407] text-sm focus-visible:border-vx-ember/70"
                        />
                      </label>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-1">
                      <Button
                        type="submit"
                        disabled={isUpdating}
                        className="vx-cut vx-mono gap-2 text-[11px] tracking-[0.22em]"
                      >
                        {isUpdating ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Save className="size-4" />
                        )}
                        SIMPAN PERUBAHAN
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={closeEdit}
                        disabled={isUpdating}
                        className="vx-cut vx-mono border-vx-red/35 bg-transparent gap-2 text-[11px] tracking-[0.18em] text-rose-100 hover:bg-vx-red/10 hover:text-white"
                      >
                        <X className="size-4" />
                        BATALKAN
                      </Button>
                    </div>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </HudPanel>
  );
}

function PaymentSettings() {
  const settings = useQuery(api.settings.get);
  const generateUploadUrl = useMutation(api.settings.generateUploadUrl);
  const setQris = useMutation(api.settings.setQris);
  const updatePayment = useMutation(api.settings.updatePayment);

  const [draftMethods, setDraftMethods] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const methods = draftMethods ?? settings?.paymentMethods.join(", ") ?? "";
  const note = draftNote ?? settings?.paymentNote ?? "";

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "image/png" },
        body: file,
      });
      const { storageId } = (await response.json()) as { storageId: string };
      await setQris({ imageId: storageId as Id<"_storage"> });
      toast.success("QRIS DIUNGGAH // Tampil di halaman order.");
    } catch (error) {
      toast.error(formatConvexError(error, "Gagal mengunggah QRIS."));
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleRemoveQris = async () => {
    try {
      await setQris({ imageId: null });
      toast.success("QRIS DIHAPUS.");
    } catch (error) {
      toast.error(formatConvexError(error, "Gagal menghapus QRIS."));
    }
  };

  const handleSavePayments = async () => {
    setIsSaving(true);
    try {
      await updatePayment({ paymentMethods: methods, paymentNote: note });
      toast.success("METODE PEMBAYARAN DISIMPAN.");
    } catch (error) {
      toast.error(formatConvexError(error, "Gagal menyimpan pembayaran."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <HudPanel
      label="// PEMBAYARAN & QRIS"
      right={
        <span className="vx-mono text-[10px] text-vx-red">
          {settings?.qrisUrl ? "QRIS AKTIF" : "QRIS BELUM ADA"}
        </span>
      }
      bodyClassName="p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="vx-cut-sm flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden border border-vx-red/25 bg-[#0a0509]">
          {settings?.qrisUrl ? (
            <img
              src={settings.qrisUrl}
              alt="QRIS toko"
              className="h-full w-full object-contain"
            />
          ) : (
            <QrCode className="size-10 text-vx-red/40" />
          )}
        </div>

        <div className="space-y-3">
          <p className="vx-mono text-[11px] leading-5 text-muted-foreground">
            Unggah gambar QRIS (PNG/JPG). Gambar langsung tampil di section
            pembayaran landing page agar pembeli bisa scan sendiri.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              variant="outline"
              className="vx-mono vx-cut-sm border-vx-red/35 bg-transparent gap-2 text-[10px] tracking-[0.18em] text-rose-100 hover:bg-vx-red/10 hover:text-white"
            >
              <label className="cursor-pointer">
                {isUploading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Upload className="size-3.5" />
                )}
                {settings?.qrisUrl ? "GANTI QRIS" : "UNGGAH QRIS"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                  onChange={handleUpload}
                />
              </label>
            </Button>
            {settings?.qrisUrl && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleRemoveQris}
                className="vx-mono gap-2 text-[10px] tracking-[0.18em] text-muted-foreground hover:bg-vx-red/10 hover:text-vx-red"
              >
                <Trash2 className="size-3.5" />
                HAPUS
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3 border-t border-vx-red/15 pt-4">
        <label className="block space-y-2">
          <span className="vx-label block">
            // METODE PEMBAYARAN (PISAH DENGAN KOMA)
          </span>
          <Input
            value={methods}
            onChange={(event) => setDraftMethods(event.target.value)}
            placeholder="BCA, DANA, GOPAY, OVO, QRIS"
            className="vx-mono vx-cut-sm h-11 border-vx-red/25 bg-[#0a0509] text-sm focus-visible:border-vx-red/70"
          />
        </label>
        <label className="block space-y-2">
          <span className="vx-label block">// CATATAN PEMBAYARAN</span>
          <Textarea
            value={note}
            rows={2}
            maxLength={240}
            onChange={(event) => setDraftNote(event.target.value)}
            placeholder="Kirim bukti pembayaran ke WhatsApp admin."
            className="vx-mono vx-cut-sm border-vx-red/25 bg-[#0a0509] text-sm focus-visible:border-vx-red/70"
          />
        </label>
        <Button
          type="button"
          onClick={handleSavePayments}
          disabled={isSaving}
          className="vx-cut vx-mono gap-2 text-[11px] tracking-[0.22em]"
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          SIMPAN PEMBAYARAN
        </Button>
      </div>
    </HudPanel>
  );
}

function OrderInbox({ orders }: { orders: Doc<"orders">[] | undefined }) {
  const setStatus = useMutation(api.orders.setStatus);
  const removeOrder = useMutation(api.orders.remove);

  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "done">("all");
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();

  const visible = useMemo(() => {
    if (!orders) return [];
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (!query) return true;
      return (
        order.name.toLowerCase().includes(query) ||
        order.contact.toLowerCase().includes(query) ||
        order.productName.toLowerCase().includes(query) ||
        (order.orderCode ?? "").toLowerCase().includes(query)
      );
    });
  }, [orders, statusFilter, query]);

  const handleStatus = async (orderId: Id<"orders">, status: "new" | "done") => {
    try {
      await setStatus({ orderId, status });
    } catch (error) {
      toast.error(formatConvexError(error, "Gagal memperbarui order."));
    }
  };

  const handleRemove = async (orderId: Id<"orders">) => {
    try {
      await removeOrder({ orderId });
      toast.success("ORDER DIHAPUS.");
    } catch (error) {
      toast.error(formatConvexError(error, "Gagal menghapus order."));
    }
  };

  return (
    <HudPanel
      label="// ORDER INBOX"
      right={
        <span className="vx-mono text-[10px] text-vx-red">
          {orders?.filter((order) => order.status === "new").length ?? 0} BARU
        </span>
      }
      bodyClassName="p-5"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(
          [
            { value: "all" as const, label: "SEMUA" },
            { value: "new" as const, label: "BARU" },
            { value: "done" as const, label: "SELESAI" },
          ]
        ).map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              "vx-mono vx-cut-sm border px-3 py-1.5 text-[10px] tracking-[0.2em] transition-colors",
              statusFilter === tab.value
                ? "border-vx-red/70 bg-vx-red/15 text-rose-50"
                : "border-vx-red/20 text-muted-foreground hover:border-vx-red/50 hover:text-rose-100",
            )}
          >
            {tab.label}
          </button>
        ))}
        <label className="relative ml-auto">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-vx-red/70" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama / paket / kode..."
            className="vx-mono vx-cut-sm h-9 w-[220px] border-vx-red/25 bg-[#0a0509] pl-8 text-[12px] focus-visible:border-vx-red/70"
          />
        </label>
      </div>

      {orders === undefined ? (
        <div className="flex items-center gap-2 py-4 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <span className="vx-mono text-[11px]">MEMUAT INBOX...</span>
        </div>
      ) : orders.length === 0 ? (
        <p className="vx-mono py-3 text-[11px] leading-5 text-muted-foreground">
          Belum ada order. Setiap pengisian form order di landing page akan
          tercatat di sini sebelum pembeli lanjut ke WhatsApp.
        </p>
      ) : visible.length === 0 ? (
        <p className="vx-mono py-3 text-[11px] leading-5 text-muted-foreground">
          Tidak ada order yang cocok dengan filter/pencarian.
        </p>
      ) : (
        <ul className="space-y-4">
          {visible.map((order) => (
            <li
              key={order._id}
              className={cn(
                "border-l-2 pl-3",
                order.status === "new"
                  ? "border-vx-red"
                  : "border-vx-red/20 opacity-70",
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="vx-mono text-[11px] text-rose-100">
                  {order.name}
                </span>
                <span className="vx-mono text-[10px] text-muted-foreground">
                  {order.contact}
                </span>
                {order.orderCode && (
                  <span className="vx-mono border border-vx-red/25 bg-vx-red/5 px-1.5 py-0.5 text-[9px] tracking-[0.16em] text-vx-red">
                    {order.orderCode}
                  </span>
                )}
                <span className="vx-mono ml-auto text-[10px] text-muted-foreground">
                  {timeAgo(order.createdAt)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="vx-mono text-[11px] text-rose-100/85">
                  {order.productName}
                </span>
                <span className="vx-mono text-[11px] font-bold text-vx-red">
                  {formatIDR(order.price)}
                </span>
                <span
                  className={cn(
                    "vx-mono rounded-sm border px-2 py-0.5 text-[9px] tracking-[0.22em]",
                    order.status === "new"
                      ? "border-vx-red/40 bg-vx-red/10 text-vx-red"
                      : "border-[#4ade80]/40 bg-[#4ade80]/10 text-[#7dffb0]",
                  )}
                >
                  {order.status === "new" ? "BARU" : "SELESAI"}
                </span>
              </div>
              {order.note && (
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {order.note}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <a
                  href={contactLink(
                    order.contact,
                    `Halo ${order.name}, terima kasih sudah order ${order.productName} (${formatIDR(order.price)}) di VOCALOID-X. Kode order Anda: ${order.orderCode ?? "-"}.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vx-mono inline-flex items-center gap-1.5 text-[9px] tracking-[0.2em] text-vx-red transition-opacity hover:opacity-70"
                >
                  <MessageCircle className="size-3" />
                  CHAT PEMBELI
                </a>
                <button
                  type="button"
                  onClick={() =>
                    handleStatus(
                      order._id,
                      order.status === "new" ? "done" : "new",
                    )
                  }
                  className="vx-mono text-[9px] tracking-[0.2em] text-muted-foreground transition-colors hover:text-rose-100"
                >
                  {order.status === "new" ? "TANDAI SELESAI" : "TANDAI BARU"}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(order._id)}
                  className="vx-mono text-[9px] tracking-[0.2em] text-muted-foreground transition-colors hover:text-vx-red"
                >
                  HAPUS
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </HudPanel>
  );
}

function TestimonialManager() {
  const testimonials = useQuery(api.testimonials.listMine);
  const createTestimonial = useMutation(api.testimonials.create);
  const removeTestimonial = useMutation(api.testimonials.remove);

  const [rating, setRating] = useState("5");
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setIsSaving(true);
    try {
      await createTestimonial({
        buyerName: String(data.get("buyerName") ?? ""),
        product: String(data.get("product") ?? ""),
        message: String(data.get("message") ?? ""),
        rating: Number(rating),
        verified: data.get("verified") !== null,
      });
      form.reset();
      setRating("5");
      toast.success("TESTIMONI DITAMBAHKAN // Langsung tampil di landing.");
    } catch (error) {
      toast.error(formatConvexError(error, "Gagal menyimpan testimoni."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (testimonialId: Id<"testimonials">) => {
    try {
      await removeTestimonial({ testimonialId });
      toast.success("TESTIMONI DIHAPUS.");
    } catch (error) {
      toast.error(formatConvexError(error, "Gagal menghapus testimoni."));
    }
  };

  return (
    <HudPanel
      label="// TESTIMONI PEMBELI"
      right={
        <span className="vx-mono text-[10px] text-vx-red">
          {testimonials?.length ?? 0} TERSIMPAN
        </span>
      }
      bodyClassName="p-5"
    >
      <p className="vx-mono text-[11px] leading-5 text-muted-foreground">
        Salin ulasan asli dari chat pembeli ke sini. Testimoni terverifikasi
        ditandai hijau dan langsung tampil di landing page.
      </p>

      <form onSubmit={handleCreate} className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="vx-label block">// NAMA PEMBELI</span>
            <Input
              name="buyerName"
              required
              minLength={2}
              maxLength={40}
              disabled={isSaving}
              placeholder="Rifqi — Majalengka"
              className="vx-mono vx-cut-sm h-11 border-vx-red/25 bg-[#0a0509] text-sm focus-visible:border-vx-red/70"
            />
          </label>
          <label className="block space-y-2">
            <span className="vx-label block">// PAKET DIBELI</span>
            <Input
              name="product"
              maxLength={60}
              disabled={isSaving}
              placeholder="VOCALOID-X WEEKLY"
              className="vx-mono vx-cut-sm h-11 border-vx-red/25 bg-[#0a0509] text-sm focus-visible:border-vx-red/70"
            />
          </label>
        </div>

        <label className="block space-y-2">
          <span className="vx-label block">// ULASAN</span>
          <Textarea
            name="message"
            rows={3}
            maxLength={300}
            required
            disabled={isSaving}
            placeholder="Cheat jalan mulus, support fast respon. Auto win streak 8x!"
            className="vx-mono vx-cut-sm border-vx-red/25 bg-[#0a0509] text-sm focus-visible:border-vx-red/70"
          />
        </label>

        <div className="flex flex-wrap items-center gap-4">
          <label className="space-y-2">
            <span className="vx-label block">// RATING</span>
            <Select value={rating} onValueChange={setRating} disabled={isSaving}>
              <SelectTrigger className="vx-mono vx-cut-sm h-11 w-[150px] border-vx-red/25 bg-[#0a0509] text-[11px] tracking-[0.16em]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 4, 3, 2, 1].map((value) => (
                  <SelectItem key={value} value={String(value)}>
                    {"★".repeat(value)} {value}/5
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="mt-6 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              name="verified"
              defaultChecked
              className="size-4 accent-[#ff2a45]"
            />
            <span className="vx-mono text-[10px] tracking-[0.18em] text-rose-100/85">
              TANDAI TERVERIFIKASI
            </span>
          </label>

          <Button
            type="submit"
            disabled={isSaving}
            className="vx-cut vx-mono mt-6 gap-2 text-[11px] tracking-[0.22em]"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            TAMBAH TESTIMONI
          </Button>
        </div>
      </form>

      <div className="mt-6 border-t border-vx-red/15 pt-2">
        {testimonials === undefined ? (
          <div className="flex items-center gap-2 py-6 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span className="vx-mono text-[11px]">MEMUAT TESTIMONI...</span>
          </div>
        ) : testimonials.length === 0 ? (
          <p className="vx-mono py-6 text-[11px] leading-5 text-muted-foreground">
            Belum ada testimoni tersimpan. Landing page menyembunyikan section
            testimoni sampai ada minimal satu ulasan.
          </p>
        ) : (
          <ul className="divide-y divide-vx-red/12">
            {testimonials.map((item) => (
              <li key={item._id} className="py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="vx-mono text-[11px] font-bold tracking-[0.08em] text-rose-50">
                    {item.buyerName}
                  </h3>
                  {item.verified && (
                    <span className="vx-mono inline-flex items-center gap-1 rounded-sm border border-[#4ade80]/40 bg-[#4ade80]/10 px-1.5 py-0.5 text-[9px] tracking-[0.18em] text-[#7dffb0]">
                      <MessageSquareQuote className="size-3" />
                      VERIFIED
                    </span>
                  )}
                  <span className="vx-mono ml-auto text-[10px] text-vx-ember">
                    {"★".repeat(item.rating)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Hapus testimoni ${item.buyerName}`}
                    onClick={() => handleRemove(item._id)}
                    className="size-8 text-muted-foreground hover:bg-vx-red/10 hover:text-vx-red"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                {item.product && (
                  <span className="vx-mono mt-2 inline-block border border-vx-red/20 bg-vx-red/5 px-1.5 py-0.5 text-[9px] tracking-[0.16em] text-rose-100/70">
                    {item.product}
                  </span>
                )}
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  “{item.message}”
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </HudPanel>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const products = useQuery(api.products.listMine);
  const orders = useQuery(api.orders.listRecent);
  const testimonials = useQuery(api.testimonials.listMine);
  const sales = useQuery(api.orders.stats);
  const exportCsv = useQuery(api.orders.exportCsv);

  const handleExportCsv = () => {
    if (!exportCsv?.csv) {
      toast.error("Data export belum siap. Coba lagi sebentar.");
      return;
    }
    const blob = new Blob([exportCsv.csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = exportCsv.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success("CSV ORDER TERUNDUH.");
  };

  const liveProducts = products?.filter((p) => p.status === "available").length ?? 0;
  const newOrders = orders?.filter((order) => order.status === "new") ?? [];
  const potentialRevenue = newOrders.reduce((total, order) => total + order.price, 0);
  const initials = (user?.name ?? user?.email ?? "VX").slice(0, 2).toUpperCase();

  // Order masuk: toast + chime setiap ada order "new" yang belum terlihat.
  const seenNewRef = useRef<Set<string>>(new Set());
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (orders === undefined) return;
    const currentNew = new Set(
      orders.filter((order) => order.status === "new").map((order) => order._id),
    );

    if (!hasSyncedRef.current) {
      // Baseline saat console pertama dibuka — jangan berbunyi untuk order lama.
      seenNewRef.current = currentNew;
      hasSyncedRef.current = true;
      return;
    }

    const fresh = orders.filter(
      (order) => order.status === "new" && !seenNewRef.current.has(order._id),
    );
    if (fresh.length > 0) {
      playChime();
      fresh.forEach((order) => {
        toast.success(`ORDER BARU // ${order.name} — ${order.productName}`, {
          description: `${formatIDR(order.price)} • proses di ORDER INBOX.`,
          duration: 10000,
        });
      });
    }

    seenNewRef.current = currentNew;
  }, [orders]);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="vx-grid pointer-events-none fixed inset-0 opacity-25" />
      <ConsoleHeader />

      <main className="relative mx-auto w-full max-w-[1500px] px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel>// STORE CONSOLE</SectionLabel>
            <h1 className="mt-4 font-display text-3xl font-black uppercase sm:text-4xl">
              WELCOME BACK,{" "}
              <span className="vx-glow text-vx-red">
                {user?.name?.toUpperCase() || "OPERATOR"}
              </span>
            </h1>
            <p className="vx-mono mt-3 text-[11px] tracking-[0.16em] text-muted-foreground">
              KATALOG & ORDER TERKONEKSI // DATA REALTIME CONVEX
            </p>
          </div>
          <div className="flex items-center gap-3">
            {newOrders.length > 0 && (
              <span
                className="vx-mono vx-cut-sm inline-flex items-center gap-2 border border-vx-red/40 bg-vx-red/10 px-3 py-2 text-[10px] tracking-[0.2em] text-rose-100"
                title="Ada order baru menunggu diproses di ORDER INBOX"
              >
                <BellRing className="size-3.5 animate-vx-pulse text-vx-red" />
                {newOrders.length} ORDER BARU
              </span>
            )}
            {newOrders.length === 0 && (
              <span className="vx-mono vx-cut-sm inline-flex items-center gap-2 border border-vx-red/20 px-3 py-2 text-[10px] tracking-[0.2em] text-muted-foreground">
                <Bell className="size-3.5" />
                NOTIF AKTIF
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleExportCsv}
              className="vx-cut vx-mono border-vx-ember/40 bg-transparent gap-2 text-[11px] tracking-[0.2em] text-vx-ember hover:bg-vx-ember/10 hover:text-vx-ember"
            >
              <FileDown className="size-4" />
              EXPORT CSV
            </Button>
            <Button
              asChild
              variant="outline"
              className="vx-cut vx-mono border-vx-red/35 bg-transparent text-[11px] tracking-[0.22em] text-rose-100 hover:bg-vx-red/10 hover:text-white"
            >
              <Link to="/">KEMBALI KE TOKO</Link>
            </Button>
          </div>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="// PAKET AKTIF"
            value={String(liveProducts).padStart(2, "0")}
            hint={`DARI ${products?.length ?? 0} PAKET`}
          />
          <StatCard
            label="// ORDER MASUK"
            value={String(orders?.length ?? 0).padStart(2, "0")}
            hint={
              newOrders.length > 0
                ? `${newOrders.length} BELUM DIPROSES`
                : "SEMUA TERPROSES"
            }
          />
          <StatCard
            label="// POTENSI OMSET"
            value={formatIDR(potentialRevenue)}
            hint="DARI ORDER BARU"
          />
          <StatCard label="// RESPON" value="< 5 MIN" hint="RATA-RATA ADMIN" />
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <ProductManager products={products} />
          </div>

          <div className="space-y-5 xl:col-span-5">
            <HudPanel label="// IDENTITY" bodyClassName="p-5">
              <div className="flex items-center gap-4">
                <span className="vx-mono flex size-12 items-center justify-center rounded-sm border border-vx-red/40 bg-vx-red/10 text-sm font-bold text-vx-red">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold tracking-[0.08em] text-rose-50">
                    {user?.name || "VOCALOID OPERATOR"}
                  </p>
                  <p className="vx-mono truncate text-[11px] text-muted-foreground">
                    {user?.email ?? "anonymous session"}
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-3 border-t border-vx-red/15 pt-4">
                {[
                  { icon: UserRound, label: "ROLE", value: user?.role ?? "member" },
                  { icon: ChefHat, label: "DEVELOPER", value: DEVELOPER_NAME },
                  { icon: Store, label: "TOKO", value: "VOCALOID-X" },
                  {
                    icon: Package,
                    label: "KATALOG",
                    value: `${products?.length ?? 0} paket`,
                  },
                  {
                    icon: Inbox,
                    label: "INBOX",
                    value: `${orders?.length ?? 0} order`,
                  },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <row.icon className="size-4 text-vx-red" />
                    <span className="vx-label">{row.label}</span>
                    <span className="vx-mono ml-auto text-[11px] text-rose-100/85">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </HudPanel>

            <SystemMonitor />

            <HudPanel label="// ALUR JUALAN" bodyClassName="p-5">
              <div className="flex items-center gap-4">
                <HexIcon className="h-11 w-11">
                  <LogoMark className="h-5 w-5" />
                </HexIcon>
                <p className="vx-mono text-[11px] leading-5 text-muted-foreground">
                  Tambah paket di product manager, atur harga dan fiturnya, lalu
                  landing page langsung menampilkan katalog terbaru.
                </p>
              </div>
              <div className="mt-5 space-y-3 border-t border-vx-red/15 pt-4">
                {[
                  { icon: ShoppingBag, label: "ORDER MASUK", value: `${newOrders.length}` },
                  { icon: Wallet, label: "OMSET BARU", value: formatIDR(potentialRevenue) },
                  { icon: Sparkles, label: "STATUS", value: "ONLINE" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <row.icon className="size-4 text-vx-red" />
                    <span className="vx-label">{row.label}</span>
                    <span className="vx-mono ml-auto text-[11px] text-rose-100/85">
                      {row.value}
                    </span>
                  </div>
                ))}
                <MeterBar value={Math.min(100, newOrders.length * 10)} />
              </div>
            </HudPanel>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <SalesStats sales={sales} />
          </div>
          <div className="xl:col-span-5">
            <VoucherManager />
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <OrderInbox orders={orders} />
          </div>
          <div className="xl:col-span-5">
            <PaymentSettings />
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <TestimonialManager />
          </div>
          <div className="xl:col-span-5">
            <FaqManager />
          </div>
        </div>
      </main>
    </div>
  );
}
