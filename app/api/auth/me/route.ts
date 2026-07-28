import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { handler } from "@/lib/api";
import { toCompany, toUser } from "@/lib/serialize";
import type { MeDto } from "@/lib/dto";

export const GET = handler(async () => {
  const user = await requireAuth();

  return NextResponse.json<MeDto>({
    user: toUser(user),
    company: user.company ? toCompany(user.company) : null,
  });
});
