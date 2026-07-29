"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PasswordField, PasswordStrength, TextField } from "@/components/ui/field";
import { ArrowRightIcon } from "@/components/icons";
import { useSignupMutation } from "@/store/services/auth-api";
import { readApiError } from "@/lib/use-api-error";

/** Rough meter: length, letters+digits, mixed case, symbol. */
function scorePassword(value: string): 0 | 1 | 2 | 3 | 4 {
  let score = 0;
  if (value.length >= 8) score++;
  if (/[a-z]/.test(value) && /\d/.test(value)) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  return score as 0 | 1 | 2 | 3 | 4;
}

export function SignupForm() {
  const router = useRouter();
  const [signup, { isLoading, error }] = useSignupMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { message, fieldErrors } = readApiError(error);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      await signup({ firstName, lastName, email, password }).unwrap();
      // The account exists but has no company yet — that's step 2.
      router.push("/onboarding/company");
    } catch {
      // Message renders from `error` below.
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
          name="firstName"
          autoComplete="given-name"
          placeholder="Nilesh"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          hint={fieldErrors.firstName}
          required
        />
        <TextField
          label="Last name"
          name="lastName"
          autoComplete="family-name"
          placeholder="Patel"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          hint={fieldErrors.lastName}
          required
        />
      </div>

      <TextField
        label="Work email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@yourfactory.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        hint={fieldErrors.email}
        required
      />

      <div>
        <PasswordField
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="Create a secure password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          hint={fieldErrors.password}
          required
        />
        <PasswordStrength score={scorePassword(password)} />
        <p className="mt-2 text-[13px] text-muted">
          Use 8 or more characters with letters and numbers.
        </p>
      </div>

      <Button type="submit" size="lg" fullWidth disabled={isLoading}>
        {isLoading ? "Creating account…" : "Create account"}
        {isLoading ? null : <ArrowRightIcon className="h-[18px] w-[18px]" />}
      </Button>
    </form>
  );
}
