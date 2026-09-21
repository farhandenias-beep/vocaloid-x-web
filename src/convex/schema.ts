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

    // projects published by the signed in operator (VOCALOID-X console)
    projects: defineTable({
      userId: v.id("users"),
      name: v.string(),
      tagline: v.string(),
      stack: v.array(v.string()),
      status: v.union(
        v.literal("online"),
        v.literal("beta"),
        v.literal("locked"),
      ),
      progress: v.number(),
      createdAt: v.number(),
    }).index("by_user", ["userId"]),

    // contact form messages sent from the landing page
    transmissions: defineTable({
      name: v.string(),
      email: v.string(),
      message: v.string(),
      status: v.union(v.literal("new"), v.literal("read")),
      createdAt: v.number(),
    })
      .index("by_email", ["email"])
      .index("by_status", ["status"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
