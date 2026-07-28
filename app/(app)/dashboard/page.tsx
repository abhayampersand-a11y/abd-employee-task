"use client";

import Link from "next/link";
import { StatGrid, type Stat } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { PriorityBadge, StatusBadge } from "@/components/ui/badge";
import { StatGridSkeleton, TaskTableSkeleton } from "@/components/ui/skeleton";
import { ErrorCard } from "@/components/ui/error-card";
import { formatDue } from "@/lib/format";
import { useStatsQuery } from "@/store/services/employee-api";
import { useTasksQuery } from "@/store/services/task-api";
import { useMeQuery } from "@/store/services/auth-api";
import {
  CheckCircleIcon,
  CheckSquareIcon,
  ClockIcon,
  TeamsIcon,
} from "@/components/icons";

export default function DashboardPage() {
  const { data: me } = useMeQuery();
  const isAdmin = me?.user.role === "ADMIN";

  const { data: stats, isLoading: statsLoading, error: statsError } = useStatsQuery();

  const recent = useTasksQuery({
    scope: isAdmin ? "all" : "mine",
    pageSize: 6,
  });

  const cards: Stat[] =
    stats?.kind === "admin"
      ? [
          { tag: "Team", value: stats.totalEmployees, label: "Total Employees", tone: "indigo", icon: TeamsIcon },
          { tag: "All time", value: stats.totalTasks, label: "Total Tasks", tone: "amber", icon: CheckSquareIcon },
          { tag: "Active", value: stats.inProgress, label: "In Progress", tone: "red", icon: ClockIcon },
          { tag: "Closed", value: stats.completed, label: "Completed", tone: "emerald", icon: CheckCircleIcon },
        ]
      : [];

  const breakdown =
    stats?.kind === "admin"
      ? [
          { label: "Todo", value: stats.byStatus.todo, className: "bg-slate-400" },
          { label: "In Progress", value: stats.byStatus.inProgress, className: "bg-amber-400" },
          { label: "Done", value: stats.byStatus.done, className: "bg-emerald-500" },
        ]
      : [];

  const total = breakdown.reduce((sum, part) => sum + part.value, 0);

  return (
    <div className="mx-auto max-w-[1280px] space-y-5">
      {statsLoading ? (
        <StatGridSkeleton />
      ) : statsError ? (
        <ErrorCard error={statsError} />
      ) : (
        <StatGrid stats={cards} />
      )}

      <Card padded={false}>
        <CardHeader
          className="p-5"
          title="Recent Tasks"
          action={
            <Link
              href="/tasks"
              className="text-[13px] font-semibold text-brand-600 hover:text-brand-700"
            >
              See all
            </Link>
          }
        />

        {recent.isLoading ? (
          <div className="border-t border-line p-5">
            <TaskTableSkeleton rows={4} />
          </div>
        ) : recent.error ? (
          <div className="border-t border-line p-5">
            <ErrorCard error={recent.error} onRetry={recent.refetch} />
          </div>
        ) : (
          <ul className="border-t border-line">
            {recent.data?.items.map((task) => {
              const due = formatDue(task.dueDate, task.status === "DONE");

              return (
                <li
                  key={task.id}
                  className="flex items-center gap-4 border-b border-line px-5 py-3.5 last:border-0"
                >
                  <span className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{task.title}</p>
                    <p className="mt-0.5 text-[13px] text-muted">
                      {task.category} · {due.label}
                    </p>
                  </span>
                  <span className="hidden sm:block">
                    <PriorityBadge priority={task.priority} />
                  </span>
                  <StatusBadge status={task.status} />
                  <Avatar
                    name={task.assignee.fullName}
                    tone={task.assignee.avatarTone}
                    className="hidden sm:inline-flex"
                  />
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {total > 0 ? (
        <Card>
          <CardHeader
            title="Tasks by Status"
            description={`${total} jobs across the factory`}
          />

          <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-slate-100">
            {breakdown.map((part) => (
              <span
                key={part.label}
                className={part.className}
                style={{ width: `${(part.value / total) * 100}%` }}
              />
            ))}
          </div>

          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {breakdown.map((part) => (
              <li key={part.label} className="flex items-center gap-2 text-[13px]">
                <span className={`h-2.5 w-2.5 rounded-full ${part.className}`} />
                <span className="text-muted">{part.label}</span>
                <span className="font-semibold text-ink">{part.value}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
