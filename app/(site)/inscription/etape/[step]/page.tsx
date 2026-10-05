import { notFound, redirect } from "next/navigation";
import { AuthCard } from "@/components/forms/auth-card";
import { Stepper } from "@/components/forms/stepper";
import { MarriageStepForm, PersonalStepForm, PreferenceForm, ReligiousStepForm } from "@/components/forms/onboarding-forms";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { PRIVATE_METADATA } from "@/lib/seo/metadata";
import { ageFromDate } from "@/lib/utils";

export const metadata = { ...PRIVATE_METADATA, title: "Inscription" };

const TITLES: Record<number, { title: string; subtitle: string }> = {
  2: { title: "Informations personnelles", subtitle: "Quelques repères pour mieux vous présenter." },
  3: { title: "Profil religieux", subtitle: "Des informations facultatives, partagées avec respect." },
  4: { title: "Projet matrimonial", subtitle: "Ce que vous souhaitez construire." },
  5: { title: "Vos préférences", subtitle: "Ce que vous recherchez chez un(e) partenaire." },
};

export default async function OnboardingStepPage({ params }: { params: Promise<{ step: string }> }) {
  const step = Number((await params).step);
  if (!TITLES[step]) notFound();
  const user = await requireUser({ allowIncompleteOnboarding: true });
  if (step > user.onboardingStep) redirect(`/inscription/etape/${user.onboardingStep}`);

  const [profile, preference] = await Promise.all([
    db.profile.findUniqueOrThrow({ where: { userId: user.id } }),
    db.preference.findUnique({ where: { userId: user.id } }),
  ]);
  const meta = TITLES[step]!;

  return (
    <AuthCard wide title={meta.title} subtitle={`Étape ${step} sur 5 — ${meta.subtitle}`}>
      <div className="mb-8">
        <Stepper current={step} />
      </div>
      {step === 2 && <PersonalStepForm profile={profile} />}
      {step === 3 && <ReligiousStepForm profile={profile} />}
      {step === 4 && <MarriageStepForm profile={profile} />}
      {step === 5 && <PreferenceForm preference={preference} onboarding defaultAge={ageFromDate(profile.dateOfBirth)} />}
    </AuthCard>
  );
}
