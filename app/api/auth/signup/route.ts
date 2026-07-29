import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  hashPassword,
  HttpError,
  isMobileClient,
} from "@/lib/auth";
import { handler } from "@/lib/api";
import { signupSchema } from "@/lib/validation";
import { toUser } from "@/lib/serialize";
import type { SessionDto } from "@/lib/dto";

/** Creates the admin account. The company is added next, during onboarding. */
export const POST = handler(async (request: Request) => {
  const input = signupSchema.parse(await request.json());

  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existing) {
    throw new HttpError(409, "An account with that email already exists");
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash: await hashPassword(input.password),
      firstName: input.firstName,
      lastName: input.lastName,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const token = await createSession(user.id);

  return NextResponse.json<SessionDto>(
    {
      user: toUser(user),
      company: null,
      ...((await isMobileClient()) ? { token } : {}),
    },
    { status: 201 },
  );
});
