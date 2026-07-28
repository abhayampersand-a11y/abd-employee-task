"use client";

import { cn } from "@/lib/cn";

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  count?: number;
};

/** Pill-in-a-track control. Replaces the kanban columns on small screens. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (next: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn("flex gap-1 rounded-2xl bg-brand-50 p-1.5", className)}
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 rounded-xl px-2 py-2.5 text-[15px] font-semibold transition-colors",
              active
                ? "bg-white text-brand-600 shadow-sm"
                : "text-slate-500 hover:text-ink",
            )}
          >
            {option.label}
            {option.count === undefined ? null : ` (${option.count})`}
          </button>
        );
      })}
    </div>
  );
}
