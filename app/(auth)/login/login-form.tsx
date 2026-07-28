"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox, PasswordField, TextField } from "@/components/ui/field";
import { ArrowRightIcon } from "@/components/icons";
import { useLoginMutation } from "@/store/services/auth-api";
import { readApiError } from "@/lib/use-api-error";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [login, { isLoading, error }] = useLoginMutation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const { message, fieldErrors } = readApiError(error);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      const me = await login({ identifier, password }).unwrap();

      if (!me.company) {
        router.push("/onboarding/company");
        return;
      }

      const next = searchParams.get("next");
      if (next?.startsWith("/")) {
        router.push(next);
        return;
      }

      router.push(me.user.role === "ADMIN" ? "/dashboard" : "/employee");
    } catch {
      // Message is rendered from `error` below.
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

      <TextField
        label="Email Address"
        name="identifier"
        autoComplete="username"
        placeholder="name@company.com"
        value={identifier}
        onChange={(event) => setIdentifier(event.target.value)}
        hint={fieldErrors.identifier}
        required
      />

      <PasswordField
        label="Password"
        name="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        hint={fieldErrors.password}
        required
        action={
          <Link
            href="/forgot-password"
            className="text-[13px] font-semibold text-brand-600 hover:text-brand-700"
          >
            Forgot password?
          </Link>
        }
      />

      <Checkbox name="remember" label="Keep me signed in" defaultChecked />

      <Button type="submit" size="lg" fullWidth disabled={isLoading}>
        {isLoading ? "Signing in…" : "Sign In"}
        {isLoading ? null : <ArrowRightIcon className="h-[18px] w-[18px]" />}
      </Button>
    </form>
  );
}
