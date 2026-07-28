import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/cn";

export type StatTone = "indigo" | "amber" | "emerald" | "red";

const tones: Record<StatTone, string> = {
  indigo: "bg-brand-50 text-brand-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
  red: "bg-red-50 text-red-600",
};

export type Stat = {
  tag: string;
  value: string | number;
  label: string;
  tone: StatTone;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export function StatCard({ tag, value, label, tone, icon: Icon }: Stat) {
  return (
    <article className="rounded-xl border border-line bg-surface p-5">
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-xl",
            tones[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-[13px] text-muted">{tag}</span>
      </div>
      <p className="mt-5 text-[32px] font-semibold leading-none text-ink">
        {value}
      </p>
      <p className="mt-2 text-sm text-muted">{label}</p>
    </article>
  );
}

export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
