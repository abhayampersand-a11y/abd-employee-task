import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/logo";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas px-4 py-12">
      <div className="mx-auto max-w-[720px]">
        <Link href="/login">
          <Wordmark />
        </Link>

        <article className="mt-8 rounded-2xl border border-line bg-surface px-8 py-10 sm:px-10">
          {children}
        </article>

        <p className="mt-6 text-center text-[13px] text-subtle">
          TaskFlow Enterprise Plan
        </p>
      </div>
    </div>
  );
}
