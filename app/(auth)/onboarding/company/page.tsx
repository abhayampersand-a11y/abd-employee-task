import type { Metadata } from "next";
import { Wordmark } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/field";
import { UploadIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Company details — TaskFlow" };

export default function CompanyOnboardingPage() {
  return (
    <>
      <Wordmark className="mb-8" />

      <div className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
        <header className="border-b border-line bg-slate-50/70 px-8 py-6">
          <p className="text-[13px] font-semibold text-brand-600">Step 2 of 2</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">
            Tell us about your company
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            This is the workspace your employees will join.
          </p>
        </header>

        <form className="space-y-5 px-8 py-7">
          <div className="flex items-center gap-4">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-line text-subtle">
              <UploadIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-ink">Company logo</p>
              <p className="mt-1 text-[13px] text-muted">
                PNG or SVG, up to 2 MB.
              </p>
            </div>
          </div>

          <TextField
            label="Company name"
            labelTone="caps"
            name="companyName"
            placeholder="Acme Corp"
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField label="Industry" labelTone="caps" defaultValue="">
              <option value="" disabled>
                Select industry
              </option>
              <option>Technology</option>
              <option>Finance</option>
              <option>Healthcare</option>
              <option>Education</option>
              <option>Retail</option>
              <option>Other</option>
            </SelectField>

            <SelectField label="Company size" labelTone="caps" defaultValue="">
              <option value="" disabled>
                Select size
              </option>
              <option>1–10</option>
              <option>11–50</option>
              <option>51–200</option>
              <option>200+</option>
            </SelectField>
          </div>

          <TextField
            label="Phone"
            labelTone="caps"
            type="tel"
            name="phone"
            placeholder="+91 98765 43210"
          />

          <TextAreaField
            label="Address"
            labelTone="caps"
            name="address"
            rows={3}
            placeholder="Street, city, state, postal code"
          />

          <div className="flex items-center justify-between gap-3 pt-2">
            <ButtonLink href="/signup" variant="ghost" size="lg">
              Back
            </ButtonLink>
            <ButtonLink href="/dashboard" size="lg">
              Continue to dashboard
            </ButtonLink>
          </div>
        </form>
      </div>
    </>
  );
}
