"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { TaskStatus } from "@/lib/dto";
import { formatDue } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { Chip, StatusBadge } from "@/components/ui/badge";
import { MobileTaskCard } from "@/components/tasks/mobile-task-card";
import { SwipeableRow } from "@/components/tasks/swipeable-row";
import { TaskTableSkeleton, TaskCardSkeleton } from "@/components/ui/skeleton";
import { ErrorCard } from "@/components/ui/error-card";
import { useTasksQuery } from "@/store/services/task-api";
import { CalendarIcon } from "@/components/icons";

const headCell =
  "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted";

const filters: { value: TaskStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
];

export default function AssignedByMePage() {
  const [status, setStatus] = useState<TaskStatus | "ALL">("ALL");

  const { data, isLoading, error, refetch } = useTasksQuery({
    scope: "created",
    status,
    pageSize: 100,
  });

  const tasks = data?.items ?? [];

  return (
    <div className="mx-auto max-w-[1100px]">
      <p className="mb-4 text-sm text-muted">
        Work you&apos;ve handed to other people.
      </p>

      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {filters.map((filter) => (
          <Chip
            key={filter.value}
            active={status === filter.value}
            onClick={() => setStatus(filter.value)}
            className="shrink-0"
          >
            {filter.label}
          </Chip>
        ))}
      </div>

      {isLoading ? (
        <>
          <div className="space-y-3 lg:hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <TaskCardSkeleton key={i} />
            ))}
          </div>
          <div className="hidden lg:block">
            <TaskTableSkeleton rows={4} />
          </div>
        </>
      ) : error ? (
        <ErrorCard error={error} onRetry={refetch} />
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line px-6 py-14 text-center">
          <p className="font-semibold text-ink">
            You haven&apos;t assigned any work yet
          </p>
          <p className="mt-1.5 text-sm text-muted">
            Use the + button to give someone a job.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: swipeable cards */}
          <div className="space-y-3 lg:hidden">
            {tasks.map((task) => (
              <SwipeableRow key={task.id}>
                <MobileTaskCard task={task} perspective="sent" />
              </SwipeableRow>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden rounded-xl border border-line bg-surface lg:block">
            <table className="w-full border-collapse">
              <thead className="bg-slate-50/70">
                <tr className="border-b border-line">
                  <th className={headCell}>Task</th>
                  <th className={headCell}>Assigned to</th>
                  <th className={headCell}>Status</th>
                  <th className={headCell}>Due date</th>
                </tr>
              </thead>

              <tbody>
                {tasks.map((task) => {
                  const due = formatDue(task.dueDate, task.status === "DONE");

                  return (
                    <tr
                      key={task.id}
                      className="border-b border-line last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-4">
                        <p className="font-semibold text-ink">{task.title}</p>
                        <p className="mt-0.5 text-[13px] text-muted">
                          {task.category}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            name={task.assignee.fullName}
                            tone={task.assignee.avatarTone}
                          />
                          <span className="whitespace-nowrap text-sm text-ink">
                            {task.assignee.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={task.status} />
                      </td>
                      <td
                        className={cn(
                          "whitespace-nowrap px-4 py-4 text-sm",
                          due.overdue
                            ? "font-semibold text-red-600"
                            : "text-muted",
                        )}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarIcon className="h-4 w-4 text-subtle" />
                          {due.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
