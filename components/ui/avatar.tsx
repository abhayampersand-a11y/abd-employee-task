import { cn } from "@/lib/cn";

const tones: Record<string, string> = {
  indigo: "bg-brand-600 text-white",
  violet: "bg-brand-400 text-white",
  emerald: "bg-emerald-600 text-white",
  amber: "bg-amber-500 text-white",
  slate: "bg-slate-500 text-white",
};

const sizes = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-[13px]",
  lg: "h-14 w-14 text-lg",
};

export function Avatar({
  name,
  tone = "indigo",
  size = "sm",
  className,
}: {
  name: string;
  /** Comes straight from `user.avatarTone`; unknown values fall back to indigo. */
  tone?: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <span
      title={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-wide",
        tones[tone] ?? tones.indigo,
        sizes[size],
        className,
      )}
    >
      {initials}
    </span>
  );
}
