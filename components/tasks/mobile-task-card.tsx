import { cn } from "@/lib/cn";
import type { TaskDto } from "@/lib/dto";
import { formatDue } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { CalendarIcon } from "@/components/icons";

const priorityDot = {
  HIGH: "bg-red-500",
  MEDIUM: "bg-amber-500",
  LOW: "bg-brand-500",
} as const;

/**
 * The chip on the right of each card. Urgent work is called out; everything
 * else shows the department it belongs to (Cutting, Packing, Quality…).
 */
function TaskChip({ task }: { task: TaskDto }) {
  const urgent = task.priority === "HIGH";
  const label = urgent ? "Urgent" : task.category;

  if (!label) return null;

  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
        urgent ? "bg-red-50 text-red-600" : "bg-brand-50 text-slate-500",
      )}
    >
      {label}
    </span>
  );
}

/**
 * Full-width card used by every worker list on phones.
 *
 * `perspective` picks which person the footer names: "received" shows who
 * handed the job over, "sent" shows who has to do it.
 */
export function MobileTaskCard({
  task,
  perspective = "received",
}: {
  task: TaskDto;
  perspective?: "received" | "sent";
}) {
  const done = task.status === "DONE";
  const person = perspective === "sent" ? task.assignee : task.createdBy;
  const relation = perspective === "sent" ? "Assigned to" : "Assigned by";
  const due = formatDue(task.dueDate, done);

  return (
    <article className="rounded-2xl border border-line bg-surface px-4 py-4">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-2 h-2.5 w-2.5 shrink-0 rounded-full",
            priorityDot[task.priority],
          )}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3
              className={cn(
                "text-[17px] font-semibold leading-snug",
                done ? "text-muted line-through" : "text-ink",
              )}
            >
              {task.title}
            </h3>
            <TaskChip task={task} />
          </div>

          {task.description ? (
            <p className="mt-1.5 truncate text-[15px] text-muted">
              {task.description}
            </p>
          ) : null}

          <div className="mt-4 flex items-center justify-between gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-2 text-[15px]",
                due.overdue ? "font-medium text-red-600" : "text-muted",
              )}
            >
              <CalendarIcon className="h-[18px] w-[18px]" />
              {due.label}
            </span>

            <span className="inline-flex shrink-0 items-center gap-2">
              <span className="text-[15px] text-muted">
                {relation} {person.firstName}
              </span>
              <Avatar name={person.fullName} tone={person.avatarTone} size="sm" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
