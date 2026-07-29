"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/field";
import { UploadIcon } from "@/components/icons";
import { useCreateCompanyMutation } from "@/store/services/auth-api";
import { readApiError } from "@/lib/use-api-error";

export function CompanyForm() {
  const router = useRouter();
  const [createCompany, { isLoading, error }] = useCreateCompanyMutation();

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("Apparel Manufacturing");
  const [size, setSize] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const { message, fieldErrors } = readApiError(error);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      await createCompany({
        name,
        industry: industry || null,
        size: size || null,
        phone: phone || null,
        address: address || null,
      }).unwrap();

      router.push("/dashboard");
      router.refresh();
    } catch {
      // Message renders from `error` below.
    }
  }

  return (
    <form className="space-y-5 px-8 py-7" onSubmit={handleSubmit}>
      {message ? (
        <p
          role="alert"
          className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {message}
        </p>
      ) : null}

      <div className="flex items-center gap-4">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-line text-subtle">
          <UploadIcon className="h-6 w-6" />
        </span>
        <div>
          <p className="text-[13px] font-semibold text-ink">Factory logo</p>
          <p className="mt-1 text-[13px] text-muted">
            You can add this later from Settings.
          </p>
        </div>
      </div>

      <TextField
        label="Factory name"
        labelTone="caps"
        name="name"
        placeholder="Shreeji Fashion"
        value={name}
        onChange={(event) => setName(event.target.value)}
        hint={fieldErrors.name}
        required
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Industry"
          labelTone="caps"
          value={industry}
          onChange={(event) => setIndustry(event.target.value)}
        >
          <option>Apparel Manufacturing</option>
          <option>Textile</option>
          <option>Retail</option>
          <option>Other</option>
        </SelectField>

        <SelectField
          label="Team size"
          labelTone="caps"
          value={size}
          onChange={(event) => setSize(event.target.value)}
        >
          <option value="">Select size</option>
          <option>1-10</option>
          <option>11-50</option>
          <option>51-200</option>
          <option>200+</option>
        </SelectField>
      </div>

      <TextField
        label="Phone"
        labelTone="caps"
        type="tel"
        name="phone"
        placeholder="+91 98765 43210"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
      />

      <TextAreaField
        label="Address"
        labelTone="caps"
        name="address"
        rows={3}
        placeholder="Plot, estate, city, state, postal code"
        value={address}
        onChange={(event) => setAddress(event.target.value)}
      />

      <div className="flex items-center justify-between gap-3 pt-2">
        <ButtonLink href="/login" variant="ghost" size="lg">
          Back
        </ButtonLink>
        <Button type="submit" size="lg" disabled={isLoading || !name.trim()}>
          {isLoading ? "Setting up…" : "Continue to dashboard"}
        </Button>
      </div>
    </form>
  );
}
