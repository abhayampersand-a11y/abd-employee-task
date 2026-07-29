import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HttpError, requireCompany } from "@/lib/auth";
import { handler } from "@/lib/api";
import { canComment } from "@/lib/permissions";
import { commentSchema } from "@/lib/validation";
import { toComment } from "@/lib/serialize";
import type { CommentDto } from "@/lib/dto";

/**
 * Reading comments is served by `GET /api/tasks/[id]`, which returns them with
 * the task — a separate list endpoint would be a second round trip for data
 * the detail screen already has.
 */
export const POST = handler(
  async (request: Request, ctx: RouteContext<"/api/tasks/[id]/comments">) => {
    const user = await requireCompany();
    const { id } = await ctx.params;

    const task = await prisma.task.findFirst({
      where: { id, companyId: user.companyId },
      select: { id: true, assigneeId: true, createdById: true },
    });

    if (!task) throw new HttpError(404, "Task not found");

    if (!canComment(user, task)) {
      throw new HttpError(403, "You don't have access to this task");
    }

    const { body } = commentSchema.parse(await request.json());

    const comment = await prisma.taskComment.create({
      data: { taskId: task.id, userId: user.id, body },
      include: { user: true },
    });

    return NextResponse.json<CommentDto>(toComment(comment), { status: 201 });
  },
);
