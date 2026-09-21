import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Removes Convex transport noise so thrown messages can be shown to users. */
export function formatConvexError(
  error: unknown,
  fallback = "Terjadi kesalahan. Coba lagi.",
) {
  const raw = error instanceof Error ? error.message : "";
  const match = /Uncaught Error: ([\s\S]*)$/.exec(raw);
  return (match?.[1] ?? raw).trim() || fallback;
}
