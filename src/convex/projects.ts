import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const MAX_PROJECTS = 12;

export const projectStatus = v.union(
  v.literal("online"),
  v.literal("beta"),
  v.literal("locked"),
);

const progressFor = (status: "online" | "beta" | "locked") =>
  status === "online" ? 94 : status === "beta" ? 61 : 27;

/** Projects of the currently signed in operator. */
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];
    return await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    tagline: v.string(),
    stack: v.string(),
    status: projectStatus,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const name = args.name.trim();
    if (name.length < 2) throw new Error("Nama project minimal 2 karakter.");

    const existing = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    if (existing.length >= MAX_PROJECTS) {
      throw new Error(`Maksimal ${MAX_PROJECTS} project per operator.`);
    }

    return await ctx.db.insert("projects", {
      userId,
      name: name.slice(0, 60),
      tagline: args.tagline.trim().slice(0, 160),
      stack: args.stack
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 6),
      status: args.status,
      progress: progressFor(args.status),
      createdAt: Date.now(),
    });
  },
});

export const setStatus = mutation({
  args: { projectId: v.id("projects"), status: projectStatus },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project tidak ditemukan.");
    }
    await ctx.db.patch(args.projectId, {
      status: args.status,
      progress: progressFor(args.status),
    });
    return null;
  },
});

export const remove = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project tidak ditemukan.");
    }
    await ctx.db.delete(args.projectId);
    return null;
  },
});
