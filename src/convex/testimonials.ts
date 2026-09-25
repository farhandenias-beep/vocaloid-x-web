import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOperatorId, requireOperator } from "./operators";

const MAX_TESTIMONIALS = 30;

/** Testimonials rendered on the landing page. */
export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("testimonials")
      .withIndex("by_sort")
      .take(MAX_TESTIMONIALS);
  },
});

/** Manageable list for the operator console. */
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getOperatorId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("testimonials")
      .withIndex("by_sort")
      .take(MAX_TESTIMONIALS);
  },
});

export const create = mutation({
  args: {
    buyerName: v.string(),
    product: v.string(),
    message: v.string(),
    rating: v.number(),
    verified: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireOperator(ctx);

    const buyerName = args.buyerName.trim();
    const message = args.message.trim();
    if (buyerName.length < 2) throw new Error("Nama pembeli minimal 2 karakter.");
    if (message.length < 4) throw new Error("Pesan testimoni minimal 4 karakter.");
    const rating = Math.round(args.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      throw new Error("Rating harus 1 sampai 5.");
    }

    const total = await ctx.db
      .query("testimonials")
      .withIndex("by_sort")
      .take(MAX_TESTIMONIALS + 1);
    if (total.length > MAX_TESTIMONIALS) {
      throw new Error(`Maksimal ${MAX_TESTIMONIALS} testimoni.`);
    }

    await ctx.db.insert("testimonials", {
      buyerName: buyerName.slice(0, 40),
      product: args.product.trim().slice(0, 60),
      message: message.slice(0, 300),
      rating,
      verified: args.verified,
      sortOrder: -Date.now(), // terbaru tampil paling atas
      createdAt: Date.now(),
    });
    return null;
  },
});

export const remove = mutation({
  args: { testimonialId: v.id("testimonials") },
  handler: async (ctx, args) => {
    await requireOperator(ctx);
    await ctx.db.delete(args.testimonialId);
    return null;
  },
});
