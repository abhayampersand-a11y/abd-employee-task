import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy — TaskFlow" };

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-ink">
        Privacy Policy
      </h1>
      <p className="mt-2 text-[13px] text-subtle">Last updated: placeholder</p>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-muted">
        <p>
          Placeholder copy. Replace this page with the privacy policy your legal
          team approves before launch.
        </p>
        <section>
          <h2 className="text-lg font-semibold text-ink">Data we collect</h2>
          <p className="mt-2">
            Account details, company information, and the tasks created inside
            your workspace.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-ink">How we use it</h2>
          <p className="mt-2">
            To operate the product, keep your workspace secure, and support you
            when you ask for help.
          </p>
        </section>
      </div>
    </>
  );
}
