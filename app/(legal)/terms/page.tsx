import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service — TaskFlow" };

export default function TermsPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-ink">
        Terms of Service
      </h1>
      <p className="mt-2 text-[13px] text-subtle">Last updated: placeholder</p>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-muted">
        <p>
          Placeholder copy. Replace this page with the terms your legal team
          approves before launch.
        </p>
        <section>
          <h2 className="text-lg font-semibold text-ink">Using TaskFlow</h2>
          <p className="mt-2">
            Each workspace belongs to one company. Admins are responsible for who
            they invite and what access those people receive.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-ink">Your content</h2>
          <p className="mt-2">
            Tasks, comments, and company details you add remain yours.
          </p>
        </section>
      </div>
    </>
  );
}
