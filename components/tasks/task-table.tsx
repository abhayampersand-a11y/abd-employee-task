"use client";

import { cn } from "@/lib/cn";
import type { TaskDto } from "@/lib/dto";
import { formatDue } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { PriorityBadge, StatusBadge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { NewTaskButton } from "@/components/tasks/new-task-button";
import { useUpdateTaskMutation } from "@/store/services/task-api";
import {
  AlertCircleIcon,
  ChevronDownIcon,
  DragHandleIcon,
  FilterIcon,
} from "@/components/icons";

const headCell =
  "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted";

export function TaskTable({
  tasks,
  summary,
  page = 1,
  pages = 1,
  onPageChange,
}: {
  tasks: TaskDto[];
  summary: string;
  page?: number;
  pages?: number;
  onPageChange?: (page: number) => void;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
        <NewTaskButton />

        <Button variant="secondary">
          <FilterIcon className="h-4 w-4" />
          Filter
        </Button>

        <div className="ml-auto flex items-center gap-1.5 text-sm">
          <span className="text-muted">Sort by:</span>
          <button
            type="button"
            className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700"
          >
            Due Date
            <ChevronDownIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className="px-5 py-16 text-center text-sm text-muted">
          No tasks yet. Use “New Task” to assign the first one.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse">
            <thead className="bg-slate-50/70">
              <tr className="border-b border-line">
                <th className={cn(headCell, "w-12")} />
                <th className={headCell}>Task name</th>
                <th className={headCell}>Priority</th>
                <th className={headCell}>Status</th>
                <th className={headCell}>Due date</th>
                <th className={headCell}>Assignee</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        summary={summary}
        page={page}
        pages={pages}
        onPageChange={onPageChange}
      />
    </div>
  );
}

function TaskRow({ task }: { task: TaskDto }) {
  const [updateTask, { isLoading }] = useUpdateTaskMutation();

  const done = task.status === "DONE";
  const due = formatDue(task.dueDate, done);

  return (
    <tr className="border-b border-line last:border-0 hover:bg-slate-50/60">
      <td className="px-4 py-4 align-middle">
        {due.overdue ? (
          <AlertCircleIcon className="h-5 w-5 text-red-500" />
        ) : (
          <DragHandleIcon className="h-5 w-5 text-slate-300" />
        )}
      </td>

      <td className="px-4 py-4">
        <p
          className={cn(
            "font-semibold",
            due.overdue && "text-red-600",
            done && "text-muted line-through",
            !due.overdue && !done && "text-ink",
          )}
        >
          {task.title}
        </p>
        <p className="mt-0.5 text-[13px] text-muted">{task.category}</p>
      </td>

      <td className="px-4 py-4">
        <PriorityBadge priority={task.priority} />
      </td>

      <td className="px-4 py-4">
        {task.can.changeStatus ? (
          <select
            value={task.status}
            disabled={isLoading}
            aria-label={`Status of ${task.title}`}
            onChange={(event) =>
              updateTask({
                id: task.id,
                status: event.target.value as TaskDto["status"],
              })
            }
            className="cursor-pointer rounded-full border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
          >
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        ) : (
          <StatusBadge status={task.status} />
        )}
      </td>

      <td
        className={cn(
          "whitespace-nowrap px-4 py-4 text-sm",
          due.overdue ? "font-semibold text-red-600" : "text-muted",
          done && "text-subtle",
        )}
      >
        {due.label}
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
    </tr>
  );
}
