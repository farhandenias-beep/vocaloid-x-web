import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { isOperatorEmail } from "./operatorEmails";

type AuthCtx = QueryCtx | MutationCtx;

/**
 * Returns the owner's userId, or null when the caller is signed out, a guest,
 * or signed in with an email that is not in OPERATOR_EMAILS.
 */
export async function getOperatorId(ctx: AuthCtx) {
  const userId = await getAuthUserId(ctx);
  if (userId === null) return null;
  const user = await ctx.db.get(userId);
  return isOperatorEmail(user?.email) ? userId : null;
}

/** Throws unless the caller is signed in as the store owner. */
export async function requireOperator(ctx: AuthCtx) {
  const userId = await getOperatorId(ctx);
  if (userId === null) throw new Error("Akses operator ditolak.");
  return userId;
}
