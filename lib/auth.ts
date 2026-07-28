import "server-only";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { generatePassword, hashToken, newToken } from "@/lib/tokens";
import { prisma } from "@/lib/prisma";
import type { Company, User } from "@/lib/generated/prisma/client";

const SESSION_COOKIE = "taskflow_session";
const SESSION_DAYS = 7;
const INVITE_DAYS = 7;
const BCRYPT_COST = 10;

export type SessionUser = User & { company: Company | null };

// ---------------------------------------------------------------------------
// Errors — route handlers translate these into status codes
// ---------------------------------------------------------------------------

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

// ---------------------------------------------------------------------------
// Passwords
// ---------------------------------------------------------------------------

export { generatePassword };

export function hashPassword(raw: string): Promise<string> {
  return bcrypt.hash(raw, BCRYPT_COST);
}

export function verifyPassword(raw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(raw, hash);
}

// ---------------------------------------------------------------------------
// Employee IDs
// ---------------------------------------------------------------------------

/**
 * Builds a unique login handle like "rahul.patel", appending a counter on
 * collision. Unique across the whole table, not just within a company.
 */
export async function generateEmployeeId(
  firstName: string,
  lastName: string,
): Promise<string> {
  const clean = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const base = `${clean(firstName)}.${clean(lastName)}` || "employee";

  for (let suffix = 0; suffix < 1000; suffix++) {
    const candidate = suffix === 0 ? base : `${base}${suffix + 1}`;
    const taken = await prisma.user.findUnique({
      where: { employeeId: candidate },
      select: { id: true },
    });

    if (!taken) return candidate;
  }

  throw new HttpError(500, "Could not generate a unique employee ID");
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export async function createSession(userId: string): Promise<void> {
  const { raw, hash } = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);

  await prisma.session.create({ data: { tokenHash: hash, userId, expiresAt } });

  const store = await cookies();
  store.set(SESSION_COOKIE, raw, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;

  if (raw) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(raw) } });
  }

  store.delete(SESSION_COOKIE);
}

/** Returns the signed-in user, or null. Expired sessions are cleaned up. */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(raw) },
    include: { user: { include: { company: true } } },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }

  if (session.user.status === "DISABLED") return null;

  return session.user;
}

// ---------------------------------------------------------------------------
// Guards — call these at the top of every route handler
// ---------------------------------------------------------------------------

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new HttpError(401, "Not signed in");
  return user;
}

/** Auth + a company. Everything tenant-scoped needs this, not `requireAuth`. */
export async function requireCompany(): Promise<
  SessionUser & { companyId: string }
> {
  const user = await requireAuth();

  if (!user.companyId) {
    throw new HttpError(409, "Company setup is not complete");
  }

  return user as SessionUser & { companyId: string };
}

export async function requireAdmin(): Promise<
  SessionUser & { companyId: string }
> {
  const user = await requireCompany();

  if (user.role !== "ADMIN") {
    throw new HttpError(403, "Admins only");
  }

  return user;
}

// ---------------------------------------------------------------------------
// Invites
// ---------------------------------------------------------------------------

export function createInviteToken(): {
  raw: string;
  hash: string;
  expiresAt: Date;
} {
  const { raw, hash } = newToken();
  return { raw, hash, expiresAt: new Date(Date.now() + INVITE_DAYS * 86_400_000) };
}

export function hashInviteToken(raw: string): string {
  return hashToken(raw);
}

export function inviteUrl(rawToken: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/invite/${rawToken}`;
}
