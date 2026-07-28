import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCompany } from "@/lib/auth";
import { handler } from "@/lib/api";
import { isAdmin } from "@/lib/permissions";
import type { StatsDto } from "@/lib/dto";

function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfToday(): Date {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
}

/** Role-aware: the admin sees the whole factory, a worker sees their own load. */
export const GET = handler(async () => {
  const user = await requireCompany();
  const companyId = user.companyId;
  const now = new Date();

  if (isAdmin(user)) {
    const [totalEmployees, todo, inProgress, done, overdue] = await Promise.all([
      prisma.user.count({ where: { companyId, status: { not: "DISABLED" } } }),
      prisma.task.count({ where: { companyId, status: "TODO" } }),
      prisma.task.count({ where: { companyId, status: "IN_PROGRESS" } }),
      prisma.task.count({ where: { companyId, status: "DONE" } }),
      prisma.task.count({
        where: { companyId, status: { not: "DONE" }, dueDate: { lt: now } },
      }),
    ]);

    return NextResponse.json<StatsDto>({
      kind: "admin",
      totalEmployees,
      totalTasks: todo + inProgress + done,
      inProgress,
      completed: done,
      overdue,
      byStatus: { todo, inProgress, done },
    });
  }

  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);

  const [myTasks, dueToday, completedThisWeek, overdue] = await Promise.all([
    prisma.task.count({
      where: { companyId, assigneeId: user.id, status: { not: "DONE" } },
    }),
    prisma.task.count({
      where: {
        companyId,
        assigneeId: user.id,
        status: { not: "DONE" },
        dueDate: { gte: startOfToday(), lte: endOfToday() },
      },
    }),
    prisma.task.count({
      where: {
        companyId,
        assigneeId: user.id,
        status: "DONE",
        completedAt: { gte: weekAgo },
      },
    }),
    prisma.task.count({
      where: {
        companyId,
        assigneeId: user.id,
        status: { not: "DONE" },
        dueDate: { lt: startOfToday() },
      },
    }),
  ]);

  return NextResponse.json<StatsDto>({
    kind: "employee",
    myTasks,
    dueToday,
    completedThisWeek,
    overdue,
  });
});
