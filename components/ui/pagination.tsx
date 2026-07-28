"use client";

import { cn } from "@/lib/cn";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

const cellBase =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none";

export function Pagination({
  page = 1,
  pages = 1,
  summary,
  onPageChange,
}: {
  page?: number;
  pages?: number;
  summary?: string;
  onPageChange?: (page: number) => void;
}) {
  // Window the buttons so 40 pages don't render 40 controls.
  const start = Math.max(1, Math.min(page - 1, pages - 2));
  const visible = Array.from({ length: Math.min(3, pages) }, (_, i) => start + i);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-5 py-4">
      <p className="text-[13px] text-muted">{summary}</p>

      <nav className="flex items-center gap-2" aria-label="Pagination">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange?.(page - 1)}
          className={cn(cellBase, "border-line bg-white text-subtle hover:bg-slate-50")}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        {visible.map((n) => (
          <button
            key={n}
            type="button"
            aria-current={n === page ? "page" : undefined}
            onClick={() => onPageChange?.(n)}
            className={cn(
              cellBase,
              n === page
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-line bg-white text-muted hover:bg-slate-50",
            )}
          >
            {n}
          </button>
        ))}

        <button
          type="button"
          aria-label="Next page"
          disabled={page >= pages}
          onClick={() => onPageChange?.(page + 1)}
          className={cn(cellBase, "border-line bg-white text-subtle hover:bg-slate-50")}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}
