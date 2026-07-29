import type { Metadata } from "next";
import { Wordmark } from "@/components/brand/logo";
import { CompanyForm } from "./company-form";

export const metadata: Metadata = { title: "Factory details — TaskFlow" };

export default function CompanyOnboardingPage() {
  return (
    <>
      <Wordmark className="mb-8" />

      <div className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
        <header className="border-b border-line bg-slate-50/70 px-8 py-6">
          <p className="text-[13px] font-semibold text-brand-600">Step 2 of 2</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">
            Tell us about your factory
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            This is the workspace your workers will join.
          </p>
        </header>

        <CompanyForm />
      </div>
    </>
  );
}
