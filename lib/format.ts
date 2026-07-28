import type { TaskDto } from "@/lib/dto";

const DAY = 86_400_000;

function atMidnight(date: Date): number {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

/**
 * "Today, 5:00 PM" / "Yesterday" / "Overdue (2d)" / "Sep 14, 2026".
 * Returned with an `overdue` flag so callers don't re-derive it.
 */
export function formatDue(iso: string | null, done = false): {
  label: string;
  overdue: boolean;
} {
  if (!iso) return { label: "No due date", overdue: false };

  const due = new Date(iso);
  const diffDays = Math.round((atMidnight(due) - atMidnight(new Date())) / DAY);

  if (!done && diffDays < 0) {
    return {
      label: diffDays === -1 ? "Yesterday" : `Overdue (${Math.abs(diffDays)}d)`,
      overdue: true,
    };
  }

  if (diffDays === 0) {
    const time = due.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return { label: `Today, ${time}`, overdue: false };
  }

  if (diffDays === 1) return { label: "Tomorrow", overdue: false };

  return {
    label: due.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    overdue: false,
  };
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export const statusLabels = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
} as const;

export const priorityLabels = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
} as const;

export function isDone(task: TaskDto): boolean {
  return task.status === "DONE";
}
