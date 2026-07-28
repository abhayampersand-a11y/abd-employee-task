"use client";

import { useState } from "react";
import type { TaskDto, TaskStatus } from "@/lib/dto";
import { Segmented } from "@/components/ui/segmented";
import { RefreshButton } from "@/components/ui/refresh-button";
import { TaskCard } from "@/components/tasks/task-card";
import { MobileTaskCard } from "@/components/tasks/mobile-task-card";
import { SwipeableRow } from "@/components/tasks/swipeable-row";
import { useUpdateTaskMutation } from "@/store/services/task-api";

const columns: { status: TaskStatus; label: string }[] = [
  { status: "TODO", label: "To Do" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "DONE", label: "Done" },
];

/**
 * Kanban on desktop; segmented control plus a swipeable list on mobile,
 * because three columns are unreadable at 390px.
 */
export function MyTasksBoard({
  tasks,
  onRefresh,
}: {
  tasks: TaskDto[];
  onRefresh?: () => void;
}) {
  const [segment, setSegment] = useState<TaskStatus>("TODO");
  const [updateTask] = useUpdateTaskMutation();

  const byStatus = (status: TaskStatus) =>
    tasks.filter((task) => task.status === status);

  const visible = byStatus(segment);

  function markDone(task: TaskDto) {
    if (!task.can.changeStatus) return;
    updateTask({ id: task.id, status: "DONE" });
  }

  function advance(task: TaskDto) {
    if (!task.can.changeStatus) return;
    const next: TaskStatus = task.status === "TODO" ? "IN_PROGRESS" : "TODO";
    updateTask({ id: task.id, status: next });
  }

  return (
    <>
      {/* ------------------------------------------------------------ mobile */}
      <div className="lg:hidden">
        <RefreshButton className="mb-2" onRefresh={onRefresh} />

        <Segmented
          value={segment}
          onChange={setSegment}
          options={columns.map(({ status, label }) => ({
            value: status,
            label,
            count: byStatus(status).length,
          }))}
        />

        <div className="mt-4 space-y-3">
          {visible.length ? (
            visible.map((task) => (
              <SwipeableRow
                key={task.id}
                onDone={() => markDone(task)}
                onEdit={() => advance(task)}
              >
                <MobileTaskCard task={task} />
              </SwipeableRow>
            ))
          ) : (
            <EmptyColumn />
          )}
        </div>
      </div>

      {/* ----------------------------------------------------------- desktop */}
      <div className="hidden gap-5 lg:grid lg:grid-cols-3">
        {columns.map(({ status, label }) => {
          const items = byStatus(status);

          return (
            <section key={status}>
              <header className="mb-3 flex items-center gap-2">
                <h2 className="font-semibold text-ink">{label}</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-muted">
                  {items.length}
                </span>
              </header>

              <div className="space-y-3">
                {items.length ? (
                  items.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => markDone(task)}
                      disabled={!task.can.changeStatus || task.status === "DONE"}
                      className="block w-full text-left disabled:cursor-default"
                    >
                      <TaskCard task={task} />
                    </button>
                  ))
                ) : (
                  <EmptyColumn />
                )}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

function EmptyColumn() {
  return (
    <p className="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-[13px] text-subtle">
      No tasks here
    </p>
  );
}
