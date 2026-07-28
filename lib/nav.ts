import type { ComponentType, SVGProps } from "react";
import {
  AssignedIcon,
  CheckCircleIcon,
  DashboardIcon,
  HomeIcon,
  ReportsIcon,
  SettingsIcon,
  TasksIcon,
  TeamsIcon,
  UserIcon,
} from "@/components/icons";

export type NavItem = {
  href: string;
  label: string;
  /** Heading shown in the top bar for this route. */
  title: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Shorter label for the mobile tab bar. */
  shortLabel?: string;
};

export const adminNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", title: "Dashboard", icon: DashboardIcon },
  { href: "/tasks", label: "Tasks", title: "My Tasks", icon: TasksIcon },
  { href: "/teams", label: "Teams", title: "Teams", icon: TeamsIcon },
  { href: "/reports", label: "Reports", title: "Reports", icon: ReportsIcon },
  { href: "/settings", label: "Settings", title: "Settings", icon: SettingsIcon },
];

export const employeeNavItems: NavItem[] = [
  { href: "/employee", label: "Dashboard", title: "Dashboard", icon: HomeIcon, shortLabel: "Home" },
  { href: "/employee/my-tasks", label: "My Tasks", title: "My Tasks", icon: CheckCircleIcon, shortLabel: "My Tasks" },
  { href: "/employee/assigned", label: "Assigned by Me", title: "Assigned", icon: AssignedIcon, shortLabel: "Assigned" },
  { href: "/employee/profile", label: "Profile", title: "Profile", icon: UserIcon, shortLabel: "Profile" },
];

/**
 * Longest-prefix match, so an index route like `/employee` never shadows
 * its own children (`/employee/my-tasks`).
 */
export function matchNav(items: NavItem[], pathname: string): NavItem | undefined {
  return items
    .filter(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];
}

/** Routes with a heading but no sidebar entry of their own. */
const extraTitles: Record<string, string> = {
  "/support": "Support",
  "/employee/support": "Support",
};

export function titleForPath(pathname: string): string {
  if (extraTitles[pathname]) return extraTitles[pathname];

  const items = pathname.startsWith("/employee")
    ? employeeNavItems
    : adminNavItems;

  return matchNav(items, pathname)?.title ?? "TaskFlow";
}
