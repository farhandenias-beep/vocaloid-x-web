import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // digital products sold in the VOCALOID-X store, managed from the console
    products: defineTable({
      userId: v.id("users"),
      name: v.string(),
      category: v.string(),
      tagline: v.string(),
      price: v.number(),
      duration: v.string(),
      features: v.array(v.string()),
      status: v.union(
        v.literal("available"),
        v.literal("sold_out"),
        v.literal("coming_soon"),
      ),
      badge: v.optional(v.string()),
      // flash sale: original price crossed out on the storefront while promo runs
      compareAtPrice: v.optional(v.number()),
      sortOrder: v.number(),
      createdAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_sort", ["sortOrder"]),

    // store payment configuration (methods + QRIS image) for the landing page
    settings: defineTable({
      paymentMethods: v.array(v.string()),
      paymentNote: v.string(),
      qrisImageId: v.optional(v.id("_storage")),
      updatedAt: v.number(),
    }),

    // buyer testimonials curated by the owner, shown on the landing page
    testimonials: defineTable({
      buyerName: v.string(),
      product: v.string(),
      message: v.string(),
      rating: v.number(),
      verified: v.boolean(),
      sortOrder: v.number(),
      createdAt: v.number(),
    }).index("by_sort", ["sortOrder"]),

    // order intents captured from the landing page before WhatsApp handoff
    orders: defineTable({
      name: v.string(),
      contact: v.string(),
      productName: v.string(),
      price: v.number(),
      note: v.optional(v.string()),
      status: v.union(v.literal("new"), v.literal("done")),
      createdAt: v.number(),
    })
      .index("by_status", ["status"])
      .index("by_created", ["createdAt"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
