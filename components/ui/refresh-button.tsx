"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { RefreshIcon } from "@/components/icons";

/**
 * Manual refresh affordance shown above mobile lists.
 * `onRefresh` will be RTK Query's `refetch` once the data layer is wired.
 */
export function RefreshButton({
  onRefresh,
  className,
}: {
  onRefresh?: () => void;
  className?: string;
}) {
  const [spinning, setSpinning] = useState(false);

  function handleClick() {
    setSpinning(true);
    onRefresh?.();
    window.setTimeout(() => setSpinning(false), 600);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Refresh"
      className={cn(
        "mx-auto flex h-10 w-10 items-center justify-center rounded-full text-brand-600 transition-colors hover:bg-brand-50",
        className,
      )}
    >
      <RefreshIcon className={cn("h-5 w-5", spinning && "animate-spin")} />
    </button>
  );
}
