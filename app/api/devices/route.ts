import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handler } from "@/lib/api";

/**
 * Push-token registration for the mobile app.
 *
 * A token identifies an install, not a person — the same phone can be used by
 * two employees in turn. So registering re-points the row at the current user,
 * and logging out deletes it. Nothing here is tenant-scoped; a device belongs
 * to a user, and the user's company is read from their session.
 */

const deviceSchema = z.object({
  pushToken: z.string().trim().min(1).max(200),
  platform: z.enum(["ios", "android"]),
});

export const POST = handler(async (request: Request) => {
  const user = await requireAuth();
  const { pushToken, platform } = deviceSchema.parse(await request.json());

  await prisma.device.upsert({
    where: { pushToken },
    create: { pushToken, platform, userId: user.id },
    update: { platform, userId: user.id },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
});

export const DELETE = handler(async (request: Request) => {
  const user = await requireAuth();
  const { pushToken } = deviceSchema.pick({ pushToken: true }).parse(
    await request.json(),
  );

  // Scoped to the caller so one user can never unregister another's device.
  await prisma.device.deleteMany({ where: { pushToken, userId: user.id } });

  return NextResponse.json({ ok: true });
});
