"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { useLogoutMutation } from "@/store/services/auth-api";
import { matchNav, type NavItem } from "@/lib/nav";
import { Wordmark } from "@/components/brand/logo";
import { HelpIcon, SignOutIcon, SwitchRoleIcon } from "@/components/icons";

const itemBase =
  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors";

export function Sidebar({
  items,
  homeHref,
  subtitle,
  supportHref = "/support",
  /** Only passed for admins — employees have no admin area to switch to. */
  switchRole,
  onNavigate,
}: {
  items: NavItem[];
  homeHref: string;
  subtitle: string;
  supportHref?: string;
  switchRole?: { href: string; label: string };
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const active = matchNav(items, pathname);
  const [logout, { isLoading: signingOut }] = useLogoutMutation();

  async function handleSignOut() {
    onNavigate?.();
    await logout().unwrap().catch(() => undefined);
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col border-r border-line bg-surface">
      <div className="px-6 py-6">
        <Link href={homeHref} onClick={onNavigate}>
          <Wordmark subtitle={subtitle} />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = active?.href === href;

          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                itemBase,
                "relative",
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-muted hover:bg-slate-50 hover:text-ink",
              )}
            >
              {isActive ? (
                <span className="absolute inset-y-1 -left-4 w-1 rounded-r-full bg-brand-600" />
              ) : null}
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-line px-4 py-4">
        {switchRole ? (
          <Link
            href={switchRole.href}
            onClick={onNavigate}
            className={cn(itemBase, "text-brand-600 hover:bg-brand-50")}
          >
            <SwitchRoleIcon className="h-5 w-5 shrink-0" />
            {switchRole.label}
          </Link>
        ) : null}
        <Link
          href={supportHref}
          onClick={onNavigate}
          className={cn(itemBase, "text-muted hover:bg-slate-50 hover:text-ink")}
        >
          <HelpIcon className="h-5 w-5 shrink-0" />
          Support
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className={cn(
            itemBase,
            "w-full text-red-600 hover:bg-red-50 disabled:opacity-60",
          )}
        >
          <SignOutIcon className="h-5 w-5 shrink-0" />
          {signingOut ? "Signing out…" : "Sign Out"}
        </button>
      </div>
    </div>
  );
}
