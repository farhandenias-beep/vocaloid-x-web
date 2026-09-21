import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Receives a contact message from the public landing page. */
export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const email = args.email.trim().toLowerCase();
    const message = args.message.trim();

    if (name.length < 2) throw new Error("Nama minimal 2 karakter.");
    if (!EMAIL_PATTERN.test(email)) throw new Error("Format email tidak valid.");
    if (message.length < 10) throw new Error("Pesan minimal 10 karakter.");

    const recent = await ctx.db
      .query("transmissions")
      .withIndex("by_email", (q) => q.eq("email", email))
      .order("desc")
      .take(1);

    if (recent[0] && Date.now() - recent[0].createdAt < 45_000) {
      throw new Error("Transmisi terakhir masih diproses. Coba lagi sebentar.");
    }

    await ctx.db.insert("transmissions", {
      name: name.slice(0, 80),
      email: email.slice(0, 160),
      message: message.slice(0, 1500),
      status: "new",
      createdAt: Date.now(),
    });

    return { ok: true as const };
  },
});

/** Inbox for the signed in operator. */
export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db.query("transmissions").order("desc").take(25);
  },
});

export const markRead = mutation({
  args: { transmissionId: v.id("transmissions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    await ctx.db.patch(args.transmissionId, { status: "read" });
    return null;
  },
});
