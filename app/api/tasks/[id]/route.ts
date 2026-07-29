import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HttpError, requireCompany } from "@/lib/auth";
import { handler } from "@/lib/api";
import {
  canChangeStatus,
  canDeleteTask,
  canEditTask,
  canViewTask,
} from "@/lib/permissions";
import { updateTaskSchema } from "@/lib/validation";
import { toComment, toTask } from "@/lib/serialize";
import type { TaskDetailDto, TaskDto } from "@/lib/dto";
import type { SessionUser } from "@/lib/auth";

const include = { assignee: true, createdBy: true } as const;

/** Always scoped to the caller's company, so another tenant's id 404s. */
async function loadTask(user: SessionUser & { companyId: string }, id: string) {
  const task = await prisma.task.findFirst({
    where: { id, companyId: user.companyId },
    include,
  });

  if (!task) throw new HttpError(404, "Task not found");
  return task;
}

export const GET = handler(async (_request: Request, ctx: RouteContext<"/api/tasks/[id]">) => {
  const user = await requireCompany();
  const { id } = await ctx.params;
  const task = await loadTask(user, id);

  if (!canViewTask(user, task)) {
    throw new HttpError(403, "You don't have access to this task");
  }

  const comments = await prisma.taskComment.findMany({
    where: { taskId: task.id },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json<TaskDetailDto>({
    ...toTask(task, user),
    comments: comments.map(toComment),
  });
});

export const PATCH = handler(async (request: Request, ctx: RouteContext<"/api/tasks/[id]">) => {
  const user = await requireCompany();
  const { id } = await ctx.params;
  const task = await loadTask(user, id);

  const input = updateTaskSchema.parse(await request.json());

  const wantsStatusOnly =
    input.status !== undefined && Object.keys(input).length === 1;

  // The assignee may move their own work along; everything else is the
  // creator's (or an admin's) to change.
  if (wantsStatusOnly) {
    if (!canChangeStatus(user, task)) {
      throw new HttpError(403, "Only the assignee can change this task's status");
    }
  } else if (!canEditTask(user, task)) {
    throw new HttpError(403, "Only the person who assigned this task can edit it");
  }

  if (input.assigneeId && input.assigneeId !== task.assigneeId) {
    const assignee = await prisma.user.findFirst({
      where: {
        id: input.assigneeId,
        companyId: user.companyId,
        status: { not: "DISABLED" },
      },
      select: { id: true },
    });

    if (!assignee) throw new HttpError(400, "That person isn't on your team");
  }

  const updated = await prisma.task.update({
    where: { id: task.id },
    data: {
      ...input,
      dueDate:
        input.dueDate === undefined
          ? undefined
          : input.dueDate === null
            ? null
            : new Date(input.dueDate),
      // Keep completedAt honest whichever direction the status moves.
      completedAt:
        input.status === undefined
          ? undefined
          : input.status === "DONE"
            ? new Date()
            : null,
    },
    include,
  });

  return NextResponse.json<TaskDto>(toTask(updated, user));
});

export const DELETE = handler(async (_request: Request, ctx: RouteContext<"/api/tasks/[id]">) => {
  const user = await requireCompany();
  const { id } = await ctx.params;
  const task = await loadTask(user, id);

  if (!canDeleteTask(user, task)) {
    throw new HttpError(403, "Only the person who assigned this task can delete it");
  }

  await prisma.task.delete({ where: { id: task.id } });

  return NextResponse.json({ ok: true });
});
