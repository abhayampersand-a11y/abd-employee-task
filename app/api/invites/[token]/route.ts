import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashInviteToken, HttpError } from "@/lib/auth";
import { handler } from "@/lib/api";
import type { InvitePreviewDto } from "@/lib/dto";

/**
 * Public — the recipient has no account yet. It returns only what the accept
 * screen needs to greet them, never anything about the wider company.
 */
export const GET = handler(
  async (_request: Request, ctx: RouteContext<"/api/invites/[token]">) => {
    const { token } = await ctx.params;

    const invite = await prisma.invite.findUnique({
      where: { tokenHash: hashInviteToken(token) },
      include: { company: { select: { name: true } } },
    });

    if (!invite) throw new HttpError(404, "That invite link isn't valid");

    // 410, not 404: the link was real, it is simply spent.
    if (invite.acceptedAt) {
      throw new HttpError(410, "That invite has already been used");
    }

    if (invite.expiresAt < new Date()) {
      throw new HttpError(410, "That invite has expired");
    }

    return NextResponse.json<InvitePreviewDto>({
      companyName: invite.company.name,
      firstName: invite.firstName,
      lastName: invite.lastName,
      email: invite.email,
    });
  },
);
