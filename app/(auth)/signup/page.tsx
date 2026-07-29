import Link from "next/link";
import type { Metadata } from "next";
import { LogoMark } from "@/components/brand/logo";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Create account — TaskFlow" };

export default function SignupPage() {
  return (
    <>
      <div className="w-full max-w-[480px] rounded-2xl border border-line bg-surface px-10 py-11 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <LogoMark variant="tinted" className="h-14 w-14" />
          <h1 className="mt-5 text-[28px] font-bold tracking-tight text-ink">
            Create your account
          </h1>
          <p className="mt-1.5 text-[15px] text-muted">
            Set up TaskFlow for your company
          </p>
        </div>

        <SignupForm />

        <div className="mt-8 border-t border-line pt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-600 hover:text-brand-700"
          >
            Sign in
          </Link>
        </div>
      </div>

      <p className="mt-6 max-w-[420px] text-center text-[13px] text-subtle">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="text-brand-600 hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-brand-600 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </>
  );
}
