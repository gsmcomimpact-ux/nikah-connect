"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { initialFormState } from "@/lib/validation/form";
import { Field, Input } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(loginAction, initialFormState);
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <input type="hidden" name="next" value={next ?? "/espace"} />
      <Field label="Adresse e-mail" htmlFor="email" error={state.errors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Mot de passe" htmlFor="password" error={state.errors?.password}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <div className="text-right">
        <Link href="/mot-de-passe-oublie" className="text-sm text-primary-light hover:underline">
          Mot de passe oublié ?
        </Link>
      </div>
      <SubmitButton className="w-full" pendingText="Connexion…">
        Se connecter
      </SubmitButton>
    </form>
  );
}
