import { createHash, randomBytes } from "node:crypto";

/**
 * Token helpers, kept free of `server-only` and Prisma so the seed script and
 * the app can share exactly one hashing implementation.
 */

/** Ambiguous glyphs removed so generated passwords survive being read aloud. */
const PASSWORD_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%";

export function hashToken(raw: string): string {
  return createHash("sha256")
    .update(`${raw}${process.env.AUTH_SECRET ?? ""}`)
    .digest("hex");
}

export function newToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("hex");
  return { raw, hash: hashToken(raw) };
}

/** Shown to the admin exactly once, then only ever stored hashed. */
export function generatePassword(length = 12): string {
  const bytes = randomBytes(length);
  let out = "";

  for (let i = 0; i < length; i++) {
    out += PASSWORD_ALPHABET[bytes[i] % PASSWORD_ALPHABET.length];
  }

  return out;
}
