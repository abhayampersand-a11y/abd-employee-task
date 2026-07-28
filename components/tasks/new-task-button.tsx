"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/icons";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";

/**
 * Self-contained trigger + dialog. Render it anywhere a task can be created:
 * `variant="button"` for toolbars, `variant="fab"` for the floating action button.
 */
export function NewTaskButton({
  variant = "button",
  className,
}: {
  variant?: "button" | "fab";
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === "fab" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="New task"
          className={cn(
            "fixed bottom-6 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-[20px] bg-brand-600 text-white shadow-lg shadow-brand-600/30 transition-colors hover:bg-brand-700 lg:rounded-full",
            className,
          )}
        >
          <PlusIcon className="h-7 w-7" strokeWidth={2} />
        </button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <PlusIcon className="h-4 w-4" strokeWidth={2} />
          New Task
        </Button>
      )}

      <CreateTaskModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
