"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { useDismissable } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AssigneePicker } from "@/components/tasks/assignee-picker";
import { readApiError } from "@/lib/use-api-error";
import type { TaskPriority } from "@/lib/dto";
import { useCreateTaskMutation } from "@/store/services/task-api";
import { useMeQuery } from "@/store/services/auth-api";
import { CalendarIcon, CloseIcon, PlusIcon } from "@/components/icons";

const priorities: { value: TaskPriority; label: string; dot: string }[] = [
  { value: "LOW", label: "Low", dot: "bg-emerald-400" },
  { value: "MEDIUM", label: "Medium", dot: "bg-amber-400" },
  { value: "HIGH", label: "High", dot: "bg-red-500" },
];

const capsLabel =
  "mb-2 block text-[13px] font-semibold uppercase tracking-wider text-muted";

const controlBox =
  "w-full rounded-xl border border-line bg-slate-50/70 text-ink placeholder:text-subtle " +
  "focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20";

/**
 * Bottom sheet on phones, centred dialog from `sm` up.
 * One form; only the chrome around it changes.
 */
export function CreateTaskModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: me } = useMeQuery();
  const [createTask, { isLoading, error }] = useCreateTaskMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");

  useDismissable(open, onClose);

  if (!open) return null;

  const { message, fieldErrors } = readApiError(error);

  function reset() {
    setTitle("");
    setDescription("");
    setCategory("");
    setPriority("MEDIUM");
    setAssigneeId("");
    setDueDate("");
  }

  async function handleCreate() {
    try {
      await createTask({
        title,
        description: description || null,
        category: category || null,
        // Empty selection means "assign it to myself".
        assigneeId: assigneeId || me?.user.id || "",
        priority,
        dueDate: dueDate ? new Date(`${dueDate}T17:00:00`).toISOString() : null,
      }).unwrap();

      reset();
      onClose();
    } catch {
      // Message renders from `error` below.
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="New task"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-900/60"
      />

      <div className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-canvas sm:max-w-[560px] sm:rounded-2xl sm:bg-white">
        <span className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-slate-300 sm:hidden" />

        {/* Mobile header */}
        <header className="flex items-center justify-between gap-3 px-5 py-4 sm:hidden">
          <button type="button" onClick={onClose} className="text-[17px] text-ink">
            Cancel
          </button>
          <h2 className="text-[19px] font-bold text-ink">New Task</h2>
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={isLoading || !title.trim()}
            className="rounded-full px-5 py-1"
          >
            {isLoading ? "…" : "Create"}
          </Button>
        </header>

        {/* Desktop header */}
        <header className="hidden items-center justify-between border-b border-line px-6 py-5 sm:flex">
          <h2 className="text-xl font-semibold text-ink">Create Task</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-muted transition-colors hover:bg-slate-100 hover:text-ink"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </header>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleCreate();
          }}
          className="flex-1 space-y-6 overflow-y-auto px-5 pb-8 pt-2 sm:px-6 sm:py-5"
        >
          {message ? (
            <p
              role="alert"
              className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {message}
            </p>
          ) : null}

          <div>
            <label htmlFor="task-title" className={capsLabel}>
              Task title
            </label>
            <input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What needs to be done?"
              className={cn(controlBox, "px-4 py-4 text-[19px] sm:py-3 sm:text-lg")}
            />
            {fieldErrors.title ? (
              <p className="mt-1.5 text-[13px] text-red-600">{fieldErrors.title}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="task-description" className={capsLabel}>
              Description
            </label>
            <textarea
              id="task-description"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add some details about this task..."
              className={cn(
                controlBox,
                "resize-none px-4 py-4 text-[17px] sm:text-[15px]",
              )}
            />
          </div>

          <div>
            <label htmlFor="task-category" className={capsLabel}>
              Department
            </label>
            <input
              id="task-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Cutting, Stitching, Packing…"
              className={cn(controlBox, "px-4 py-3.5 text-[17px] sm:text-[15px]")}
            />
          </div>

          <div>
            <span className={capsLabel}>Assign to</span>
            <AssigneePicker value={assigneeId} onChange={setAssigneeId} />
          </div>

          <div>
            <span className={capsLabel}>Priority</span>
            <div className="grid grid-cols-3 gap-3">
              {priorities.map((option) => {
                const active = option.value === priority;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setPriority(option.value)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl border py-3.5 text-[15px] font-medium transition-colors",
                      active
                        ? "border-brand-600 bg-white text-brand-600"
                        : "border-line bg-slate-50/70 text-ink",
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full", option.dot)} />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="task-due" className={capsLabel}>
              Due date
            </label>
            <div
              className={cn(
                controlBox,
                "flex items-center gap-3.5 px-4 py-3 focus-within:border-brand-500 focus-within:bg-white",
              )}
            >
              <CalendarIcon className="h-6 w-6 shrink-0 text-brand-600" />
              <input
                type="date"
                id="task-due"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="min-w-0 flex-1 bg-transparent py-1 text-[17px] font-medium text-ink focus:outline-none sm:text-[15px]"
              />
              {dueDate ? (
                <button
                  type="button"
                  onClick={() => setDueDate("")}
                  className="shrink-0 text-[13px] font-semibold text-muted hover:text-ink"
                >
                  Clear
                </button>
              ) : null}
            </div>
            <p className="mt-1.5 text-[13px] text-muted">
              Leave empty for no deadline.
            </p>
          </div>

          <button
            type="button"
            className="mx-auto flex items-center gap-2 py-1 text-[17px] font-semibold text-brand-600 sm:text-[15px]"
          >
            <PlusIcon className="h-5 w-5" strokeWidth={2} />
            Add Tags or Checklist
          </button>
        </form>

        {/* Desktop footer — mobile puts Create in the header instead */}
        <footer className="hidden items-center justify-end gap-3 border-t border-line bg-slate-50 px-6 py-4 sm:flex">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isLoading || !title.trim()}>
            {isLoading ? "Creating…" : "Create task"}
          </Button>
        </footer>
      </div>
    </div>
  );
}
