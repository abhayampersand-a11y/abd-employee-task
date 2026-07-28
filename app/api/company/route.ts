import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HttpError, requireAuth, requireCompany } from "@/lib/auth";
import { handler } from "@/lib/api";
import { canEditCompany } from "@/lib/permissions";
import { companyPatchSchema, companySchema } from "@/lib/validation";
import { toCompany } from "@/lib/serialize";
import type { CompanyDto } from "@/lib/dto";

/** Onboarding step 2: create the company and attach the signed-in admin. */
export const POST = handler(async (request: Request) => {
  const user = await requireAuth();

  if (user.role !== "ADMIN") {
    throw new HttpError(403, "Only an admin can create a company");
  }

  if (user.companyId) {
    throw new HttpError(409, "You already belong to a company");
  }

  const input = companySchema.parse(await request.json());

  const company = await prisma.$transaction(async (tx) => {
    const created = await tx.company.create({ data: input });
    await tx.user.update({
      where: { id: user.id },
      data: { companyId: created.id },
    });
    return created;
  });

  return NextResponse.json<CompanyDto>(toCompany(company), { status: 201 });
});

export const GET = handler(async () => {
  const user = await requireCompany();

  const company = await prisma.company.findUniqueOrThrow({
    where: { id: user.companyId },
  });

  return NextResponse.json<CompanyDto>(toCompany(company));
});

export const PATCH = handler(async (request: Request) => {
  const user = await requireCompany();

  if (!canEditCompany(user)) {
    throw new HttpError(403, "Only an admin can edit company details");
  }

  const input = companyPatchSchema.parse(await request.json());

  const company = await prisma.company.update({
    where: { id: user.companyId },
    data: input,
  });

  return NextResponse.json<CompanyDto>(toCompany(company));
});
