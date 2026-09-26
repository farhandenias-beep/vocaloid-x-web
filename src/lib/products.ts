import {
  ORDER_INTRO,
  WHATSAPP_NUMBER,
  normalizeWhatsApp,
} from "@/lib/brand";

export type ProductStatus = "available" | "sold_out" | "coming_soon";

/** Shape consumed by the storefront cards and the operator console. */
export type StoreProduct = {
  _id?: string;
  name: string;
  category: string;
  tagline: string;
  price: number;
  duration: string;
  features: string[];
  status: ProductStatus;
  badge?: string;
  /** Flash sale: crossed-out original price shown next to the promo price. */
  compareAtPrice?: number;
  /** Live availability note shown on the storefront card, e.g. "SLOT 8/10". */
  stockNote?: string;
};

/** Percentage discount of a flash-sale product, e.g. "HEMAT 35%". */
export function discountPercent(product: {
  price: number;
  compareAtPrice?: number;
}) {
  if (!product.compareAtPrice || product.compareAtPrice <= product.price) return 0;
  return Math.round(
    ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
  );
}

export const PRODUCT_STATUSES: ProductStatus[] = [
  "available",
  "sold_out",
  "coming_soon",
];

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  available: "TERSEDIA",
  sold_out: "STOK HABIS",
  coming_soon: "SEGERA",
};

export const PRODUCT_STATUS_STYLES: Record<ProductStatus, string> = {
  available: "border-[#4ade80]/40 text-[#7dffb0] bg-[#4ade80]/10",
  sold_out: "border-vx-red/35 text-vx-red bg-vx-red/10",
  coming_soon: "border-vx-ember/40 text-vx-ember bg-vx-ember/10",
};

export const PRODUCT_STATUS_CYCLE: Record<ProductStatus, ProductStatus> = {
  available: "sold_out",
  sold_out: "coming_soon",
  coming_soon: "available",
};

export const PRODUCT_CATEGORIES = ["CHEAT PC", "SETTING EMULATOR", "BUNDLE"];

export function formatIDR(value: number) {
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`;
}

/** Prefilled WhatsApp text for a single package. */
export function productOrderMessage(product: StoreProduct) {
  return [
    `${ORDER_INTRO} paket ini:`,
    "",
    `• Paket    : ${product.name}`,
    `• Kategori : ${product.category}`,
    `• Durasi   : ${product.duration}`,
    `• Harga    : ${formatIDR(product.price)}`,
    product.compareAtPrice && product.compareAtPrice > product.price
      ? `• Harga normal: ${formatIDR(product.compareAtPrice)} (promo flash sale)`
      : "",
    "",
    "Mohon info langkah selanjutnya ya. Terima kasih!",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Prefilled WhatsApp text for a free-form order request. */
export function customOrderMessage({
  name,
  productName,
  price,
  note,
}: {
  name: string;
  productName: string;
  price?: number;
  note?: string;
}) {
  return [
    `${ORDER_INTRO}.`,
    "",
    `• Nama   : ${name}`,
    productName ? `• Paket  : ${productName}` : "",
    price ? `• Harga  : ${formatIDR(price)}` : "",
    note ? `• Catatan: ${note}` : "",
    "",
    "Mohon dibantu prosesnya ya. Terima kasih!",
  ]
    .filter(Boolean)
    .join("\n");
}

export function whatsappContactLink(message?: string) {
  const text = message ?? `${ORDER_INTRO} paket FF PC, boleh minta info dulu?`;
  return `https://wa.me/${normalizeWhatsApp(WHATSAPP_NUMBER)}?text=${encodeURIComponent(text)}`;
}

/** Starter catalogue: used to seed the store and shown while it is empty. */
export const DEFAULT_PRODUCTS: StoreProduct[] = [
  {
    name: "VOCALOID-X TRYOUT",
    category: "CHEAT PC",
    tagline:
      "Paket uji coba 1 hari untuk memastikan cheat cocok dengan device dan emulator Anda.",
    price: 15000,
    duration: "1 HARI",
    badge: "COBA DULU",
    status: "available",
    features: [
      "Aimbot smooth & humanized",
      "ESP player + loot",
      "Radar / mini map hack",
      "Anti-banned dasar",
      "Panduan instal lengkap",
    ],
  },
  {
    name: "VOCALOID-X WEEKLY",
    category: "CHEAT PC",
    tagline:
      "Paket favorit para push rank mingguan dengan update signature paling cepat.",
    price: 65000,
    duration: "7 HARI",
    badge: "TERPOPULER",
    status: "available",
    features: [
      "Semua fitur paket tryout",
      "Auto headshot + magic bullet",
      "No recoil & no spread",
      "Speed / fly mode aman",
      "Update signature harian",
      "Support prioritas 24 jam",
    ],
  },
  {
    name: "VOCALOID-X MONTHLY",
    category: "CHEAT PC",
    tagline:
      "Akses penuh sebulan dengan build terbaru dan prioritas update setiap patch game.",
    price: 180000,
    duration: "30 HARI",
    badge: "BEST VALUE",
    status: "available",
    features: [
      "Semua fitur paket weekly",
      "Akses build terbaru lebih dulu",
      "Config profil custom",
      "Auto update saat patch FF",
      "Garansi reset saat update",
      "Support private chat",
    ],
  },
  {
    name: "VOCALOID-X PRIVATE",
    category: "CHEAT PC",
    tagline:
      "Build privat dengan slot terbatas, dibangun khusus agar aman untuk akun utama.",
    price: 350000,
    duration: "30 HARI",
    badge: "LIMITED",
    status: "available",
    features: [
      "Slot terbatas 10 user / bulan",
      "Signature privat (tidak publik)",
      "Loader khusus per device",
      "Anti-banned tingkat lanjut",
      "Konsultasi config 1-on-1",
      "Prioritas rilis update",
    ],
  },
  {
    name: "SETTING EMULATOR PRO",
    category: "SETTING EMULATOR",
    tagline:
      "Setingan Gameloop / BlueStacks anti lag: sensi, DPI, grafis, dan config background.",
    price: 25000,
    duration: "LIFETIME",
    badge: "NO LAG",
    status: "available",
    features: [
      "Preset sensitivitas + DPI",
      "Config engine emulator",
      "Optimasi 180-240 FPS stabil",
      "Tweak grafis & memori",
      "Panduan gambar langkah demi langkah",
      "Update gratis tanpa batas",
    ],
  },
  {
    name: "BUNDLE SETUP FULL",
    category: "BUNDLE",
    tagline:
      "Kombinasi setingan emulator + cheat weekly, langsung diracik sampai siap push rank.",
    price: 85000,
    duration: "7 HARI",
    badge: "HEMAT 5RB",
    status: "available",
    features: [
      "Setting emulator lengkap",
      "Cheat PC paket weekly",
      "Remote setup via AnyDesk",
      "Tuning sensi sesuai device",
      "Konsultasi sampai nyaman",
    ],
  },
];
