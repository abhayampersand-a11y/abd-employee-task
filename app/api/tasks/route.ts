import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HttpError, requireCompany } from "@/lib/auth";
import { handler, readPagination } from "@/lib/api";
import { canUseScope, type TaskScope } from "@/lib/permissions";
import { createTaskSchema } from "@/lib/validation";
import { toTask } from "@/lib/serialize";
import type { Paginated, TaskDto } from "@/lib/dto";
import type { Prisma } from "@/lib/generated/prisma/client";

const include = { assignee: true, createdBy: true } as const;

export const GET = handler(async (request: Request) => {
  const user = await requireCompany();
  const params = new URL(request.url).searchParams;

  const scope = (params.get("scope") ?? "mine") as TaskScope;

  if (!["mine", "created", "all"].includes(scope)) {
    throw new HttpError(400, "Unknown scope");
  }

  if (!canUseScope(user, scope)) {
    throw new HttpError(403, "Only an admin can view every task");
  }

  // companyId always comes from the session, never the request.
  const where: Prisma.TaskWhereInput = { companyId: user.companyId };

  if (scope === "mine") where.assigneeId = user.id;
  if (scope === "created") where.createdById = user.id;

  const status = params.get("status");
  if (status && status !== "ALL") {
    where.status = status as Prisma.TaskWhereInput["status"];
  }

  const priority = params.get("priority");
  if (priority && priority !== "ALL") {
    where.priority = priority as Prisma.TaskWhereInput["priority"];
  }

  const assigneeId = params.get("assigneeId");
  if (assigneeId && assigneeId !== "ALL") where.assigneeId = assigneeId;

  const q = params.get("q")?.trim();
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
    ];
  }

  const { page, pageSize, skip, take } = readPagination(params);

  const [items, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include,
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
      skip,
      take,
    }),
    prisma.task.count({ where }),
  ]);

  return NextResponse.json<Paginated<TaskDto>>({
    items: items.map((task) => toTask(task, user)),
    total,
    page,
    pageSize,
  });
});

export const POST = handler(async (request: Request) => {
  const user = await requireCompany();
  const input = createTaskSchema.parse(await request.json());

  // The assignee must be a live member of the same company.
  const assignee = await prisma.user.findFirst({
    where: {
      id: input.assigneeId,
      companyId: user.companyId,
      status: { not: "DISABLED" },
    },
    select: { id: true },
  });

  if (!assignee) {
    throw new HttpError(400, "That person isn't on your team");
  }

  const task = await prisma.task.create({
    data: {
      companyId: user.companyId,
      title: input.title,
      description: input.description ?? null,
      category: input.category ?? null,
      priority: input.priority,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      assigneeId: input.assigneeId,
      createdById: user.id,
    },
    include,
  });

  return NextResponse.json<TaskDto>(toTask(task, user), { status: 201 });
});
