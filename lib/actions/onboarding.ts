"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireApiUser } from "@/lib/auth/guards";
import { refreshCompleteness } from "@/lib/profile/queries";
import { formToObject, validationError, type FormState } from "@/lib/validation/form";
import { marriageSchema, personalSchema, preferenceSchema, religiousSchema } from "@/lib/validation/schemas";

async function advance(userId: string, current: number, completedStep: number) {
  const next = Math.max(current, completedStep + 1);
  await db.user.update({ where: { id: userId }, data: { onboardingStep: next } });
  await refreshCompleteness(userId);
  return next;
}

function nextUrl(completedStep: number, alreadyOnboarded: boolean) {
  // Un membre déjà inscrit qui modifie une section revient sur son profil.
  if (alreadyOnboarded) return "/espace/profil?maj=1";
  return completedStep >= 5 ? "/espace?bienvenue=1" : `/inscription/etape/${completedStep + 1}`;
}

export async function savePersonalStep(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireApiUser();
  const parsed = personalSchema.safeParse(formToObject(fd, ["languages"]));
  if (!parsed.success) return validationError(parsed.error);
  await db.profile.update({ where: { userId: user.id }, data: parsed.data });
  await advance(user.id, user.onboardingStep, 2);
  redirect(nextUrl(2, user.onboardingStep >= 6));
}

export async function saveReligiousStep(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireApiUser();
  const parsed = religiousSchema.safeParse(formToObject(fd, ["values"]));
  if (!parsed.success) return validationError(parsed.error);
  const d = parsed.data;
  await db.profile.update({
    where: { userId: user.id },
    data: {
      religionImportance: d.religionImportance ?? null,
      religiousPractice: d.religiousPractice ?? null,
      values: d.values,
      marriageVision: d.marriageVision ?? null,
      religiousCompatibility: d.religiousCompatibility ?? null,
    },
  });
  await advance(user.id, user.onboardingStep, 3);
  redirect(nextUrl(3, user.onboardingStep >= 6));
}

export async function saveMarriageStep(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireApiUser();
  const parsed = marriageSchema.safeParse(formToObject(fd));
  if (!parsed.success) return validationError(parsed.error);
  await db.profile.update({ where: { userId: user.id }, data: parsed.data });
  await advance(user.id, user.onboardingStep, 4);
  redirect(nextUrl(4, user.onboardingStep >= 6));
}

/** Utilisée à l'étape 5 de l'inscription et depuis « Mes préférences ». */
export async function savePreferences(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireApiUser();
  const parsed = preferenceSchema.safeParse(formToObject(fd, ["countries", "cities", "maritalStatuses", "languages", "religionImportances"]));
  if (!parsed.success) return validationError(parsed.error);
  const d = parsed.data;
  const data = {
    ageMin: d.ageMin,
    ageMax: d.ageMax,
    countries: d.countries,
    cities: d.cities.filter(Boolean),
    maxDistanceKm: d.maxDistanceKm ?? null,
    maritalStatuses: d.maritalStatuses,
    acceptsChildren: d.acceptsChildren ?? null,
    minEducation: d.minEducation ?? null,
    languages: d.languages,
    religionImportances: d.religionImportances,
    wantsChildren: d.wantsChildren ?? null,
    relocation: d.relocation ?? null,
    verifiedOnly: d.verifiedOnly,
  };
  await db.preference.upsert({ where: { userId: user.id }, create: { userId: user.id, ...data }, update: data });
  if (fd.get("context") === "settings") {
    await refreshCompleteness(user.id);
    return { ok: true, message: "Vos préférences ont été enregistrées. Vos compatibilités sont mises à jour." };
  }
  await advance(user.id, user.onboardingStep, 5);
  redirect(nextUrl(5, user.onboardingStep >= 6));
}
