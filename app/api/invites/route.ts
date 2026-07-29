import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createInviteToken,
  HttpError,
  inviteUrl,
  requireAdmin,
} from "@/lib/auth";
import { handler } from "@/lib/api";
import { inviteSchema } from "@/lib/validation";
import type { InviteDto } from "@/lib/dto";

/**
 * Invites someone to join the company. The raw token appears in the returned
 * URL and nowhere else — the database only ever holds its SHA-256.
 */
export const POST = handler(async (request: Request) => {
  const admin = await requireAdmin();
  const input = inviteSchema.parse(await request.json());

  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existingUser) {
    throw new HttpError(409, "Someone already uses that email");
  }

  // A second live invite to the same address would leave two working links.
  const livePending = await prisma.invite.findFirst({
    where: {
      companyId: admin.companyId,
      email: input.email,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: { id: true },
  });

  if (livePending) {
    throw new HttpError(409, "That person already has a pending invite");
  }

  const { raw, hash, expiresAt } = createInviteToken();

  const invite = await prisma.invite.create({
    data: {
      companyId: admin.companyId,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      tokenHash: hash,
      expiresAt,
      createdById: admin.id,
    },
  });

  return NextResponse.json<InviteDto>(
    {
      id: invite.id,
      email: invite.email,
      firstName: invite.firstName,
      lastName: invite.lastName,
      expiresAt: invite.expiresAt.toISOString(),
      url: inviteUrl(raw),
    },
    { status: 201 },
  );
});
