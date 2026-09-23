import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const MAX_PRODUCTS = 40;

export const productStatus = v.union(
  v.literal("available"),
  v.literal("sold_out"),
  v.literal("coming_soon"),
);

const seedDefaults: {
  name: string;
  category: string;
  tagline: string;
  price: number;
  duration: string;
  features: string[];
  status: "available" | "sold_out" | "coming_soon";
  badge?: string;
}[] = [
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

/** Public catalogue rendered on the landing page. */
export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").withIndex("by_sort").take(MAX_PRODUCTS);
  },
});

/** Catalogue owned by the signed in operator. */
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    tagline: v.string(),
    price: v.number(),
    duration: v.string(),
    features: v.string(),
    status: productStatus,
    badge: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const name = args.name.trim();
    if (name.length < 2) throw new Error("Nama paket minimal 2 karakter.");
    if (!Number.isFinite(args.price) || args.price < 0) {
      throw new Error("Harga tidak valid.");
    }

    const existing = await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    if (existing.length >= MAX_PRODUCTS) {
      throw new Error(`Maksimal ${MAX_PRODUCTS} paket.`);
    }

    return await ctx.db.insert("products", {
      userId,
      name: name.slice(0, 60),
      category: (args.category.trim() || "CHEAT PC").slice(0, 40),
      tagline: args.tagline.trim().slice(0, 220),
      price: Math.round(args.price),
      duration: (args.duration.trim() || "30 HARI").slice(0, 40),
      features: args.features
        .split("\n")
        .flatMap((line) => line.split(","))
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 8),
      status: args.status,
      badge: args.badge?.trim() ? args.badge.trim().slice(0, 20) : undefined,
      sortOrder: Date.now(),
      createdAt: Date.now(),
    });
  },
});

export const setStatus = mutation({
  args: { productId: v.id("products"), status: productStatus },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const product = await ctx.db.get(args.productId);
    if (!product || product.userId !== userId) {
      throw new Error("Paket tidak ditemukan.");
    }
    await ctx.db.patch(args.productId, { status: args.status });
    return null;
  },
});

export const remove = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const product = await ctx.db.get(args.productId);
    if (!product || product.userId !== userId) {
      throw new Error("Paket tidak ditemukan.");
    }
    await ctx.db.delete(args.productId);
    return null;
  },
});

/** Loads the starter catalogue for operators with an empty store. */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("products")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const taken = new Set(existing.map((product) => product.name));

    let inserted = 0;
    for (const [index, item] of seedDefaults.entries()) {
      if (taken.has(item.name)) continue;
      await ctx.db.insert("products", {
        userId,
        name: item.name,
        category: item.category,
        tagline: item.tagline,
        price: item.price,
        duration: item.duration,
        features: item.features,
        status: item.status,
        badge: item.badge,
        sortOrder: Date.now() + index,
        createdAt: Date.now(),
      });
      inserted += 1;
    }

    return inserted;
  },
});
