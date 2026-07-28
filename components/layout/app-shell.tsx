"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { adminNavItems } from "@/lib/nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { NewTaskButton } from "@/components/tasks/new-task-button";

/** Admin shell: persistent sidebar on desktop, slide-over drawer on mobile. */
export function AppShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const sidebar = (onNavigate?: () => void) => (
    <Sidebar
      items={adminNavItems}
      homeHref="/dashboard"
      subtitle="Enterprise Plan"
      switchRole={{ href: "/employee", label: "View as Employee" }}
      onNavigate={onNavigate}
    />
  );

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] lg:block">
        {sidebar()}
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileNavOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
          className={cn(
            "absolute inset-0 cursor-default bg-slate-900/40 transition-opacity",
            mobileNavOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 w-[264px] transition-transform duration-200",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {sidebar(() => setMobileNavOpen(false))}
        </aside>
      </div>

      <div className="flex min-h-screen flex-col lg:pl-[264px]">
        <Topbar onOpenSidebar={() => setMobileNavOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      <NewTaskButton variant="fab" />
    </div>
  );
}
