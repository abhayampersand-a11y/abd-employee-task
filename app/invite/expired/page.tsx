import Link from "next/link";
import type { Metadata } from "next";
import { AlertTriangleIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Invite expired — TaskFlow" };

export default function InviteExpiredPage() {
  return (
    <>
      <div className="w-full max-w-[520px] rounded-xl border border-line bg-surface px-10 py-12 text-center">
        <span className="inline-flex h-[72px] w-[72px] items-center justify-center rounded-full bg-amber-50 text-amber-700">
          <AlertTriangleIcon className="h-8 w-8" />
        </span>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink">
          This invite link has expired
        </h1>
        <p className="mt-3 text-[15px] text-muted">
          Ask your admin to send you a new invite.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          Go to login
        </Link>

        <hr className="mt-8 border-line" />
        <p className="mt-6 text-lg tracking-[0.3em] text-slate-300">•••</p>
      </div>

      <p className="mt-10 text-[13px] text-subtle">TaskFlow Enterprise Plan</p>
    </>
  );
}
