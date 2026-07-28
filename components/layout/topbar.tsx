"use client";

import { usePathname } from "next/navigation";
import { titleForPath } from "@/lib/nav";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useMeQuery } from "@/store/services/auth-api";
import { BellIcon, HelpIcon, MenuIcon, SearchIcon } from "@/components/icons";

export function Topbar({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const pathname = usePathname();
  const { data: me, isLoading } = useMeQuery();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface px-4 sm:gap-4 sm:px-6">
      {onOpenSidebar ? (
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open navigation"
          className="-ml-1 rounded-lg p-2 text-ink transition-colors hover:bg-slate-100 lg:hidden"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
      ) : null}

      {/* Brand-coloured on mobile per the app design, neutral on desktop. */}
      <h1 className="shrink-0 text-xl font-bold text-brand-600 sm:text-[22px] lg:text-xl lg:font-semibold lg:text-ink">
        {titleForPath(pathname)}
      </h1>

      <div className="relative hidden max-w-sm flex-1 md:block">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
        <input
          type="search"
          placeholder="Search tasks..."
          aria-label="Search tasks"
          className="h-10 w-full rounded-lg border border-line bg-slate-50/70 pl-10 pr-3 text-sm text-ink placeholder:text-subtle focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-ink transition-colors hover:bg-slate-100"
        >
          <BellIcon className="h-6 w-6 lg:h-5 lg:w-5" />
          <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <button
          type="button"
          aria-label="Help"
          className="hidden rounded-lg p-2 text-muted transition-colors hover:bg-slate-100 hover:text-ink lg:block"
        >
          <HelpIcon className="h-5 w-5" />
        </button>

        <span className="hidden h-6 w-px bg-line lg:block" />

        {isLoading ? (
          <div className="hidden items-center gap-2.5 p-1 lg:flex">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
        ) : me ? (
          <button
            type="button"
            className="hidden items-center gap-2.5 rounded-lg p-1 transition-colors hover:bg-slate-100 lg:flex"
          >
            <Avatar
              name={me.user.fullName}
              tone={me.user.avatarTone}
              size="md"
            />
            <span className="pr-1 text-sm font-medium text-ink">
              {me.user.fullName}
            </span>
          </button>
        ) : null}
      </div>
    </header>
  );
}
