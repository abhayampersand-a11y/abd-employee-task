"use client";

import { useState } from "react";
import { StatGrid, type Stat } from "@/components/ui/stat-card";
import { TaskTable } from "@/components/tasks/task-table";
import { StatGridSkeleton, TaskTableSkeleton } from "@/components/ui/skeleton";
import { ErrorCard } from "@/components/ui/error-card";
import { useTasksQuery } from "@/store/services/task-api";
import { useStatsQuery } from "@/store/services/employee-api";
import { useMeQuery } from "@/store/services/auth-api";
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  CheckSquareIcon,
  ClockIcon,
} from "@/components/icons";

const PAGE_SIZE = 10;

export default function TasksPage() {
  const [page, setPage] = useState(1);

  const { data: me } = useMeQuery();
  const isAdmin = me?.user.role === "ADMIN";

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useStatsQuery();

  const { data, isLoading, error, refetch } = useTasksQuery({
    // Admins see the whole factory; workers see their own load.
    scope: isAdmin ? "all" : "mine",
    page,
    pageSize: PAGE_SIZE,
  });

  const cards: Stat[] =
    stats?.kind === "admin"
      ? [
          { tag: "All", value: stats.totalTasks, label: "Total Tasks", tone: "indigo", icon: CheckSquareIcon },
          { tag: "Active", value: stats.inProgress, label: "In Progress", tone: "amber", icon: ClockIcon },
          { tag: "Closed", value: stats.completed, label: "Completed", tone: "emerald", icon: CheckCircleIcon },
          { tag: "Critical", value: stats.overdue, label: "Overdue", tone: "red", icon: AlertTriangleIcon },
        ]
      : stats?.kind === "employee"
        ? [
            { tag: "Active", value: stats.myTasks, label: "Tasks Assigned", tone: "indigo", icon: CheckSquareIcon },
            { tag: "Pending", value: stats.dueToday, label: "Due Today", tone: "amber", icon: ClockIcon },
            { tag: "Weekly", value: stats.completedThisWeek, label: "Completed", tone: "emerald", icon: CheckCircleIcon },
            { tag: "Critical", value: stats.overdue, label: "Overdue", tone: "red", icon: AlertTriangleIcon },
          ]
        : [];

  const total = data?.total ?? 0;
  const shown = data?.items.length ?? 0;

  return (
    <div className="mx-auto max-w-[1280px] space-y-5">
      {statsLoading ? (
        <StatGridSkeleton />
      ) : statsError ? (
        <ErrorCard error={statsError} />
      ) : (
        <StatGrid stats={cards} />
      )}

      {isLoading ? (
        <TaskTableSkeleton />
      ) : error ? (
        <ErrorCard error={error} onRetry={refetch} />
      ) : (
        <TaskTable
          tasks={data?.items ?? []}
          summary={`Showing ${shown} of ${total} tasks`}
          page={page}
          pages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
