import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  generateEmployeeId,
  hashInviteToken,
  hashPassword,
  HttpError,
  isMobileClient,
} from "@/lib/auth";
import { handler } from "@/lib/api";
import { acceptInviteSchema } from "@/lib/validation";
import { toCompany, toUser } from "@/lib/serialize";
import type { SessionDto } from "@/lib/dto";

const TONES = ["indigo", "violet", "emerald", "amber", "slate"];

/**
 * Single use: the account is created and the invite is marked spent in one
 * transaction, so a link that is opened twice cannot make two accounts.
 */
export const POST = handler(
  async (request: Request, ctx: RouteContext<"/api/invites/[token]/accept">) => {
    const { token } = await ctx.params;
    const { password } = acceptInviteSchema.parse(await request.json());

    const invite = await prisma.invite.findUnique({
      where: { tokenHash: hashInviteToken(token) },
      include: { company: true },
    });

    if (!invite) throw new HttpError(404, "That invite link isn't valid");
    if (invite.acceptedAt) throw new HttpError(410, "That invite has already been used");
    if (invite.expiresAt < new Date()) throw new HttpError(410, "That invite has expired");

    const clash = await prisma.user.findUnique({
      where: { email: invite.email },
      select: { id: true },
    });

    if (clash) throw new HttpError(409, "An account with that email already exists");

    const employeeId = await generateEmployeeId(invite.firstName, invite.lastName);
    const passwordHash = await hashPassword(password);

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          companyId: invite.companyId,
          email: invite.email,
          employeeId,
          passwordHash,
          firstName: invite.firstName,
          lastName: invite.lastName,
          role: "EMPLOYEE",
          status: "ACTIVE",
          avatarTone: TONES[Math.floor(Math.random() * TONES.length)],
        },
      });

      await tx.invite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });

      return created;
    });

    const sessionToken = await createSession(user.id);

    return NextResponse.json<SessionDto>(
      {
        user: toUser(user),
        company: toCompany(invite.company),
        ...((await isMobileClient()) ? { token: sessionToken } : {}),
      },
      { status: 201 },
    );
  },
);
