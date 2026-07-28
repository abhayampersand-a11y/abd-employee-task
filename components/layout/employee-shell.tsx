"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { employeeNavItems } from "@/lib/nav";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { NewTaskButton } from "@/components/tasks/new-task-button";

/**
 * Employee shell.
 *
 * Desktop: persistent sidebar.
 * Mobile:  bottom tab bar for the four main sections, plus a drawer behind the
 *          hamburger for the secondary items (support, sign out).
 * No Teams or Company Settings anywhere — employees can't reach those.
 */
export function EmployeeShell({
  children,
  isAdmin = false,
}: {
  children: ReactNode;
  /** Only admins get the shortcut back to the admin area. */
  isAdmin?: boolean;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const sidebar = (onNavigate?: () => void) => (
    <Sidebar
      items={employeeNavItems}
      homeHref="/employee"
      subtitle={isAdmin ? "Admin · my work" : "Employee"}
      supportHref="/employee/support"
      switchRole={
        isAdmin ? { href: "/dashboard", label: "View as Admin" } : undefined
      }
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
        {/* Bottom padding clears the mobile tab bar and its safe area. */}
        <main className="flex-1 px-4 pb-32 pt-4 sm:px-6 lg:px-8 lg:pb-8 lg:pt-6">
          {children}
        </main>
      </div>

      <MobileTabBar items={employeeNavItems} />
      <NewTaskButton variant="fab" className="bottom-28 lg:bottom-6" />
    </div>
  );
}
