/** Brand + storefront configuration for the VOCALOID-X store. */

export const BRAND_NAME = "VOCALOID-X";
export const DEVELOPER_NAME = "FRHANLVLY";

export const STORE_TAGLINE = "CHEAT × SETTING FF PC";
export const STORE_CITY = "Subang, Jawa Barat";

export const SUPPORT_EMAIL = "order@vocaloid-x.store";

/** Nomor WhatsApp toko. Format bebas: 0812..., +62 812..., atau 62812... */
export const WHATSAPP_NUMBER = "6285157553002";

/** Nomor yang ditampilkan di halaman (boleh berbeda format dari di atas). */
export const WHATSAPP_LABEL = "+62 851-5755-3002";

/** Accepts 0812..., +62 812..., 62 812... and returns 62812... for wa.me links. */
export function normalizeWhatsApp(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  return digits;
}

export const OPERATIONAL_HOURS = "10:00 - 23:00 WIB";

/** Builds a wa.me deep link with a prefilled message. */
export function whatsappUrl(message: string) {
  return `https://wa.me/${normalizeWhatsApp(WHATSAPP_NUMBER)}?text=${encodeURIComponent(message)}`;
}

/** Pembuka otomatis pada setiap chat order ke WhatsApp toko. */
export const ORDER_INTRO = "Bang mau order";

/** Link sosial media toko. Ganti dengan URL profil asli milikmu. */
export const INSTAGRAM_URL = "https://instagram.com";

export const YOUTUBE_URL = "https://youtube.com";

/** Contoh: "https://www.tiktok.com/@username". Kosongkan untuk menyembunyikan. */
export const TIKTOK_URL = "https://www.tiktok.com/@frhanlvly0";
