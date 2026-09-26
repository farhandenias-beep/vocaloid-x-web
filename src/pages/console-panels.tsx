import { HudPanel } from "@/components/vocaloid/hud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatIDR } from "@/lib/products";
import { cn, formatConvexError } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowDown,
  ArrowUp,
  HelpCircle,
  Loader2,
  Pencil,
  Plus,
  Save,
  TicketPercent,
  Trash2,
  X,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

export type SalesStatsData = {
  totalOrders: number;
  doneCount: number;
  pendingCount: number;
  doneRevenue: number;
  pendingRevenue: number;
  todayCount: number;
  todayRevenue: number;
  last7Days: { label: string; count: number; revenue: number }[];
  topProducts: { name: string; count: number; revenue: number }[];
};

export function SalesStats({
  sales,
}: {
  sales: SalesStatsData | null | undefined;
}) {
  const maxRevenue = Math.max(
    1,
    ...(sales?.last7Days ?? []).map((day) => day.revenue),
  );

  return (
    <HudPanel
      label="// STATISTIK PENJUALAN"
      right={
        <span className="vx-mono text-[10px] text-vx-red">7 HARI TERAKHIR</span>
      }
      bodyClassName="p-5"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          {
            label: "OMZET SELESAI",
            value: formatIDR(sales?.doneRevenue ?? 0),
            hint: `${sales?.doneCount ?? 0} ORDER TERPROSES`,
          },
          {
            label: "OMZET MENUNGGU",
            value: formatIDR(sales?.pendingRevenue ?? 0),
            hint: `${sales?.pendingCount ?? 0} ORDER BARU`,
          },
          {
            label: "ORDER HARI INI",
            value: String(sales?.todayCount ?? 0),
            hint: formatIDR(sales?.todayRevenue ?? 0),
          },
          {
            label: "TOTAL ORDER",
            value: String(sales?.totalOrders ?? 0),
            hint: "SEMUA WAKTU",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="vx-cut-sm border border-vx-red/20 bg-[#0a0509] px-3.5 py-3"
          >
            <p className="vx-label">{card.label}</p>
            <p className="vx-mono mt-1.5 text-lg font-bold text-vx-red">
              {card.value}
            </p>
            <p className="vx-mono mt-0.5 text-[9px] tracking-[0.16em] text-muted-foreground">
              {card.hint}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-vx-red/15 pt-4">
        <p className="vx-label">// ORDER 7 HARI TERAKHIR</p>
        <div className="mt-3 flex h-24 items-end gap-2">
          {(sales?.last7Days ?? []).map((day) => (
            <div
              key={`${day.label}-${day.revenue}`}
              className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
            >
              <div
                className="w-full bg-gradient-to-t from-vx-red/25 to-vx-red/90 transition-all"
                style={{
                  height: `${Math.max(6, Math.round((day.revenue / maxRevenue) * 100))}%`,
                }}
                title={`${day.count} order • ${formatIDR(day.revenue)}`}
              />
              <span className="vx-mono text-[9px] text-muted-foreground">
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-vx-red/15 pt-4">
        <p className="vx-label">// PAKET TERLARIS</p>
        {(sales?.topProducts.length ?? 0) === 0 ? (
          <p className="vx-mono mt-2 text-[11px] text-muted-foreground">
            Belum ada data order.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {(sales?.topProducts ?? []).map((product, index) => (
              <li key={product.name} className="flex items-center gap-3">
                <span className="vx-mono w-5 text-[10px] text-vx-red/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="vx-mono min-w-0 flex-1 truncate text-[11px] text-rose-100/85">
                  {product.name}
                </span>
                <span className="vx-mono text-[10px] text-muted-foreground">
                  {product.count}x
                </span>
                <span className="vx-mono w-24 text-right text-[11px] font-bold text-vx-red">
                  {formatIDR(product.revenue)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </HudPanel>
  );
}

export function VoucherManager() {
  const vouchers = useQuery(api.vouchers.listMine);
  const createVoucher = useMutation(api.vouchers.create);
  const updateVoucher = useMutation(api.vouchers.update);
  const removeVoucher = useMutation(api.vouchers.remove);

  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const rawMaxUses = String(data.get("maxUses") ?? "").trim();
    const rawExpires = String(data.get("expiresAt") ?? "").trim();
    setIsSaving(true);
    try {
      await createVoucher({
        code: String(data.get("code") ?? ""),
        percentOff: Number(data.get("percentOff") ?? 0),
        maxUses: rawMaxUses ? Number(rawMaxUses) : undefined,
        expiresAt: rawExpires ? new Date(rawExpires).getTime() : undefined,
      });
      form.reset();
      toast.success("VOUCHER DIBUAT // Bisa dipakai di form order.");
    } catch (error) {
      toast.error(formatConvexError(error, "Gagal membuat voucher."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (voucherId: Id<"vouchers">, active: boolean) => {
    try {
      await updateVoucher({ voucherId, active });
    } catch (error) {
      toast.error(formatConvexError(error, "Gagal mengubah voucher."));
    }
  };

  const handleRemove = async (voucherId: Id<"vouchers">) => {
    try {
      await removeVoucher({ voucherId });
      toast.success("VOUCHER DIHAPUS.");
    } catch (error) {
      toast.error(formatConvexError(error, "Gagal menghapus voucher."));
    }
  };

  return (
    <HudPanel
      label="// VOUCHER PROMO"
      right={
        <span className="vx-mono text-[10px] text-vx-red">
          {vouchers?.length ?? 0} KODE
        </span>
      }
      bodyClassName="p-5"
    >
      <form onSubmit={handleCreate} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="vx-label block">// KODE</span>
            <Input
              name="code"
              required
              minLength={3}
              maxLength={16}
              disabled={isSaving}
              placeholder="HEMAT20"
              className="vx-mono vx-cut-sm h-11 border-vx-ember/40 bg-[#0a0509] text-sm uppercase focus-visible:border-vx-ember/70"
            />
          </label>
          <label className="block space-y-2">
            <span className="vx-label block">// DISKON (%)</span>
            <Input
              name="percentOff"
              type="number"
              min={1}
              max={90}
              required
              disabled={isSaving}
              placeholder="20"
              className="vx-mono vx-cut-sm h-11 border-vx-ember/40 bg-[#0a0509] text-sm focus-visible:border-vx-ember/70"
            />
          </label>
          <label className="block space-y-2">
            <span className="vx-label block">// BATAS PAKAI (OPSIONAL)</span>
            <Input
              name="maxUses"
              type="number"
              min={1}
              disabled={isSaving}
              placeholder="Kosong = tanpa batas"
              className="vx-mono vx-cut-sm h-11 border-vx-red/25 bg-[#0a0509] text-sm focus-visible:border-vx-red/70"
            />
          </label>
          <label className="block space-y-2">
            <span className="vx-label block">// KEDALUWARSA (OPSIONAL)</span>
            <Input
              name="expiresAt"
              type="date"
              disabled={isSaving}
              className="vx-mono vx-cut-sm h-11 border-vx-red/25 bg-[#0a0509] text-sm focus-visible:border-vx-red/70"
            />
          </label>
        </div>
        <Button
          type="submit"
          disabled={isSaving}
          className="vx-cut vx-mono gap-2 text-[11px] tracking-[0.22em]"
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <TicketPercent className="size-4" />
          )}
          BUAT VOUCHER
        </Button>
      </form>

      <div className="mt-6 border-t border-vx-red/15 pt-2">
        {vouchers === undefined ? (
          <div className="flex items-center gap-2 py-6 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span className="vx-mono text-[11px]">MEMUAT VOUCHER...</span>
          </div>
        ) : vouchers.length === 0 ? (
          <p className="vx-mono py-6 text-[11px] leading-5 text-muted-foreground">
            Belum ada voucher. Kode yang dibuat langsung valid di form order
            landing page.
          </p>
        ) : (
          <ul className="divide-y divide-vx-red/12">
            {vouchers.map((voucher) => (
              <li key={voucher._id} className="py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="vx-mono text-[12px] font-bold tracking-[0.1em] text-vx-ember">
                    {voucher.code}
                  </span>
                  <span className="vx-mono border border-vx-ember/40 bg-vx-ember/10 px-1.5 py-0.5 text-[9px] tracking-[0.14em] text-vx-ember">
                    -{voucher.percentOff}%
                  </span>
                  <span className="vx-mono text-[10px] text-muted-foreground">
                    {voucher.usedCount}/{voucher.maxUses ?? "∞"} PAKAI
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggle(voucher._id, !voucher.active)}
                    className={cn(
                      "vx-mono rounded-sm border px-2 py-0.5 text-[9px] tracking-[0.2em] transition-opacity hover:opacity-80",
                      voucher.active
                        ? "border-[#4ade80]/40 bg-[#4ade80]/10 text-[#7dffb0]"
                        : "border-vx-red/30 bg-vx-red/10 text-vx-red",
                    )}
                  >
                    {voucher.active ? "AKTIF" : "NONAKTIF"}
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Hapus voucher ${voucher.code}`}
                    onClick={() => handleRemove(voucher._id)}
                    className="ml-auto size-8 text-muted-foreground hover:bg-vx-red/10 hover:text-vx-red"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                {voucher.expiresAt && (
                  <p className="vx-mono mt-1 text-[9px] tracking-[0.14em] text-muted-foreground">
                    KEDALUWARSA{" "}
                    {new Date(voucher.expiresAt).toLocaleDateString("id-ID")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </HudPanel>
  );
}

export function FaqManager() {
  const faqs = useQuery(api.faqs.listMine);
  const createFaq = useMutation(api.faqs.create);
  const updateFaq = useMutation(api.faqs.update);
  const removeFaq = useMutation(api.faqs.remove);
  const moveFaq = useMutation(api.faqs.move);

  const [editingId, setEditingId] = useState<Id<"faqs"> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setIsSaving(true);
    try {
      await createFaq({
        question: String(data.get("question") ?? ""),
        answer: String(data.get("answer") ?? ""),
      });
      form.reset();
      toast.success("FAQ DITAMBAHKAN // Langsung tampil di landing.");
    } catch (error) {
      toast.error(formatConvexError(error, "Gagal menambah FAQ."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) return;
    const data = new FormData(event.currentTarget);
    setIsSaving(true);
    try {
      await updateFaq({
        faqId: editingId,
        question: String(data.get("question") ?? ""),
        answer: String(data.get("answer") ?? ""),
      });
      setEditingId(null);
      toast.success("FAQ DIPERBARUI.");
    } catch (error) {
      toast.error(formatConvexError(error, "Gagal memperbarui FAQ."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (faqId: Id<"faqs">) => {
    try {
      await removeFaq({ faqId });
      if (editingId === faqId) setEditingId(null);
      toast.success("FAQ DIHAPUS.");
    } catch (error) {
      toast.error(formatConvexError(error, "Gagal menghapus FAQ."));
    }
  };

  const handleMove = async (faqId: Id<"faqs">, direction: "up" | "down") => {
    try {
      await moveFaq({ faqId, direction });
    } catch (error) {
      toast.error(formatConvexError(error, "Gagal memindah FAQ."));
    }
  };

  return (
    <HudPanel
      label="// FAQ PEMBELI"
      right={
        <span className="vx-mono text-[10px] text-vx-red">
          {faqs?.length ?? 0} ITEM
        </span>
      }
      bodyClassName="p-5"
    >
      <p className="vx-mono text-[11px] leading-5 text-muted-foreground">
        FAQ yang ditambahkan di sini tampil sebagai accordion di landing page.
        Kalau masih kosong, landing memakai daftar FAQ contoh.
      </p>

      <form onSubmit={handleCreate} className="mt-4 space-y-4">
        <label className="block space-y-2">
          <span className="vx-label block">// PERTANYAAN</span>
          <Input
            name="question"
            required
            minLength={5}
            maxLength={160}
            disabled={isSaving}
            placeholder="Bisa dipakai di HP?"
            className="vx-mono vx-cut-sm h-11 border-vx-red/25 bg-[#0a0509] text-sm focus-visible:border-vx-red/70"
          />
        </label>
        <label className="block space-y-2">
          <span className="vx-label block">// JAWABAN</span>
          <Textarea
            name="answer"
            rows={3}
            required
            minLength={5}
            maxLength={600}
            disabled={isSaving}
            placeholder="Jelaskan singkat dan jelas untuk pembeli."
            className="vx-mono vx-cut-sm border-vx-red/25 bg-[#0a0509] text-sm focus-visible:border-vx-red/70"
          />
        </label>
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
          TAMBAH FAQ
        </Button>
      </form>

      <div className="mt-6 border-t border-vx-red/15 pt-2">
        {faqs === undefined ? (
          <div className="flex items-center gap-2 py-6 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span className="vx-mono text-[11px]">MEMUAT FAQ...</span>
          </div>
        ) : faqs.length === 0 ? (
          <p className="vx-mono py-6 text-[11px] leading-5 text-muted-foreground">
            Belum ada FAQ tersimpan.
          </p>
        ) : (
          <ul className="divide-y divide-vx-red/12">
            {faqs.map((faq) => (
              <li key={faq._id} className="py-4">
                <div className="flex items-start gap-2">
                  <HelpCircle className="mt-0.5 size-4 shrink-0 text-vx-red" />
                  <div className="min-w-0 flex-1">
                    <p className="vx-mono text-[11px] font-bold tracking-[0.06em] text-rose-50">
                      {faq.question}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Naikkan urutan"
                      onClick={() => handleMove(faq._id, "up")}
                      className="size-7 text-muted-foreground hover:bg-vx-red/10 hover:text-rose-100"
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Turunkan urutan"
                      onClick={() => handleMove(faq._id, "down")}
                      className="size-7 text-muted-foreground hover:bg-vx-red/10 hover:text-rose-100"
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit FAQ ${faq.question}`}
                      onClick={() => setEditingId(faq._id)}
                      className="size-7 text-muted-foreground hover:bg-vx-red/10 hover:text-rose-100"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Hapus FAQ"
                      onClick={() => handleRemove(faq._id)}
                      className="size-7 text-muted-foreground hover:bg-vx-red/10 hover:text-vx-red"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {editingId === faq._id && (
                  <form
                    onSubmit={handleUpdate}
                    className="mt-3 space-y-3 border border-vx-red/30 bg-[#0a0509] p-4"
                  >
                    <label className="block space-y-2">
                      <span className="vx-label block">// PERTANYAAN</span>
                      <Input
                        name="question"
                        required
                        minLength={5}
                        maxLength={160}
                        defaultValue={faq.question}
                        disabled={isSaving}
                        className="vx-mono vx-cut-sm h-11 border-vx-red/25 bg-[#050407] text-sm focus-visible:border-vx-red/70"
                      />
                    </label>
                    <label className="block space-y-2">
                      <span className="vx-label block">// JAWABAN</span>
                      <Textarea
                        name="answer"
                        rows={3}
                        required
                        minLength={5}
                        maxLength={600}
                        defaultValue={faq.answer}
                        disabled={isSaving}
                        className="vx-mono vx-cut-sm border-vx-red/25 bg-[#050407] text-sm focus-visible:border-vx-red/70"
                      />
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="vx-cut vx-mono gap-2 text-[11px] tracking-[0.2em]"
                      >
                        <Save className="size-4" />
                        SIMPAN
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                        disabled={isSaving}
                        className="vx-cut vx-mono border-vx-red/35 bg-transparent gap-2 text-[11px] tracking-[0.18em] text-rose-100 hover:bg-vx-red/10 hover:text-white"
                      >
                        <X className="size-4" />
                        BATAL
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
