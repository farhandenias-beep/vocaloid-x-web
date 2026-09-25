import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOperatorId, requireOperator } from "./operators";

/** Order request sent from the public landing page before the WhatsApp handoff. */
export const submit = mutation({
  args: {
    name: v.string(),
    contact: v.string(),
    productName: v.string(),
    price: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const contact = args.contact.trim();
    const productName = args.productName.trim();

    if (name.length < 2) throw new Error("Nama minimal 2 karakter.");
    if (contact.replace(/\D/g, "").length < 9) {
      throw new Error("Nomor WhatsApp tidak valid.");
    }
    if (!productName) throw new Error("Pilih paket yang ingin diorder.");
    if (!Number.isFinite(args.price) || args.price < 0) {
      throw new Error("Harga tidak valid.");
    }

    await ctx.db.insert("orders", {
      name: name.slice(0, 80),
      contact: contact.slice(0, 40),
      productName: productName.slice(0, 80),
      price: Math.round(args.price),
      note: args.note?.trim() ? args.note.trim().slice(0, 500) : undefined,
      status: "new",
      createdAt: Date.now(),
    });

    return { ok: true as const };
  },
});

/** Order inbox for the signed in operator. */
export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getOperatorId(ctx);
    if (userId === null) return [];
    return await ctx.db.query("orders").order("desc").take(40);
  },
});

export const setStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(v.literal("new"), v.literal("done")),
  },
  handler: async (ctx, args) => {
    await requireOperator(ctx);
    await ctx.db.patch(args.orderId, { status: args.status });
    return null;
  },
});

export const remove = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    await requireOperator(ctx);
    await ctx.db.delete(args.orderId);
    return null;
  },
});
