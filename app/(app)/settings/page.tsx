"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/field";
import { FormSkeleton } from "@/components/ui/skeleton";
import { ErrorCard } from "@/components/ui/error-card";
import {
  ChangePasswordCard,
  ProfileCard,
} from "@/components/settings/profile-cards";
import {
  useCompanyQuery,
  useUpdateCompanyMutation,
} from "@/store/services/company-api";
import { useMeQuery } from "@/store/services/auth-api";
import { readApiError } from "@/lib/use-api-error";
import type { CompanyDto } from "@/lib/dto";

export default function SettingsPage() {
  const { data: me } = useMeQuery();
  const isAdmin = me?.user.role === "ADMIN";

  const { data: company, isLoading, error, refetch } = useCompanyQuery();

  return (
    <div className="mx-auto max-w-[880px] space-y-5">
      {isLoading ? (
        <FormSkeleton fields={5} />
      ) : error ? (
        <ErrorCard error={error} onRetry={refetch} />
      ) : company ? (
        // Keyed on the id so a refetch re-seeds the uncontrolled inputs
        // without an effect copying server state into React state.
        <CompanyForm key={company.id} company={company} canEdit={!!isAdmin} />
      ) : null}

      <ProfileCard />
      <ChangePasswordCard />
    </div>
  );
}

function CompanyForm({
  company,
  canEdit,
}: {
  company: CompanyDto;
  canEdit: boolean;
}) {
  const [updateCompany, { isLoading, isSuccess, error }] =
    useUpdateCompanyMutation();

  const { message } = readApiError(error);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    updateCompany({
      name: String(data.get("name") ?? ""),
      industry: String(data.get("industry") ?? "") || null,
      size: String(data.get("size") ?? "") || null,
      phone: String(data.get("phone") ?? "") || null,
      address: String(data.get("address") ?? "") || null,
    });
  }

  return (
    <Card>
      <CardHeader
        title="Factory details"
        description={
          canEdit
            ? "Shown to everyone in your workspace."
            : "Only an admin can change these."
        }
      />

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        {message ? (
          <p
            role="alert"
            className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {message}
          </p>
        ) : null}

        {isSuccess ? (
          <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Saved.
          </p>
        ) : null}

        <TextField
          label="Factory name"
          name="name"
          defaultValue={company.name}
          disabled={!canEdit}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Industry"
            name="industry"
            defaultValue={company.industry ?? ""}
            disabled={!canEdit}
          >
            <option value="">Select industry</option>
            <option>Apparel Manufacturing</option>
            <option>Textile</option>
            <option>Retail</option>
            <option>Other</option>
          </SelectField>

          <SelectField
            label="Team size"
            name="size"
            defaultValue={company.size ?? ""}
            disabled={!canEdit}
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
          name="phone"
          type="tel"
          defaultValue={company.phone ?? ""}
          disabled={!canEdit}
        />

        <TextAreaField
          label="Address"
          name="address"
          rows={3}
          defaultValue={company.address ?? ""}
          disabled={!canEdit}
        />

        {canEdit ? (
          <div className="flex justify-end border-t border-line pt-5">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving…" : "Save changes"}
            </Button>
          </div>
        ) : null}
      </form>
    </Card>
  );
}
