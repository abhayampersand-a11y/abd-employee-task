import Link from "next/link";
import type { Metadata } from "next";
import { LogoMark, Wordmark } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { PasswordField, PasswordStrength, TextField } from "@/components/ui/field";
import { HelpIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Accept invite — TaskFlow" };

/**
 * The token is what will later be looked up to resolve the invited person
 * and their company. For now the screen renders with placeholder values.
 */
export default async function InvitePage(props: PageProps<"/invite/[token]">) {
  await props.params;

  const company = "Acme Corp";
  const invitee = { firstName: "Rahul", lastName: "Patel", email: "rahul@acme.com" };

  return (
    <>
      <Wordmark className="mb-7" />

      <div className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
        <header className="border-b border-line bg-slate-50/70 px-8 py-7">
          <div className="flex items-center gap-3">
            <LogoMark variant="tinted" className="h-10 w-10" />
            <span className="text-lg font-semibold text-ink">{company}</span>
          </div>
          <h1 className="mt-5 text-2xl font-bold leading-snug tracking-tight text-ink">
            You&apos;ve been invited to join {company}
          </h1>
        </header>

        <form className="space-y-5 px-8 py-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="First name"
              labelTone="caps"
              defaultValue={invitee.firstName}
              disabled
            />
            <TextField
              label="Last name"
              labelTone="caps"
              defaultValue={invitee.lastName}
              disabled
            />
          </div>

          <TextField
            label="Email address"
            labelTone="caps"
            type="email"
            defaultValue={invitee.email}
            disabled
          />

          <hr className="border-line" />

          <div>
            <PasswordField
              label="Create password"
              name="password"
              autoComplete="new-password"
              placeholder="Enter a secure password"
            />
            <PasswordStrength score={0} />
            <p className="mt-2 text-[13px] text-muted">
              Use 8 or more characters with letters and numbers.
            </p>
          </div>

          <PasswordField
            label="Confirm password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Repeat password"
          />

          <ButtonLink href="/dashboard" size="lg" fullWidth className="mt-1">
            Accept &amp; continue
          </ButtonLink>

          <p className="text-center text-[13px] text-muted">
            By accepting, you agree to our{" "}
            <Link href="/terms" className="text-brand-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-brand-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      </div>

      <Link
        href="/support"
        className="mt-6 inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
      >
        <HelpIcon className="h-4 w-4" />
        Need help setting up your account?
      </Link>
    </>
  );
}
