import { v } from "convex/values";
import {
  mutation,
  query,
  type MutationCtx,
} from "./_generated/server";
import { requireOperator } from "./operators";

export const DEFAULT_PAYMENT_METHODS = [
  "BCA",
  "DANA",
  "GOPAY",
  "OVO",
  "SHOPEEPAY",
];

const DEFAULT_PAYMENT_NOTE =
  "Kirim bukti pembayaran ke WhatsApp admin. QRIS bisa di-scan langsung dari halaman ini.";

/** Public payment info rendered on the landing page. */
export const get = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();
    return {
      paymentMethods: settings?.paymentMethods ?? [
        ...DEFAULT_PAYMENT_METHODS,
        "QRIS",
      ],
      paymentNote: settings?.paymentNote ?? DEFAULT_PAYMENT_NOTE,
      qrisUrl: settings?.qrisImageId
        ? await ctx.storage.getUrl(settings.qrisImageId)
        : null,
    };
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireOperator(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

async function ensureSettings(ctx: MutationCtx) {
  const existing = await ctx.db.query("settings").first();
  if (existing) return existing;
  const id = await ctx.db.insert("settings", {
    paymentMethods: [...DEFAULT_PAYMENT_METHODS, "QRIS"],
    paymentNote: DEFAULT_PAYMENT_NOTE,
    updatedAt: Date.now(),
  });
  const created = await ctx.db.get(id);
  if (!created) throw new Error("Gagal membuat pengaturan toko.");
  return created;
}

export const setQris = mutation({
  args: { imageId: v.union(v.id("_storage"), v.null()) },
  handler: async (ctx, args) => {
    await requireOperator(ctx);

    const settings = await ensureSettings(ctx);
    const previous = settings.qrisImageId;

    await ctx.db.patch(settings._id, {
      qrisImageId: args.imageId ?? undefined,
      updatedAt: Date.now(),
    });

    if (previous && previous !== args.imageId) {
      await ctx.storage.delete(previous);
    }
    return null;
  },
});

export const updatePayment = mutation({
  args: { paymentMethods: v.string(), paymentNote: v.string() },
  handler: async (ctx, args) => {
    await requireOperator(ctx);

    const settings = await ensureSettings(ctx);
    const methods = args.paymentMethods
      .split(",")
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean)
      .slice(0, 12);

    await ctx.db.patch(settings._id, {
      paymentMethods: methods.length > 0 ? methods : [...DEFAULT_PAYMENT_METHODS],
      paymentNote: args.paymentNote.trim().slice(0, 240),
      updatedAt: Date.now(),
    });
    return null;
  },
});
