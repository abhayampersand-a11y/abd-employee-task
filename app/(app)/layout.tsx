import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";

/**
 * Admin-only area. Enforced here on the server, not just by hiding links —
 * an employee typing /teams into the address bar lands back on their own
 * dashboard instead of seeing the whole factory.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getSession();

  if (!user) redirect("/login");
  if (!user.companyId) redirect("/onboarding/company");
  if (user.role !== "ADMIN") redirect("/employee");

  return <AppShell>{children}</AppShell>;
}
