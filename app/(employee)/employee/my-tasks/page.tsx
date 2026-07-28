"use client";

import { MyTasksBoard } from "@/components/tasks/my-tasks-board";
import { TaskBoardSkeleton } from "@/components/ui/skeleton";
import { ErrorCard } from "@/components/ui/error-card";
import { useTasksQuery } from "@/store/services/task-api";

export default function MyTasksPage() {
  const { data, isLoading, error, refetch } = useTasksQuery({
    scope: "mine",
    pageSize: 100,
  });

  return (
    <div className="mx-auto max-w-[1280px]">
      <p className="mb-5 text-sm text-muted">
        Everything assigned to you, grouped by where it stands.
      </p>

      {isLoading ? (
        <TaskBoardSkeleton />
      ) : error ? (
        <ErrorCard error={error} onRetry={refetch} />
      ) : (
        <MyTasksBoard tasks={data?.items ?? []} onRefresh={refetch} />
      )}
    </div>
  );
}
