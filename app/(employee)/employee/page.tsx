"use client";

import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { PriorityBadge, StatusBadge } from "@/components/ui/badge";
import { StatCard, type Stat } from "@/components/ui/stat-card";
import { StatGridSkeleton, TaskCardSkeleton } from "@/components/ui/skeleton";
import { ErrorCard } from "@/components/ui/error-card";
import { formatDue } from "@/lib/format";
import { useMeQuery } from "@/store/services/auth-api";
import { useStatsQuery } from "@/store/services/employee-api";
import { useTasksQuery, useUpdateTaskMutation } from "@/store/services/task-api";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  CheckSquareIcon,
  ClockIcon,
} from "@/components/icons";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function EmployeeDashboardPage() {
  const { data: me } = useMeQuery();
  const { data: stats, isLoading: statsLoading, error: statsError } = useStatsQuery();
  const [updateTask] = useUpdateTaskMutation();

  const mine = useTasksQuery({ scope: "mine", status: "ALL", pageSize: 100 });
  const sent = useTasksQuery({ scope: "created", pageSize: 5 });

  const open = (mine.data?.items ?? []).filter((task) => task.status !== "DONE");
  const dueToday = open.filter(
    (task) => formatDue(task.dueDate).label.startsWith("Today"),
  );

  const cards: Stat[] =
    stats?.kind === "employee"
      ? [
          { tag: "Open", value: stats.myTasks, label: "My Tasks", tone: "indigo", icon: CheckSquareIcon },
          { tag: "Today", value: stats.dueToday, label: "Due Today", tone: "amber", icon: ClockIcon },
          { tag: "This week", value: stats.completedThisWeek, label: "Completed", tone: "emerald", icon: CheckCircleIcon },
          { tag: "Late", value: stats.overdue, label: "Overdue", tone: "red", icon: AlertTriangleIcon },
        ]
      : [];

  return (
    <div className="mx-auto max-w-[1100px] space-y-5">
      <header>
        <h2 className="text-2xl font-bold tracking-tight text-ink">
          {greeting()}
          {me ? `, ${me.user.firstName}` : ""} 👋
        </h2>
        <p className="mt-1 text-sm text-muted">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </header>

      {statsLoading ? (
        <StatGridSkeleton count={4} />
      ) : statsError ? (
        <ErrorCard error={statsError} />
      ) : (
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 xl:grid-cols-4">
          {cards.map((stat) => (
            <div key={stat.label} className="w-[160px] shrink-0 sm:w-auto">
              <StatCard {...stat} />
            </div>
          ))}
        </div>
      )}

      <Card padded={false}>
        <CardHeader
          className="p-5"
          title="Due Today"
          action={
            <Link
              href="/employee/my-tasks"
              className="text-[13px] font-semibold text-brand-600 hover:text-brand-700"
            >
              See all
            </Link>
          }
        />

        {mine.isLoading ? (
          <div className="space-y-3 border-t border-line p-5">
            {Array.from({ length: 2 }).map((_, i) => (
              <TaskCardSkeleton key={i} />
            ))}
          </div>
        ) : mine.error ? (
          <div className="border-t border-line p-5">
            <ErrorCard error={mine.error} onRetry={mine.refetch} />
          </div>
        ) : dueToday.length === 0 ? (
          <p className="border-t border-line px-5 py-8 text-center text-sm text-muted">
            Nothing due today. Enjoy the breathing room.
          </p>
        ) : (
          <ul className="border-t border-line">
            {dueToday.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-3.5 border-b border-line px-5 py-4 last:border-0"
              >
                <input
                  type="checkbox"
                  aria-label={`Mark ${task.title} complete`}
                  disabled={!task.can.changeStatus}
                  onChange={() => updateTask({ id: task.id, status: "DONE" })}
                  className="h-[18px] w-[18px] shrink-0 cursor-pointer rounded-full border-line accent-brand-600"
                />
                <span className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{task.title}</p>
                  <p className="mt-0.5 text-[13px] text-muted">
                    {formatDue(task.dueDate).label} · {task.category}
                  </p>
                </span>
                <PriorityBadge priority={task.priority} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card padded={false}>
        <CardHeader
          className="p-5"
          title="Assigned by Me"
          action={
            <Link
              href="/employee/assigned"
              className="text-[13px] font-semibold text-brand-600 hover:text-brand-700"
            >
              See all
            </Link>
          }
        />

        {sent.isLoading ? (
          <div className="space-y-3 border-t border-line p-5">
            <TaskCardSkeleton />
          </div>
        ) : (sent.data?.items.length ?? 0) === 0 ? (
          <p className="border-t border-line px-5 py-8 text-center text-sm text-muted">
            You haven&apos;t assigned any work yet.
          </p>
        ) : (
          <ul className="border-t border-line">
            {sent.data?.items.map((task) => (
              <li
                key={task.id}
                className="flex items-center gap-3 border-b border-line px-5 py-3.5 last:border-0"
              >
                <Avatar
                  name={task.assignee.fullName}
                  tone={task.assignee.avatarTone}
                />
                <span className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{task.title}</p>
                  <p className="mt-0.5 text-[13px] text-muted">
                    {task.assignee.fullName}
                  </p>
                </span>
                <StatusBadge status={task.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
