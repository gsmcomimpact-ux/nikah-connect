"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPasswordAction } from "@/lib/actions/auth";
import { initialFormState } from "@/lib/validation/form";
import { Field, Input } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPasswordAction, initialFormState);
  if (state.ok)
    return (
      <div className="space-y-4">
        <FormMessage state={state} />
        <Link href="/connexion" className="block text-center font-medium text-primary hover:underline">
          Se connecter
        </Link>
      </div>
    );
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <input type="hidden" name="token" value={token} />
      <Field label="Nouveau mot de passe" htmlFor="password" error={state.errors?.password}>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} />
      </Field>
      <Field label="Confirmez le mot de passe" htmlFor="confirm" error={state.errors?.confirm}>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
      </Field>
      <SubmitButton className="w-full">Mettre à jour</SubmitButton>
    </form>
  );
}
