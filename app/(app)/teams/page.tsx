"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { Chip } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { EmployeeTableSkeleton } from "@/components/ui/skeleton";
import { ErrorCard } from "@/components/ui/error-card";
import { AddEmployeeButton } from "@/components/teams/add-employee-button";
import { useEmployeesQuery } from "@/store/services/employee-api";
import { SearchIcon } from "@/components/icons";

const headCell =
  "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted";

const stateStyles = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-100",
  INVITED: "bg-amber-50 text-amber-700 border-amber-100",
  DISABLED: "bg-slate-50 text-muted border-line",
} as const;

const filters = ["ALL", "ACTIVE", "INVITED", "DISABLED"] as const;

const PAGE_SIZE = 10;

export default function TeamsPage() {
  const [status, setStatus] = useState<(typeof filters)[number]>("ALL");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useEmployeesQuery({
    status,
    q,
    page,
    pageSize: PAGE_SIZE,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="mx-auto max-w-[1280px] space-y-5">
      <div className="rounded-xl border border-line bg-surface">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              type="search"
              value={q}
              onChange={(event) => {
                setQ(event.target.value);
                setPage(1);
              }}
              placeholder="Search employees..."
              aria-label="Search employees"
              className="h-10 w-full rounded-lg border border-line bg-slate-50/70 pl-10 pr-3 text-sm text-ink placeholder:text-subtle focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="ml-auto">
            <AddEmployeeButton />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-line px-5 py-3">
          {filters.map((filter) => (
            <Chip
              key={filter}
              active={status === filter}
              onClick={() => {
                setStatus(filter);
                setPage(1);
              }}
            >
              {filter === "ALL"
                ? "All"
                : filter.charAt(0) + filter.slice(1).toLowerCase()}
            </Chip>
          ))}
        </div>

        {isLoading ? (
          <div className="p-5">
            <EmployeeTableSkeleton />
          </div>
        ) : error ? (
          <div className="p-5">
            <ErrorCard error={error} onRetry={refetch} />
          </div>
        ) : items.length === 0 ? (
          <p className="px-5 py-16 text-center text-sm text-muted">
            No employees match that search.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse">
              <thead className="bg-slate-50/70">
                <tr className="border-b border-line">
                  <th className={headCell}>Employee</th>
                  <th className={headCell}>Login ID</th>
                  <th className={headCell}>Role</th>
                  <th className={headCell}>Status</th>
                  <th className={headCell}>Tasks</th>
                  <th className={headCell}>Joined</th>
                </tr>
              </thead>

              <tbody>
                {items.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-line last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={member.fullName}
                          tone={member.avatarTone}
                          size="md"
                        />
                        <div>
                          <p className="font-semibold text-ink">
                            {member.fullName}
                          </p>
                          <p className="mt-0.5 text-[13px] text-muted">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-[13px] text-muted">
                      {member.employeeId ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted">
                      {member.role === "ADMIN" ? "Admin" : "Employee"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
                          stateStyles[member.status],
                        )}
                      >
                        {member.status.charAt(0) +
                          member.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-ink">
                      {member.taskCount}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-muted">
                      {formatDate(member.joined)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          summary={`Showing ${items.length} of ${total} employees`}
          page={page}
          pages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
