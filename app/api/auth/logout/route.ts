import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { handler } from "@/lib/api";

export const POST = handler(async () => {
  await destroySession();
  return NextResponse.json({ ok: true });
});
