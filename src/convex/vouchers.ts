import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { requireOperator } from "./operators";

/** Public: list active, non-expired vouchers so checkout can validate live. */
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("vouchers").collect();
    const now = Date.now();
    return all
      .filter(
        (voucher) =>
          voucher.active &&
          (!voucher.expiresAt || voucher.expiresAt > now) &&
          (voucher.maxUses === undefined || voucher.usedCount < voucher.maxUses),
      )
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((voucher) => ({ code: voucher.code, percentOff: voucher.percentOff }));
  },
});

/** Shared validation logic used by both the reactive query and the form check. */
async function resolveVoucher(ctx: QueryCtx, rawCode: string, price: number) {
  const code = rawCode.trim().toUpperCase();
  const rounded = Math.round(price);

  if (!code) throw new Error("Masukkan kode voucher.");
  if (!Number.isFinite(rounded) || rounded <= 0) {
    throw new Error("Harga tidak valid.");
  }

  const voucher = await ctx.db
    .query("vouchers")
    .withIndex("by_code", (q) => q.eq("code", code))
    .unique();

  if (!voucher || !voucher.active) {
    throw new Error("Kode voucher tidak valid atau sudah nonaktif.");
  }
  if (voucher.expiresAt && voucher.expiresAt <= Date.now()) {
    throw new Error("Voucher sudah kedaluwarsa.");
  }
  if (voucher.maxUses !== undefined && voucher.usedCount >= voucher.maxUses) {
    throw new Error("Kuota voucher sudah habis.");
  }

  const finalPrice = Math.max(
    0,
    Math.round(rounded * (1 - voucher.percentOff / 100)),
  );
  return { code: voucher.code, percentOff: voucher.percentOff, finalPrice };
}

/** Public: validate a voucher code and return the discounted price. */
export const validate = query({
  args: { code: v.string(), price: v.number() },
  handler: async (ctx, args) => resolveVoucher(ctx, args.code, args.price),
});

/** Public: imperative check used by the checkout form so errors are catchable. */
export const check = mutation({
  args: { code: v.string(), price: v.number() },
  handler: async (ctx, args) => resolveVoucher(ctx, args.code, args.price),
});

/** Public: count one redemption after a successful order. */
export const redeem = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const code = args.code.trim().toUpperCase();
    const voucher = await ctx.db
      .query("vouchers")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    if (!voucher || !voucher.active) return null;

    await ctx.db.patch(voucher._id, {
      usedCount: voucher.usedCount + 1,
    });
    return null;
  },
});

/** Console list for the operator. */
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    await requireOperator(ctx);
    return await ctx.db
      .query("vouchers")
      .order("desc")
      .take(60);
  },
});

export const create = mutation({
  args: {
    code: v.string(),
    percentOff: v.number(),
    maxUses: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireOperator(ctx);

    const code = args.code.trim().toUpperCase();
    if (code.length < 3 || code.length > 16) {
      throw new Error("Kode voucher harus 3-16 karakter.");
    }
    if (!/^[A-Z0-9]+$/.test(code)) {
      throw new Error("Kode hanya boleh huruf dan angka.");
    }
    if (!Number.isFinite(args.percentOff) || args.percentOff < 1 || args.percentOff > 90) {
      throw new Error("Diskon harus 1-90 persen.");
    }
    if (args.maxUses !== undefined && (!Number.isFinite(args.maxUses) || args.maxUses < 1)) {
      throw new Error("Batas pemakaian tidak valid.");
    }

    const existing = await ctx.db
      .query("vouchers")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    if (existing) throw new Error("Kode voucher sudah dipakai.");

    await ctx.db.insert("vouchers", {
      code,
      percentOff: Math.round(args.percentOff),
      active: true,
      maxUses: args.maxUses,
      usedCount: 0,
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
    });
    return null;
  },
});

export const update = mutation({
  args: {
    voucherId: v.id("vouchers"),
    active: v.boolean(),
    percentOff: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireOperator(ctx);

    const voucher = await ctx.db.get(args.voucherId);
    if (!voucher) throw new Error("Voucher tidak ditemukan.");

    const patch: Record<string, unknown> = { active: args.active };
    if (args.percentOff !== undefined) {
      if (
        !Number.isFinite(args.percentOff) ||
        args.percentOff < 1 ||
        args.percentOff > 90
      ) {
        throw new Error("Diskon harus 1-90 persen.");
      }
      patch.percentOff = Math.round(args.percentOff);
    }

    await ctx.db.patch(args.voucherId, patch);
    return null;
  },
});

export const remove = mutation({
  args: { voucherId: v.id("vouchers") },
  handler: async (ctx, args) => {
    await requireOperator(ctx);
    await ctx.db.delete(args.voucherId);
    return null;
  },
});
