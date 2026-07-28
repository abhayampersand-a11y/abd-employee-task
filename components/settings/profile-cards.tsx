"use client";

import { useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordField, TextField } from "@/components/ui/field";
import { Avatar } from "@/components/ui/avatar";
import { FormSkeleton } from "@/components/ui/skeleton";
import { readApiError } from "@/lib/use-api-error";
import {
  useChangePasswordMutation,
  useMeQuery,
} from "@/store/services/auth-api";
import { LockIcon } from "@/components/icons";

/** Shared by /settings (admin) and /employee/profile (worker). */
export function ProfileCard() {
  const { data: me, isLoading } = useMeQuery();

  if (isLoading) return <FormSkeleton fields={3} />;
  if (!me) return null;

  return (
    <Card>
      <CardHeader title="Your profile" />

      <div className="mt-6 flex items-center gap-4">
        <Avatar name={me.user.fullName} tone={me.user.avatarTone} size="lg" />
        <div>
          <p className="font-semibold text-ink">{me.user.fullName}</p>
          <p className="mt-0.5 text-sm text-muted">
            {me.user.role === "ADMIN" ? "Owner / Admin" : "Employee"}
            {me.user.employeeId ? ` · ${me.user.employeeId}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <TextField label="First name" defaultValue={me.user.firstName} disabled />
        <TextField label="Last name" defaultValue={me.user.lastName} disabled />
      </div>

      <TextField
        className="mt-5"
        label="Email"
        type="email"
        defaultValue={me.user.email}
        disabled
        hint="Managed by your workspace."
        action={<LockIcon className="h-4 w-4 text-subtle" />}
      />
    </Card>
  );
}

export function ChangePasswordCard() {
  const [changePassword, { isLoading, error, isSuccess }] =
    useChangePasswordMutation();

  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mismatch, setMismatch] = useState(false);

  const { message, fieldErrors } = readApiError(error);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (newPassword !== confirm) {
      setMismatch(true);
      return;
    }

    setMismatch(false);

    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      setCurrent("");
      setNew("");
      setConfirm("");
    } catch {
      // Message renders below.
    }
  }

  return (
    <Card>
      <CardHeader title="Change password" />

      <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
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
            Password updated. Other devices have been signed out.
          </p>
        ) : null}

        <PasswordField
          label="Current password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={currentPassword}
          onChange={(event) => setCurrent(event.target.value)}
          hint={fieldErrors.currentPassword}
          required
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <PasswordField
            label="New password"
            autoComplete="new-password"
            placeholder="Enter a secure password"
            value={newPassword}
            onChange={(event) => setNew(event.target.value)}
            hint={fieldErrors.newPassword}
            required
          />
          <PasswordField
            label="Confirm new password"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            hint={mismatch ? "Passwords don't match" : undefined}
            required
          />
        </div>

        <div className="flex justify-end border-t border-line pt-5">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating…" : "Update password"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
