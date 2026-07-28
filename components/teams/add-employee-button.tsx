"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { readApiError } from "@/lib/use-api-error";
import { useCreateEmployeeMutation } from "@/store/services/employee-api";
import { CheckCircleIcon, CopyIcon, PlusIcon } from "@/components/icons";

type Result = { employeeId: string; password: string; fullName: string };

export function AddEmployeeButton() {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  const [createEmployee, { isLoading, error, reset }] =
    useCreateEmployeeMutation();

  const { message, fieldErrors } = readApiError(error);

  function close() {
    setOpen(false);
    // Let the dialog finish closing before clearing, so nothing flashes.
    window.setTimeout(() => {
      setFirstName("");
      setLastName("");
      setEmail("");
      setResult(null);
      setCopied(false);
      reset();
    }, 200);
  }

  async function handleCreate() {
    try {
      const created = await createEmployee({
        firstName,
        lastName,
        email: email || undefined,
      }).unwrap();

      setResult({
        employeeId: created.employeeId,
        password: created.password,
        fullName: created.employee.fullName,
      });
    } catch {
      // Message renders from `error` below.
    }
  }

  function copyCredentials() {
    if (!result) return;
    navigator.clipboard.writeText(
      `Login ID: ${result.employeeId}\nPassword: ${result.password}`,
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon className="h-4 w-4" strokeWidth={2} />
        Add Employee
      </Button>

      <Modal
        open={open}
        onClose={close}
        title={result ? "Employee created" : "Add Employee"}
        footer={
          result ? (
            <Button onClick={close}>Done</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={close}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isLoading || !firstName.trim() || !lastName.trim()}
              >
                {isLoading ? "Creating…" : "Create employee"}
              </Button>
            </>
          )
        }
      >
        {result ? (
          <div className="text-center">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-emerald-600" />
            <p className="mt-4 text-lg font-semibold text-ink">
              {result.fullName} can now sign in
            </p>

            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left text-[13px] text-amber-800">
              Save these now — the password is never shown again.
            </div>

            <dl className="mt-4 space-y-3 rounded-lg border border-line bg-slate-50 px-4 py-4 text-left">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[13px] text-muted">Login ID</dt>
                <dd className="font-mono text-sm font-semibold text-ink">
                  {result.employeeId}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-[13px] text-muted">Password</dt>
                <dd className="font-mono text-sm font-semibold text-ink">
                  {result.password}
                </dd>
              </div>
            </dl>

            <Button
              variant="secondary"
              className="mt-4"
              onClick={copyCredentials}
            >
              <CopyIcon className="h-4 w-4" />
              {copied ? "Copied" : "Copy credentials"}
            </Button>

            <p className="mt-4 text-[13px] text-muted">
              They&apos;ll be asked to set their own password on first sign-in.
            </p>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <p className="text-sm text-muted">
              We&apos;ll generate a login ID and password for this worker.
            </p>

            {message ? (
              <p
                role="alert"
                className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {message}
              </p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="First name"
                placeholder="Ramesh"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                hint={fieldErrors.firstName}
              />
              <TextField
                label="Last name"
                placeholder="Solanki"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                hint={fieldErrors.lastName}
              />
            </div>

            <TextField
              label="Email"
              type="email"
              placeholder="ramesh@shreejifashion.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              hint={fieldErrors.email ?? "Optional — used for password resets."}
            />

            {firstName && lastName ? (
              <div
                className={cn(
                  "rounded-lg border border-line bg-slate-50 px-4 py-3",
                )}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Login ID will be
                </p>
                <p className="mt-1 font-mono text-sm text-ink">
                  {`${firstName.toLowerCase().replace(/[^a-z0-9]/g, "")}.${lastName
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, "")}`}
                </p>
              </div>
            ) : null}
          </form>
        )}
      </Modal>
    </>
  );
}
