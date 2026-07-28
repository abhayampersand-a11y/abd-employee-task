"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { FormSkeleton } from "@/components/ui/skeleton";
import {
  ChangePasswordCard,
  ProfileCard,
} from "@/components/settings/profile-cards";
import { useLogoutMutation, useMeQuery } from "@/store/services/auth-api";
import { SignOutIcon } from "@/components/icons";

export default function EmployeeProfilePage() {
  const router = useRouter();
  const { data: me, isLoading } = useMeQuery();
  const [logout, { isLoading: signingOut }] = useLogoutMutation();

  async function handleSignOut() {
    await logout().unwrap().catch(() => undefined);
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[720px] space-y-5">
      {isLoading ? (
        <FormSkeleton fields={2} />
      ) : me ? (
        <Card className="text-center">
          <div className="flex flex-col items-center">
            <Avatar
              name={me.user.fullName}
              tone={me.user.avatarTone}
              size="lg"
            />
            <h2 className="mt-4 text-lg font-semibold text-ink">
              {me.user.fullName}
            </h2>
            <p className="mt-1 text-sm text-muted">{me.user.email}</p>
            <span className="mt-3 inline-flex rounded-full border border-line bg-slate-50 px-3 py-1 text-xs font-medium text-muted">
              {me.company?.name ?? "Employee"}
            </span>
          </div>
        </Card>
      ) : null}

      <ProfileCard />
      <ChangePasswordCard />

      <Card padded={false}>
        <ul className="divide-y divide-line">
          <li>
            <Link
              href="/employee/support"
              className="flex items-center justify-between px-5 py-4 text-sm font-medium text-ink hover:bg-slate-50"
            >
              Help &amp; support
              <span className="text-subtle">›</span>
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex w-full items-center gap-2.5 px-5 py-4 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              <SignOutIcon className="h-[18px] w-[18px]" />
              {signingOut ? "Signing out…" : "Log out"}
            </button>
          </li>
        </ul>
      </Card>
    </div>
  );
}
