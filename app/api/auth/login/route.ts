import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  HttpError,
  isMobileClient,
  verifyPassword,
} from "@/lib/auth";
import { handler } from "@/lib/api";
import { loginSchema } from "@/lib/validation";
import { toCompany, toUser } from "@/lib/serialize";
import type { SessionDto } from "@/lib/dto";

export const POST = handler(async (request: Request) => {
  const { identifier, password } = loginSchema.parse(await request.json());
  const lookup = identifier.toLowerCase();

  // Admins sign in with email, employees with the generated ID. Accept either.
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: lookup }, { employeeId: lookup }] },
    include: { company: true },
  });

  // Same message either way — never reveal whether an account exists.
  const invalid = new HttpError(401, "Incorrect email or password");

  if (!user) throw invalid;
  if (!(await verifyPassword(password, user.passwordHash))) throw invalid;

  if (user.status === "DISABLED") {
    throw new HttpError(403, "This account has been disabled");
  }

  const token = await createSession(user.id);

  return NextResponse.json<SessionDto>({
    user: toUser(user),
    company: user.company ? toCompany(user.company) : null,
    ...((await isMobileClient()) ? { token } : {}),
  });
});
