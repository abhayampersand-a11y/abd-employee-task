import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateEmployeeId,
  generatePassword,
  hashPassword,
  HttpError,
  requireAdmin,
  requireCompany,
} from "@/lib/auth";
import { handler, readPagination } from "@/lib/api";
import { createEmployeeSchema } from "@/lib/validation";
import { toEmployee } from "@/lib/serialize";
import type { EmployeeDto, Paginated } from "@/lib/dto";
import type { Prisma } from "@/lib/generated/prisma/client";

const TONES = ["indigo", "violet", "emerald", "amber", "slate"];

/**
 * Employees can read this list too — the "Assign to" picker needs it — but
 * they only ever get name and id, never email or account status.
 */
export const GET = handler(async (request: Request) => {
  const user = await requireCompany();
  const params = new URL(request.url).searchParams;

  const where: Prisma.UserWhereInput = { companyId: user.companyId };

  const status = params.get("status");
  if (status && status !== "ALL") {
    where.status = status as Prisma.UserWhereInput["status"];
  }

  const q = params.get("q")?.trim();
  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { employeeId: { contains: q, mode: "insensitive" } },
    ];
  }

  // A worker picking an assignee shouldn't see disabled colleagues.
  if (user.role !== "ADMIN") where.status = "ACTIVE";

  const { page, pageSize, skip, take } = readPagination(params);

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { _count: { select: { assignedTasks: true } } },
      orderBy: [{ role: "asc" }, { firstName: "asc" }],
      skip,
      take,
    }),
    prisma.user.count({ where }),
  ]);

  const items = rows.map(toEmployee);

  return NextResponse.json<Paginated<EmployeeDto>>({
    items:
      user.role === "ADMIN"
        ? items
        : // Strip the admin-only fields for everyone else.
          items.map((item) => ({ ...item, email: "", taskCount: 0 })),
    total,
    page,
    pageSize,
  });
});

/**
 * Creates a worker with generated credentials.
 * The password is returned exactly once and never stored in plaintext.
 */
export const POST = handler(async (request: Request) => {
  const admin = await requireAdmin();
  const input = createEmployeeSchema.parse(await request.json());

  const email =
    input.email ??
    `${input.firstName.toLowerCase()}.${input.lastName.toLowerCase()}.${Date.now()}@placeholder.local`;

  const clash = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (clash) throw new HttpError(409, "Someone already uses that email");

  const employeeId = await generateEmployeeId(input.firstName, input.lastName);
  const password = generatePassword();

  const employee = await prisma.user.create({
    data: {
      companyId: admin.companyId,
      email,
      employeeId,
      passwordHash: await hashPassword(password),
      firstName: input.firstName,
      lastName: input.lastName,
      role: "EMPLOYEE",
      status: "ACTIVE",
      mustChangePassword: true,
      avatarTone: TONES[Math.floor(Math.random() * TONES.length)],
    },
  });

  return NextResponse.json(
    { employee: toEmployee(employee), employeeId, password },
    { status: 201 },
  );
});
