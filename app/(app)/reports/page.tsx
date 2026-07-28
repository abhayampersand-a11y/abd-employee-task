"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { StatGrid, type Stat } from "@/components/ui/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { StatGridSkeleton, FormSkeleton } from "@/components/ui/skeleton";
import { ErrorCard } from "@/components/ui/error-card";
import { useStatsQuery, useEmployeesQuery } from "@/store/services/employee-api";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  CheckSquareIcon,
  TrendingUpIcon,
} from "@/components/icons";

export default function ReportsPage() {
  const { data: stats, isLoading, error } = useStatsQuery();
  const team = useEmployeesQuery({ status: "ACTIVE", pageSize: 100 });

  const admin = stats?.kind === "admin" ? stats : null;

  const completionRate =
    admin && admin.totalTasks > 0
      ? `${Math.round((admin.completed / admin.totalTasks) * 100)}%`
      : "—";

  const cards: Stat[] = admin
    ? [
        { tag: "All time", value: completionRate, label: "Completion Rate", tone: "emerald", icon: TrendingUpIcon },
        { tag: "Open", value: admin.byStatus.todo, label: "Not Started", tone: "indigo", icon: CheckSquareIcon },
        { tag: "Closed", value: admin.completed, label: "Tasks Completed", tone: "amber", icon: CheckCircleIcon },
        { tag: "Critical", value: admin.overdue, label: "Overdue", tone: "red", icon: AlertTriangleIcon },
      ]
    : [];

  const workload = [...(team.data?.items ?? [])]
    .sort((a, b) => b.taskCount - a.taskCount)
    .slice(0, 8);

  const peak = Math.max(1, ...workload.map((member) => member.taskCount));

  return (
    <div className="mx-auto max-w-[1280px] space-y-5">
      {isLoading ? (
        <StatGridSkeleton />
      ) : error ? (
        <ErrorCard error={error} />
      ) : (
        <StatGrid stats={cards} />
      )}

      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader
            title="Workload by person"
            description="Tasks currently assigned to each worker"
          />

          {team.isLoading ? (
            <div className="mt-6">
              <FormSkeleton fields={3} />
            </div>
          ) : workload.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              No employees yet.
            </p>
          ) : (
            <div className="mt-8 flex h-56 items-end gap-3">
              {workload.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-1 flex-col items-center gap-3"
                >
                  <span className="text-[13px] font-semibold text-ink">
                    {member.taskCount}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-brand-500"
                    style={{ height: `${(member.taskCount / peak) * 100}%` }}
                  />
                  <span className="truncate text-[13px] text-muted">
                    {member.firstName}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card padded={false}>
          <CardHeader className="p-5" title="Busiest workers" />
          <ul className="border-t border-line">
            {workload.slice(0, 5).map((member, index) => (
              <li
                key={member.id}
                className="flex items-center gap-3 border-b border-line px-5 py-3.5 last:border-0"
              >
                <span className="w-4 text-[13px] font-semibold text-subtle">
                  {index + 1}
                </span>
                <Avatar name={member.fullName} tone={member.avatarTone} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                  {member.fullName}
                </span>
                <span className="text-[13px] text-muted">
                  {member.taskCount} tasks
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
