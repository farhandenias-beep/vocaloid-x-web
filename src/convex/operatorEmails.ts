/**
 * Daftar email yang boleh masuk ke console operator (OWNER ONLY).
 * Semua email ditulis lowercase karena perbandingan dilakukan case-insensitive.
 * Hapus / tambah baris di sini kalau mau mengubah siapa yang punya akses.
 */
export const OPERATOR_EMAILS = [
  "deniasfarhan7@gmail.com",
  "farhandenias@gmail.com",
];

/** true hanya untuk email owner yang terdaftar di atas. */
export function isOperatorEmail(email: unknown): boolean {
  if (typeof email !== "string") return false;
  return OPERATOR_EMAILS.includes(email.trim().toLowerCase());
}
