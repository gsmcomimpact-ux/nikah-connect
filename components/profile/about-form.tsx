"use client";

import { useActionState } from "react";
import { updateAboutAction } from "@/lib/actions/profile";
import { initialFormState } from "@/lib/validation/form";
import { COUNTRIES } from "@/lib/constants/geo";
import { familyValueOptions, type Option } from "@/lib/constants/options";
import { ChipGroup, Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";

export function AboutForm({
  defaults,
  interestOptions,
}: {
  defaults: { displayName: string; country: string; city: string; bio: string; familyVision: string; familyValues: string[]; interests: string[] };
  interestOptions: Option[];
}) {
  const [state, action] = useActionState(updateAboutAction, initialFormState);
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-5">
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Prénom ou pseudonyme" htmlFor="displayName" error={e.displayName}>
          <Input id="displayName" name="displayName" defaultValue={defaults.displayName} maxLength={40} />
        </Field>
        <Field label="Pays" htmlFor="country" error={e.country}>
          <Select id="country" name="country" options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))} defaultValue={defaults.country} />
        </Field>
        <Field label="Ville" htmlFor="city" error={e.city}>
          <Input id="city" name="city" defaultValue={defaults.city} maxLength={80} />
        </Field>
      </div>
      <Field label="Présentation" htmlFor="bio" error={e.bio} hint="Parlez de vous, de votre personnalité, de ce qui compte pour vous. Pas de coordonnées (téléphone, e-mail, réseaux).">
        <Textarea id="bio" name="bio" defaultValue={defaults.bio} maxLength={1500} className="min-h-36" />
      </Field>
      <Field label="Votre vision de la famille" htmlFor="familyVision" optional error={e.familyVision}>
        <Textarea id="familyVision" name="familyVision" defaultValue={defaults.familyVision} maxLength={800} />
      </Field>
      <Field label="Valeurs familiales" optional error={e.familyValues} hint="Jusqu'à 5.">
        <ChipGroup name="familyValues" options={familyValueOptions} defaultValues={defaults.familyValues} />
      </Field>
      <Field label="Centres d'intérêt" optional error={e.interests}>
        <ChipGroup name="interests" options={interestOptions} defaultValues={defaults.interests} />
      </Field>
      <Field label="Autres centres d'intérêt" htmlFor="customInterests" optional hint="Séparés par des virgules.">
        <Input id="customInterests" name="customInterests" maxLength={200} />
      </Field>
      <SubmitButton>Enregistrer</SubmitButton>
    </form>
  );
}
