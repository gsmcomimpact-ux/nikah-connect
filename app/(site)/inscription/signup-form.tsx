"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signupAction } from "@/lib/actions/auth";
import { initialFormState } from "@/lib/validation/form";
import { COUNTRIES } from "@/lib/constants/geo";
import { genderOptions } from "@/lib/constants/options";
import { Checkbox, Field, Input, RadioCards, Select } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { Turnstile } from "@/components/forms/turnstile";

export function SignupForm() {
  const [state, action] = useActionState(signupAction, initialFormState);
  const e = state.errors ?? {};
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);
  return (
    <form action={action} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Prénom ou pseudonyme" htmlFor="displayName" error={e.displayName} hint="C'est le nom affiché sur votre profil.">
          <Input id="displayName" name="displayName" autoComplete="nickname" required maxLength={40} />
        </Field>
        <Field label="Date de naissance" htmlFor="dateOfBirth" error={e.dateOfBirth} hint="Seul votre âge sera affiché.">
          <Input id="dateOfBirth" name="dateOfBirth" type="date" required max={maxDate.toISOString().slice(0, 10)} />
        </Field>
      </div>
      <Field label="Je suis" error={e.gender}>
        <RadioCards name="gender" options={genderOptions} required />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Adresse e-mail" htmlFor="email" error={e.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Téléphone" htmlFor="phone" error={e.phone} optional hint="Format international (+227…). Jamais affiché.">
          <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+227 90 00 00 00" />
        </Field>
      </div>
      <Field label="Mot de passe" htmlFor="password" error={e.password} hint="10 caractères minimum, avec des lettres et des chiffres.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Pays de résidence" htmlFor="country" error={e.country}>
          <Select id="country" name="country" required placeholder="Choisir…" options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))} />
        </Field>
        <Field label="Ville" htmlFor="city" error={e.city} hint="Votre adresse exacte n'est jamais demandée.">
          <Input id="city" name="city" required maxLength={80} list="cities" autoComplete="address-level2" />
          <datalist id="cities">
            {COUNTRIES.flatMap((c) => c.cities.map((city) => <option key={`${c.code}-${city.name}`} value={city.name} />))}
          </datalist>
        </Field>
      </div>
      <div className="rounded-xl bg-muted/70 p-4">
        <Checkbox
          name="acceptTerms"
          label={
            <>
              J'accepte les{" "}
              <Link href="/conditions-generales" className="text-primary underline" target="_blank">
                conditions générales d'utilisation
              </Link>
              , la{" "}
              <Link href="/confidentialite" className="text-primary underline" target="_blank">
                politique de confidentialité
              </Link>{" "}
              et les{" "}
              <Link href="/regles-communautaires" className="text-primary underline" target="_blank">
                règles communautaires
              </Link>
              .
            </>
          }
          description="Je certifie avoir 18 ans ou plus et rechercher une relation sérieuse orientée vers le mariage."
        />
        {e.acceptTerms && <p className="mt-2 text-xs font-medium text-red-700">{e.acceptTerms[0]}</p>}
      </div>
      <Turnstile />
      <SubmitButton size="lg" className="w-full" pendingText="Création du compte…">
        Continuer
      </SubmitButton>
    </form>
  );
}
