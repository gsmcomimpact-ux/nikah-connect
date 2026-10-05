"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import type { Preference, Profile } from "@prisma/client";
import { saveMarriageStep, savePersonalStep, savePreferences, saveReligiousStep } from "@/lib/actions/onboarding";
import { initialFormState, type FormState } from "@/lib/validation/form";
import { COUNTRIES } from "@/lib/constants/geo";
import {
  childrenWishOptions,
  compatibilityImportanceOptions,
  educationOptions,
  languageOptions,
  maritalStatusOptions,
  marriageTimelineOptions,
  partnerChildrenOptions,
  relocationOptions,
  religionImportanceOptions,
  religiousPracticeOptions,
  valueOptions,
} from "@/lib/constants/options";
import { Checkbox, ChipGroup, Field, Input, RadioCards, Select, Textarea } from "@/components/ui/field";
import { FormMessage, Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { buttonClass } from "@/components/ui/button";

type Action = (prev: FormState, fd: FormData) => Promise<FormState>;

function StepForm({ action, children, backHref, submitLabel = "Continuer", context }: { action: Action; children: (state: FormState) => ReactNode; backHref?: string; submitLabel?: string; context?: string }) {
  const [state, formAction] = useActionState(action, initialFormState);
  return (
    <form action={formAction} className="space-y-6" noValidate>
      <FormMessage state={state} />
      {context && <input type="hidden" name="context" value={context} />}
      {children(state)}
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
        {backHref ? (
          <Link href={backHref} className={buttonClass("ghost", "lg")}>
            ← Retour
          </Link>
        ) : (
          <span />
        )}
        <SubmitButton size="lg" pendingText="Enregistrement…">
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}

export function PersonalStepForm({ profile }: { profile: Profile }) {
  return (
    <StepForm action={savePersonalStep} backHref={undefined}>
      {(s) => (
        <>
          <Field label="Situation matrimoniale" error={s.errors?.maritalStatus}>
            <RadioCards name="maritalStatus" options={maritalStatusOptions} defaultValue={profile.maritalStatus} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nombre d'enfants" htmlFor="childrenCount" error={s.errors?.childrenCount}>
              <Input id="childrenCount" name="childrenCount" type="number" min={0} max={15} defaultValue={profile.childrenCount} />
            </Field>
            <Field label="Niveau d'études" htmlFor="educationLevel" error={s.errors?.educationLevel}>
              <Select id="educationLevel" name="educationLevel" placeholder="Choisir…" options={educationOptions} defaultValue={profile.educationLevel ?? ""} />
            </Field>
          </div>
          <Field label="Profession" htmlFor="profession" error={s.errors?.profession}>
            <Input id="profession" name="profession" maxLength={80} defaultValue={profile.profession ?? ""} placeholder="ex. Enseignante, Comptable, Étudiant…" />
          </Field>
          <Field label="Langues parlées" error={s.errors?.languages}>
            <ChipGroup name="languages" options={languageOptions} defaultValues={profile.languages} />
          </Field>
        </>
      )}
    </StepForm>
  );
}

export function ReligiousStepForm({ profile }: { profile: Profile }) {
  return (
    <StepForm action={saveReligiousStep} backHref="/inscription/etape/2">
      {(s) => (
        <>
          <Alert tone="info">
            Tous les champs de cette étape sont facultatifs. Ils servent uniquement à rapprocher des personnes aux attentes proches — jamais à juger la foi de quiconque.
          </Alert>
          <Field label="Place de la religion dans votre vie" optional error={s.errors?.religionImportance}>
            <RadioCards name="religionImportance" options={religionImportanceOptions} defaultValue={profile.religionImportance} />
          </Field>
          <Field label="Votre pratique religieuse" optional error={s.errors?.religiousPractice}>
            <RadioCards name="religiousPractice" options={religiousPracticeOptions} defaultValue={profile.religiousPractice} />
          </Field>
          <Field label="Les valeurs qui comptent le plus pour vous" optional error={s.errors?.values} hint="Jusqu'à 6 valeurs.">
            <ChipGroup name="values" options={valueOptions} defaultValues={profile.values} />
          </Field>
          <Field label="Votre vision du mariage" htmlFor="marriageVision" optional error={s.errors?.marriageVision}>
            <Textarea id="marriageVision" name="marriageVision" maxLength={600} defaultValue={profile.marriageVision ?? ""} placeholder="Ce que représente le mariage pour vous, ce que vous souhaitez construire…" />
          </Field>
          <Field label="Importance de la compatibilité religieuse avec votre futur(e) conjoint(e)" optional error={s.errors?.religiousCompatibility}>
            <RadioCards name="religiousCompatibility" options={compatibilityImportanceOptions} defaultValue={profile.religiousCompatibility} />
          </Field>
        </>
      )}
    </StepForm>
  );
}

export function MarriageStepForm({ profile }: { profile: Profile }) {
  return (
    <StepForm action={saveMarriageStep} backHref="/inscription/etape/3">
      {(s) => (
        <>
          <Field label="Recherchez-vous une relation orientée vers le mariage ?" error={s.errors?.seeksMarriage}>
            <RadioCards
              name="seeksMarriage"
              options={[
                { value: "yes", label: "Oui, c'est mon objectif" },
                { value: "no", label: "Pas pour le moment" },
              ]}
              defaultValue={profile.seeksMarriage ? "yes" : "no"}
            />
          </Field>
          <Field label="Souhaitez-vous avoir des enfants ?" error={s.errors?.wantsChildren}>
            <RadioCards name="wantsChildren" options={childrenWishOptions} defaultValue={profile.wantsChildren} />
          </Field>
          <Field label="Acceptez-vous une personne ayant déjà des enfants ?" error={s.errors?.acceptsPartnerChildren}>
            <RadioCards name="acceptsPartnerChildren" options={partnerChildrenOptions} defaultValue={profile.acceptsPartnerChildren} />
          </Field>
          <Field label="Préférez-vous vivre dans votre pays ou à l'étranger ?" error={s.errors?.relocation}>
            <RadioCards name="relocation" options={relocationOptions} defaultValue={profile.relocation} />
          </Field>
          <Field label="Quel est votre horizon souhaité pour le mariage ?" error={s.errors?.marriageTimeline}>
            <RadioCards name="marriageTimeline" options={marriageTimelineOptions} defaultValue={profile.marriageTimeline} />
          </Field>
        </>
      )}
    </StepForm>
  );
}

export function PreferenceForm({ preference, onboarding, defaultAge }: { preference: Preference | null; onboarding: boolean; defaultAge: number }) {
  const p = preference;
  return (
    <StepForm action={savePreferences} backHref={onboarding ? "/inscription/etape/4" : undefined} submitLabel={onboarding ? "Terminer mon inscription" : "Enregistrer mes préférences"} context={onboarding ? undefined : "settings"}>
      {(s) => (
        <>
          <p className="text-sm text-gray-600">Décrivez ce que vous recherchez chez un(e) partenaire. Ces critères orientent les suggestions sans jamais exclure définitivement un profil.</p>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Âge minimum" htmlFor="ageMin" error={s.errors?.ageMin}>
              <Input id="ageMin" name="ageMin" type="number" min={18} max={99} defaultValue={p?.ageMin ?? Math.max(18, defaultAge - 8)} />
            </Field>
            <Field label="Âge maximum" htmlFor="ageMax" error={s.errors?.ageMax}>
              <Input id="ageMax" name="ageMax" type="number" min={18} max={99} defaultValue={p?.ageMax ?? defaultAge + 10} />
            </Field>
          </div>
          <Field label="Pays souhaités" optional hint="Laissez vide pour tous les pays.">
            <ChipGroup name="countries" options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))} defaultValues={p?.countries ?? []} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Ville souhaitée" htmlFor="cities" optional>
              <Input id="cities" name="cities" maxLength={80} defaultValue={p?.cities[0] ?? ""} />
            </Field>
            <Field label="Distance maximale (km)" htmlFor="maxDistanceKm" optional error={s.errors?.maxDistanceKm}>
              <Input id="maxDistanceKm" name="maxDistanceKm" type="number" min={5} max={20000} defaultValue={p?.maxDistanceKm ?? ""} />
            </Field>
          </div>
          <Field label="Situation matrimoniale acceptée" optional>
            <ChipGroup name="maritalStatuses" options={maritalStatusOptions} defaultValues={p?.maritalStatuses ?? []} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Personne ayant déjà des enfants" htmlFor="acceptsChildren" optional>
              <Select id="acceptsChildren" name="acceptsChildren" placeholder="Indifférent" options={partnerChildrenOptions} defaultValue={p?.acceptsChildren ?? ""} />
            </Field>
            <Field label="Niveau d'études minimum" htmlFor="minEducation" optional>
              <Select id="minEducation" name="minEducation" placeholder="Indifférent" options={educationOptions} defaultValue={p?.minEducation ?? ""} />
            </Field>
            <Field label="Souhait d'enfants" htmlFor="wantsChildren" optional>
              <Select id="wantsChildren" name="wantsChildren" placeholder="Indifférent" options={childrenWishOptions} defaultValue={p?.wantsChildren ?? ""} />
            </Field>
            <Field label="Lieu de vie" htmlFor="relocation" optional>
              <Select id="relocation" name="relocation" placeholder="Indifférent" options={relocationOptions} defaultValue={p?.relocation ?? ""} />
            </Field>
          </div>
          <Field label="Langues souhaitées" optional>
            <ChipGroup name="languages" options={languageOptions} defaultValues={p?.languages ?? []} />
          </Field>
          <Field label="Place de la religion chez votre partenaire" optional>
            <ChipGroup name="religionImportances" options={religionImportanceOptions.filter((o) => o.value !== "PREFER_NOT_SAY")} defaultValues={p?.religionImportances ?? []} />
          </Field>
          <Checkbox name="verifiedOnly" label="Privilégier les profils à l'identité vérifiée" defaultChecked={p?.verifiedOnly ?? false} />
        </>
      )}
    </StepForm>
  );
}
