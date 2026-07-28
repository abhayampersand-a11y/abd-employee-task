"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { matchNav, type NavItem } from "@/lib/nav";

/**
 * Thumb-reachable navigation for phones. Employees mostly open the app on
 * mobile, so the sidebar is replaced entirely below the `lg` breakpoint.
 */
export function MobileTabBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const active = matchNav(items, pathname);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="flex items-stretch px-2 py-2">
        {items.map(({ href, label, shortLabel, icon: Icon }) => {
          const isActive = active?.href === href;

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className="flex flex-col items-center"
              >
                <span
                  className={cn(
                    "flex w-full flex-col items-center gap-1 rounded-2xl px-2 py-2 transition-colors",
                    isActive ? "bg-brand-50 text-brand-600" : "text-ink",
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span
                    className={cn(
                      "text-[13px]",
                      isActive ? "font-semibold" : "font-normal",
                    )}
                  >
                    {shortLabel ?? label}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
