import { cn } from "@/lib/cn";
import type { TaskDto } from "@/lib/dto";
import { formatDue } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { PriorityBadge, StatusBadge } from "@/components/ui/badge";
import { CalendarIcon } from "@/components/icons";

const priorityDot = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-amber-500",
  LOW: "bg-emerald-500",
} as const;

/** Board card used on the desktop kanban. */
export function TaskCard({
  task,
  showStatus = false,
  perspective = "received",
}: {
  task: TaskDto;
  showStatus?: boolean;
  perspective?: "received" | "sent";
}) {
  const done = task.status === "DONE";
  const person = perspective === "sent" ? task.assignee : task.createdBy;
  const due = formatDue(task.dueDate, done);

  return (
    <article className="rounded-xl border border-line bg-surface p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            className={cn(
              "mt-1.5 h-2 w-2 shrink-0 rounded-full",
              priorityDot[task.priority],
            )}
          />
          <h3
            className={cn(
              "text-[15px] font-semibold leading-snug",
              done ? "text-muted line-through" : "text-ink",
            )}
          >
            {task.title}
          </h3>
        </div>

        {showStatus ? (
          <StatusBadge status={task.status} />
        ) : (
          <PriorityBadge priority={task.priority} />
        )}
      </div>

      {task.description ? (
        <p className="mt-2 line-clamp-1 pl-[18px] text-[13px] text-muted">
          {task.description}
        </p>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3 pl-[18px]">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-[13px]",
            due.overdue ? "font-semibold text-red-600" : "text-muted",
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {due.label}
        </span>

        <span className="inline-flex items-center gap-1.5">
          <span className="text-[13px] text-subtle">
            {perspective === "sent" ? "to" : "by"}
          </span>
          <Avatar name={person.fullName} tone={person.avatarTone} size="xs" />
        </span>
      </div>
    </article>
  );
}
