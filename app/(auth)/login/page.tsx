import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { LogoMark } from "@/components/brand/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in — TaskFlow" };

export default function LoginPage() {
  return (
    <>
      <div className="w-full max-w-[480px] rounded-2xl border border-line bg-surface px-10 py-11 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <LogoMark variant="tinted" className="h-14 w-14" />
          <h1 className="mt-5 text-[28px] font-bold tracking-tight text-ink">
            TaskFlow
          </h1>
          <p className="mt-1.5 text-[15px] text-muted">
            Enterprise productivity suite
          </p>
        </div>

        {/* useSearchParams needs a Suspense boundary to stay prerenderable. */}
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>

        <div className="mt-8 border-t border-line pt-6 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            Contact your admin
          </Link>
        </div>
      </div>

      <nav className="mt-6 flex items-center gap-8 text-[13px] text-subtle">
        <Link href="/privacy" className="hover:text-muted">
          Privacy Policy
        </Link>
        <Link href="/terms" className="hover:text-muted">
          Terms of Service
        </Link>
        <Link href="/support" className="hover:text-muted">
          Support
        </Link>
      </nav>
    </>
  );
}

function LoginFormFallback() {
  return (
    <div className="mt-8 space-y-5">
      <Skeleton className="h-[74px] w-full rounded-lg" />
      <Skeleton className="h-[74px] w-full rounded-lg" />
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
}
