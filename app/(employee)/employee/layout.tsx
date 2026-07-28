import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { EmployeeShell } from "@/components/layout/employee-shell";

/**
 * Open to everyone signed in. Admins get here too — they have their own
 * assigned work — which is why the "View as Admin" shortcut only renders
 * for them.
 */
export default async function EmployeeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSession();

  if (!user) redirect("/login");
  if (!user.companyId) redirect("/onboarding/company");

  return (
    <EmployeeShell isAdmin={user.role === "ADMIN"}>{children}</EmployeeShell>
  );
}
