import Link from "next/link";
import type { Metadata } from "next";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";

export const metadata: Metadata = { title: "Reset password — TaskFlow" };

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-[480px] rounded-2xl border border-line bg-surface px-10 py-11 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <LogoMark variant="tinted" className="h-14 w-14" />
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink">
          Reset your password
        </h1>
        <p className="mt-2 text-[15px] text-muted">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form className="mt-8 space-y-5">
        <TextField
          label="Email Address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="name@company.com"
        />
        <Button size="lg" fullWidth>
          Send reset link
        </Button>
      </form>

      <div className="mt-8 border-t border-line pt-6 text-center text-sm text-muted">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
