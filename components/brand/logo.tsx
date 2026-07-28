import { cn } from "@/lib/cn";
import { DashboardIcon, LogoMarkIcon } from "@/components/icons";

export function LogoMark({
  className,
  variant = "solid",
}: {
  className?: string;
  variant?: "solid" | "tinted";
}) {
  const Glyph = variant === "solid" ? LogoMarkIcon : DashboardIcon;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-xl",
        variant === "solid"
          ? "bg-brand-600 text-white"
          : "bg-brand-50 text-brand-600",
        className ?? "h-10 w-10",
      )}
    >
      <Glyph className="h-[55%] w-[55%]" strokeWidth={2} />
    </span>
  );
}

export function Wordmark({
  size = "md",
  subtitle,
  className,
}: {
  size?: "sm" | "md" | "lg";
  subtitle?: string;
  className?: string;
}) {
  const sizes = {
    sm: { mark: "h-8 w-8", text: "text-lg" },
    md: { mark: "h-10 w-10", text: "text-2xl" },
    lg: { mark: "h-11 w-11", text: "text-[26px]" },
  }[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={sizes.mark} />
      <span className="flex flex-col leading-none">
        <span className={cn("font-bold tracking-tight text-brand-600", sizes.text)}>
          TaskFlow
        </span>
        {subtitle ? (
          <span className="mt-1 text-xs text-muted">{subtitle}</span>
        ) : null}
      </span>
    </span>
  );
}
