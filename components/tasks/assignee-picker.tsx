"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeesQuery } from "@/store/services/employee-api";
import { useMeQuery } from "@/store/services/auth-api";
import { CheckIcon, ChevronRightIcon, SearchIcon } from "@/components/icons";

/**
 * Visible picker for "Assign to".
 *
 * A native <select> was unusable here — the design needs avatars and a search
 * box, and anyone in the factory can be assigned work, so the list gets long.
 */
export function AssigneePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { data: me } = useMeQuery();
  const { data, isLoading } = useEmployeesQuery({
    status: "ACTIVE",
    pageSize: 100,
  });

  const people = data?.items ?? [];
  const selected = people.find((person) => person.id === value);

  const filtered = query.trim()
    ? people.filter((person) =>
        person.fullName.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : people;

  function pick(id: string) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-3.5 rounded-xl border bg-slate-50/70 px-4 py-3.5 text-left transition-colors",
          open ? "border-brand-500 bg-white" : "border-line hover:bg-white",
        )}
      >
        {selected ? (
          <Avatar name={selected.fullName} tone={selected.avatarTone} size="md" />
        ) : (
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[13px] font-semibold text-white">
            {me ? `${me.user.firstName[0]}${me.user.lastName[0]}` : "?"}
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[17px] font-semibold text-ink sm:text-[15px]">
            {selected ? selected.fullName : "Myself"}
          </span>
          <span className="block text-[15px] text-muted sm:text-[13px]">
            {selected ? "Tap to change" : "Select a team member"}
          </span>
        </span>

        <ChevronRightIcon
          className={cn(
            "h-5 w-5 shrink-0 text-muted transition-transform",
            open && "rotate-90",
          )}
        />
      </button>

      {open ? (
        <div className="mt-2 overflow-hidden rounded-xl border border-line bg-white">
          <div className="relative border-b border-line">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search team..."
              aria-label="Search team"
              className="h-11 w-full bg-transparent pl-10 pr-3 text-[15px] text-ink placeholder:text-subtle focus:outline-none"
            />
          </div>

          <ul className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <li className="space-y-3 p-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </li>
            ) : (
              <>
                <li>
                  <PickerRow
                    label="Myself"
                    caption={me?.user.fullName ?? ""}
                    tone={me?.user.avatarTone}
                    name={me?.user.fullName ?? "Me"}
                    active={!value}
                    onClick={() => pick("")}
                  />
                </li>

                {filtered
                  .filter((person) => person.id !== me?.user.id)
                  .map((person) => (
                    <li key={person.id}>
                      <PickerRow
                        label={person.fullName}
                        caption={
                          person.role === "ADMIN" ? "Admin" : "Employee"
                        }
                        tone={person.avatarTone}
                        name={person.fullName}
                        active={person.id === value}
                        onClick={() => pick(person.id)}
                      />
                    </li>
                  ))}

                {filtered.length === 0 ? (
                  <li className="px-4 py-6 text-center text-sm text-muted">
                    Nobody matches “{query}”.
                  </li>
                ) : null}
              </>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function PickerRow({
  label,
  caption,
  name,
  tone,
  active,
  onClick,
}: {
  label: string;
  caption: string;
  name: string;
  tone?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
        active ? "bg-brand-50" : "hover:bg-slate-50",
      )}
    >
      <Avatar name={name} tone={tone} size="md" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-ink">
          {label}
        </span>
        <span className="block truncate text-[13px] text-muted">{caption}</span>
      </span>
      {active ? <CheckIcon className="h-5 w-5 text-brand-600" /> : null}
    </button>
  );
}
