import { cn } from "@/lib/cn";
import type { TaskPriority, TaskStatus } from "@/lib/dto";

const priorityStyles: Record<
  TaskPriority,
  { pill: string; dot: string; label: string }
> = {
  HIGH: { pill: "bg-red-50 text-red-700 border-red-100", dot: "bg-red-500", label: "High" },
  MEDIUM: {
    pill: "bg-amber-50 text-amber-700 border-amber-100",
    dot: "bg-amber-500",
    label: "Medium",
  },
  LOW: {
    pill: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
    label: "Low",
  },
};

const statusStyles: Record<TaskStatus, { pill: string; label: string }> = {
  TODO: { pill: "bg-white text-muted border-line", label: "Todo" },
  IN_PROGRESS: {
    pill: "bg-amber-50 text-amber-700 border-amber-100",
    label: "In Progress",
  },
  DONE: {
    pill: "bg-emerald-50 text-emerald-700 border-emerald-100",
    label: "Done",
  },
};

const pillBase =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap";

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const style = priorityStyles[priority];

  return (
    <span className={cn(pillBase, style.pill)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={cn(pillBase, statusStyles[status].pill)}>
      {statusStyles[status].label}
    </span>
  );
}

export function Chip({
  children,
  active,
  className,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const classes = cn(
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
    active
      ? "border-brand-200 bg-brand-50 text-brand-700"
      : "border-line bg-white text-muted",
    className,
  );

  if (!onClick) return <span className={classes}>{children}</span>;

  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={classes}>
      {children}
    </button>
  );
}
