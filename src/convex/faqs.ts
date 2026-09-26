import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireOperator } from "./operators";

/** Public: FAQ list shown in the landing accordion (falls back client-side). */
export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("faqs")
      .withIndex("by_sort")
      .order("asc")
      .take(20);
    return rows;
  },
});

/** Console list for the operator (no cap). */
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    await requireOperator(ctx);
    return await ctx.db.query("faqs").withIndex("by_sort").order("asc").take(60);
  },
});

export const create = mutation({
  args: { question: v.string(), answer: v.string() },
  handler: async (ctx, args) => {
    await requireOperator(ctx);

    const question = args.question.trim();
    const answer = args.answer.trim();
    if (question.length < 5) throw new Error("Pertanyaan minimal 5 karakter.");
    if (answer.length < 5) throw new Error("Jawaban minimal 5 karakter.");

    const all = await ctx.db.query("faqs").collect();
    const maxSort = all.reduce((max, item) => Math.max(max, item.sortOrder), 0);

    await ctx.db.insert("faqs", {
      question: question.slice(0, 160),
      answer: answer.slice(0, 600),
      sortOrder: maxSort + 1,
      createdAt: Date.now(),
    });
    return null;
  },
});

export const update = mutation({
  args: { faqId: v.id("faqs"), question: v.string(), answer: v.string() },
  handler: async (ctx, args) => {
    await requireOperator(ctx);

    const faq = await ctx.db.get(args.faqId);
    if (!faq) throw new Error("FAQ tidak ditemukan.");

    const question = args.question.trim();
    const answer = args.answer.trim();
    if (question.length < 5) throw new Error("Pertanyaan minimal 5 karakter.");
    if (answer.length < 5) throw new Error("Jawaban minimal 5 karakter.");

    await ctx.db.patch(args.faqId, {
      question: question.slice(0, 160),
      answer: answer.slice(0, 600),
    });
    return null;
  },
});

export const remove = mutation({
  args: { faqId: v.id("faqs") },
  handler: async (ctx, args) => {
    await requireOperator(ctx);
    await ctx.db.delete(args.faqId);
    return null;
  },
});

export const move = mutation({
  args: { faqId: v.id("faqs"), direction: v.union(v.literal("up"), v.literal("down")) },
  handler: async (ctx, args) => {
    await requireOperator(ctx);

    const all = await ctx.db
      .query("faqs")
      .withIndex("by_sort")
      .order("asc")
      .take(60);
    const index = all.findIndex((item) => item._id === args.faqId);
    if (index === -1) return null;

    const swapWith =
      args.direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= all.length) return null;

    const current = all[index];
    const target = all[swapWith];
    await ctx.db.patch(current._id, { sortOrder: target.sortOrder });
    await ctx.db.patch(target._id, { sortOrder: current.sortOrder });
    return null;
  },
});
