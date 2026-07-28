"use client";

import { useId, useState } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";
import { ChevronDownIcon, EyeIcon, EyeOffIcon } from "@/components/icons";

const controlBase =
  "w-full rounded-lg border border-line bg-slate-50/70 px-3.5 text-[15px] text-ink " +
  "placeholder:text-subtle transition-colors " +
  "focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 " +
  "disabled:cursor-not-allowed disabled:text-muted";

type LabelTone = "default" | "caps";

function FieldLabel({
  htmlFor,
  children,
  tone = "default",
  action,
}: {
  htmlFor: string;
  children: ReactNode;
  tone?: LabelTone;
  action?: ReactNode;
}) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-3">
      <label
        htmlFor={htmlFor}
        className={cn(
          tone === "caps"
            ? "text-[11px] font-semibold uppercase tracking-wider text-muted"
            : "text-[13px] font-semibold text-ink",
        )}
      >
        {children}
      </label>
      {action}
    </div>
  );
}

type FieldShellProps = {
  label?: ReactNode;
  labelTone?: LabelTone;
  action?: ReactNode;
  hint?: ReactNode;
  className?: string;
};

export function TextField({
  label,
  labelTone,
  action,
  hint,
  className,
  id,
  ...props
}: FieldShellProps & InputHTMLAttributes<HTMLInputElement>) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className={className}>
      {label ? (
        <FieldLabel htmlFor={fieldId} tone={labelTone} action={action}>
          {label}
        </FieldLabel>
      ) : null}
      <input id={fieldId} className={cn(controlBase, "h-12")} {...props} />
      {hint ? <p className="mt-1.5 text-[13px] text-muted">{hint}</p> : null}
    </div>
  );
}

export function PasswordField({
  label,
  labelTone,
  action,
  hint,
  className,
  id,
  ...props
}: FieldShellProps & InputHTMLAttributes<HTMLInputElement>) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div className={className}>
      {label ? (
        <FieldLabel htmlFor={fieldId} tone={labelTone} action={action}>
          {label}
        </FieldLabel>
      ) : null}
      <div className="relative">
        <input
          id={fieldId}
          type={visible ? "text" : "password"}
          className={cn(controlBase, "h-12 pr-11")}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-subtle transition-colors hover:text-muted"
        >
          {visible ? (
            <EyeOffIcon className="h-[18px] w-[18px]" />
          ) : (
            <EyeIcon className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>
      {hint ? <p className="mt-1.5 text-[13px] text-muted">{hint}</p> : null}
    </div>
  );
}

export function TextAreaField({
  label,
  labelTone,
  action,
  hint,
  className,
  id,
  rows = 4,
  ...props
}: FieldShellProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className={className}>
      {label ? (
        <FieldLabel htmlFor={fieldId} tone={labelTone} action={action}>
          {label}
        </FieldLabel>
      ) : null}
      <textarea
        id={fieldId}
        rows={rows}
        className={cn(controlBase, "resize-none py-3")}
        {...props}
      />
      {hint ? <p className="mt-1.5 text-[13px] text-muted">{hint}</p> : null}
    </div>
  );
}

export function SelectField({
  label,
  labelTone,
  action,
  hint,
  className,
  id,
  leading,
  children,
  ...props
}: FieldShellProps & { leading?: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className={className}>
      {label ? (
        <FieldLabel htmlFor={fieldId} tone={labelTone} action={action}>
          {label}
        </FieldLabel>
      ) : null}
      <div className="relative">
        {leading ? (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
            {leading}
          </span>
        ) : null}
        <select
          id={fieldId}
          className={cn(
            controlBase,
            "h-12 cursor-pointer appearance-none pr-10",
            leading ? "pl-8" : undefined,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      </div>
      {hint ? <p className="mt-1.5 text-[13px] text-muted">{hint}</p> : null}
    </div>
  );
}

export function Checkbox({
  label,
  id,
  className,
  ...props
}: { label: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <input
        id={fieldId}
        type="checkbox"
        className="h-[18px] w-[18px] cursor-pointer rounded border-line text-brand-600 accent-brand-600 focus:ring-brand-500"
        {...props}
      />
      <label htmlFor={fieldId} className="cursor-pointer text-sm text-muted">
        {label}
      </label>
    </div>
  );
}

/** Four-segment meter used on password creation screens. */
export function PasswordStrength({ score = 0 }: { score?: 0 | 1 | 2 | 3 | 4 }) {
  const tones = ["bg-red-400", "bg-amber-400", "bg-amber-400", "bg-emerald-500"];

  return (
    <div className="mt-2 flex gap-1.5" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full",
            i < score ? tones[i] : "bg-slate-200",
          )}
        />
      ))}
    </div>
  );
}
