import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  hashPassword,
  HttpError,
  requireAuth,
  verifyPassword,
} from "@/lib/auth";
import { handler } from "@/lib/api";
import { changePasswordSchema } from "@/lib/validation";

export const POST = handler(async (request: Request) => {
  const user = await requireAuth();
  const input = changePasswordSchema.parse(await request.json());

  if (!(await verifyPassword(input.currentPassword, user.passwordHash))) {
    throw new HttpError(400, "Your current password is incorrect");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(input.newPassword),
      mustChangePassword: false,
    },
  });

  // Every existing session dies, then this device gets a fresh one — so other
  // devices must sign in again but the person changing the password stays in.
  await prisma.session.deleteMany({ where: { userId: user.id } });
  await createSession(user.id);

  return NextResponse.json({ ok: true });
});
