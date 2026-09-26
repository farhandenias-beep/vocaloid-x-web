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

    const inserted = await ctx.db.insert("orders", {
      name: name.slice(0, 80),
      contact: contact.slice(0, 40),
      productName: productName.slice(0, 80),
      price: Math.round(args.price),
      note: args.note?.trim() ? args.note.trim().slice(0, 500) : undefined,
      status: "new",
      createdAt: Date.now(),
    });

    // Short public tracking code derived from the document id, e.g. VX-8KQ2.
    const idTail = inserted
      .slice(-6)
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .padEnd(4, "7")
      .slice(0, 4);
    const orderCode = `VX-${idTail}`;
    await ctx.db.patch(inserted, { orderCode });

    return { ok: true as const, orderCode };
  },
});

/** Public: buyer tracks their order status with the code from checkout. */
export const publicStatus = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const code = args.code.trim().toUpperCase();
    if (!code) throw new Error("Masukkan kode order.");

    const order = await ctx.db
      .query("orders")
      .withIndex("by_code", (q) => q.eq("orderCode", code))
      .unique();

    // null = not found; the client renders a friendly retry message.
    if (!order) return null;

    return {
      orderCode: order.orderCode ?? code,
      productName: order.productName,
      price: order.price,
      status: order.status,
      createdAt: order.createdAt,
    };
  },
});

/** Sales statistics for the operator dashboard. */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getOperatorId(ctx);
    if (userId === null) return null;

    const orders = await ctx.db.query("orders").order("desc").take(1000);
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    ).getTime();

    let doneRevenue = 0;
    let doneCount = 0;
    let pendingRevenue = 0;
    let pendingCount = 0;
    let todayCount = 0;
    let todayRevenue = 0;

    const dayBuckets = new Map<string, { count: number; revenue: number }>();
    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      dayBuckets.set(day.toDateString(), { count: 0, revenue: 0 });
    }

    const productBuckets = new Map<string, { count: number; revenue: number }>();

    for (const order of orders) {
      if (order.status === "done") {
        doneRevenue += order.price;
        doneCount += 1;
      } else {
        pendingRevenue += order.price;
        pendingCount += 1;
      }

      if (order.createdAt >= startOfToday) {
        todayCount += 1;
        todayRevenue += order.price;
      }

      const bucket = dayBuckets.get(new Date(order.createdAt).toDateString());
      if (bucket) {
        bucket.count += 1;
        bucket.revenue += order.price;
      }

      const product = productBuckets.get(order.productName) ?? {
        count: 0,
        revenue: 0,
      };
      product.count += 1;
      product.revenue += order.price;
      productBuckets.set(order.productName, product);
    }

    const last7Days = [...dayBuckets.entries()].map(([date, value]) => {
      const day = new Date(date);
      return {
        label: day.toLocaleDateString("id-ID", { weekday: "short" }),
        count: value.count,
        revenue: value.revenue,
      };
    });

    const topProducts = [...productBuckets.entries()]
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => b.count - a.count || b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalOrders: orders.length,
      doneCount,
      pendingCount,
      doneRevenue,
      pendingRevenue,
      todayCount,
      todayRevenue,
      last7Days,
      topProducts,
    };
  },
});

function csvCell(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** CSV export of all orders for bookkeeping (operator only). */
export const exportCsv = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getOperatorId(ctx);
    if (userId === null) return null;

    const orders = await ctx.db.query("orders").order("desc").take(1000);
    const header = [
      "KODE",
      "TANGGAL",
      "NAMA",
      "KONTAK",
      "PAKET",
      "HARGA",
      "STATUS",
      "CATATAN",
    ];
    const rows = orders.map((order) =>
      [
        order.orderCode ?? "",
        new Date(order.createdAt).toLocaleString("id-ID"),
        order.name,
        order.contact,
        order.productName,
        order.price,
        order.status === "new" ? "BARU" : "SELESAI",
        order.note ?? "",
      ]
        .map(csvCell)
        .join(","),
    );

    const stamp = new Date().toISOString().slice(0, 10);
    return {
      filename: `vocaloid-x-orders-${stamp}.csv`,
      csv: `\uFEFF${[header.join(","), ...rows].join("\n")}`,
    };
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
