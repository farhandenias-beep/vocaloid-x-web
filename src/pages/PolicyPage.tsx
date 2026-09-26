import { HudPanel, SectionLabel } from "@/components/vocaloid/hud";
import { LogoLockup } from "@/components/vocaloid/logo-mark";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DEVELOPER_NAME, WHATSAPP_LABEL, whatsappUrl } from "@/lib/brand";
import { ArrowLeft, MessageCircle, ScrollText, ShieldCheck } from "lucide-react";
import { Link } from "react-router";

const POLICY_SECTIONS: {
  id: string;
  title: string;
  summary: string;
  points: string[];
}[] = [
  {
    id: "syarat",
    title: "SYARAT & KETENTUAN",
    summary:
      "Aturan dasar yang berlaku untuk setiap pembelian produk digital VOCALOID-X.",
    points: [
      "Pembeli wajib mengisi form order dengan data yang benar (nama dan nomor WhatsApp aktif).",
      "Produk digital bersifat lisensi pakai per perangkat — dilarang dijual ulang atau dibagikan ke pihak lain.",
      "Admin berhak menolak atau membatalkan order bila terindikasi penyalahgunaan.",
      "Order diproses setelah pembayaran diverifikasi, rata-rata di bawah 5 menit pada jam operasional.",
    ],
  },
  {
    id: "pembayaran",
    title: "KEBIJAKAN PEMBAYARAN",
    summary:
      "Metode pembayaran resmi dan aturan konfirmasi pembayaran toko.",
    points: [
      "Pembayaran hanya ke rekening / e-wallet / QRIS resmi yang dikirim admin di chat WhatsApp.",
      "Harga yang tertera di landing page sudah final — voucher promo berlaku sesuai ketentuan yang berlaku saat order.",
      "Bukti pembayaran dikirim ke chat WhatsApp yang sama dengan order.",
      "Hati-hati penipuan: VOCALOID-X tidak pernah meminta pembayaran ke nomor selain yang dikirim admin resmi.",
    ],
  },
  {
    id: "refund",
    title: "GARANSI & REFUND",
    summary:
      "Kondisi ketika pembeli berhak minta ganti atau dana kembali.",
    points: [
      "Garansi berlaku jika produk tidak dapat dijalankan setelah dibantu instalasi oleh admin.",
      "Refund penuh berlaku bila masalah berlanjut dan tidak bisa diperbaiki dalam 1×24 jam.",
      "Refund TIDAK berlaku untuk salah beli, perangkat tidak memenuhi syarat, atau pelanggaran aturan penggunaan.",
      "Banned akun akibat penggunaan di luar panduan berada di luar cakupan garansi.",
    ],
  },
  {
    id: "privasi",
    title: "KEBIJAKAN PRIVASI",
    summary:
      "Bagaimana data pembeli ditangani di platform toko ini.",
    points: [
      "Data order (nama, nomor WhatsApp, paket) hanya dipakai untuk memproses pesanan.",
      "Data tidak dijual atau dibagikan ke pihak ketiga di luar keperluan pengiriman produk.",
      "Pembeli bisa minta penghapusan data order dengan chat admin.",
      "Konsol toko hanya bisa diakses owner VOCALOID-X (operator terverifikasi).",
    ],
  },
];

export default function PolicyPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="vx-grid pointer-events-none fixed inset-0 opacity-25" />

      <header className="sticky top-0 z-40 border-b border-vx-red/20 bg-[#07040a]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1100px] items-center gap-4 px-5 sm:px-8">
          <Link to="/" className="shrink-0">
            <LogoLockup markClassName="h-7 w-7" className="[&_span]:text-base" />
          </Link>
          <span className="vx-label hidden sm:inline">// KEBIJAKAN TOKO</span>
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
        <SectionLabel>// LEGAL</SectionLabel>
        <h1 className="mt-4 font-display text-3xl font-black uppercase sm:text-4xl">
          KEBIJAKAN &amp; <span className="vx-glow text-vx-red">KETENTUAN</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Ringkasan aturan main bertransaksi di VOCALOID-X — dibuat seperlunya
          agar jelas, tanpa bahasa hukum yang membingungkan.
        </p>

        <div className="mt-9 grid gap-6 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            {POLICY_SECTIONS.map((section) => (
              <HudPanel
                key={section.id}
                label={`// ${section.title}`}
                bodyClassName="p-5"
              >
                <p className="text-sm leading-relaxed text-rose-100/80">
                  {section.summary}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {section.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-vx-red" />
                      <span className="vx-mono text-[11px] leading-5 text-muted-foreground">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </HudPanel>
            ))}
          </div>

          <div className="space-y-5 lg:col-span-5">
            <HudPanel label="// RINGKASAN CEPAT" bodyClassName="px-5 py-5">
              <div className="flex items-center gap-3">
                <ScrollText className="size-5 shrink-0 text-vx-red" />
                <p className="vx-mono text-[11px] leading-5 text-muted-foreground">
                  Intinya: bayar sesuai instruksi admin resmi, pakai produknya
                  sesuai panduan, dan garansi tetap aktif selama aturan
                  dipatuhi.
                </p>
              </div>
            </HudPanel>

            <HudPanel label="// BUTUH BANTUAN?" bodyClassName="p-5">
              <p className="vx-mono text-[11px] leading-5 text-muted-foreground">
                Ada pertanyaan soal kebijakan ini atau kondisi order Anda?
                Admin siap menjelaskan langsung.
              </p>
              <Button
                asChild
                className="vx-cut vx-mono mt-4 w-full gap-2 text-[11px] tracking-[0.2em]"
              >
                <a
                  href={whatsappUrl(
                    "Bang, mau tanya soal kebijakan toko VOCALOID-X.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-4" />
                  CHAT ADMIN ({WHATSAPP_LABEL})
                </a>
              </Button>
            </HudPanel>

            <HudPanel label="// DOKUMEN INI" bodyClassName="px-5 py-5">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="info" className="border-vx-red/15">
                  <AccordionTrigger className="vx-mono text-left text-[11px] tracking-[0.14em] text-rose-50 hover:no-underline">
                    Berlaku sejak kapan?
                  </AccordionTrigger>
                  <AccordionContent className="text-[12px] leading-5 text-muted-foreground">
                    Kebijakan ini berlaku untuk semua order sepanjang tahun
                    berjalan. Perubahan material akan diumumkan di halaman ini.
                    Dikelola oleh {DEVELOPER_NAME} untuk VOCALOID-X.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="gavel" className="border-vx-red/15">
                  <AccordionTrigger className="vx-mono text-left text-[11px] tracking-[0.14em] text-rose-50 hover:no-underline">
                    Ada sengketa?
                  </AccordionTrigger>
                  <AccordionContent className="text-[12px] leading-5 text-muted-foreground">
                    Semua kendala diselesaikan kekeluargaan lewat chat WhatsApp
                    admin terlebih dahulu sebelum langkah lain diambil.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </HudPanel>
          </div>
        </div>
      </main>
    </div>
  );
}
