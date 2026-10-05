import { PageTitle } from "@/components/layout/page-title";
import { Card } from "@/components/ui/card";
import { PreferenceForm } from "@/components/forms/onboarding-forms";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { ageFromDate } from "@/lib/utils";

export const metadata = { title: "Mes préférences" };

export default async function PreferencesPage() {
  const user = await requireUser();
  const [profile, preference] = await Promise.all([db.profile.findUniqueOrThrow({ where: { userId: user.id } }), db.preference.findUnique({ where: { userId: user.id } })]);
  return (
    <>
      <PageTitle title="Mes préférences" description="Vos critères orientent les suggestions de compatibilité." />
      <Card>
        <PreferenceForm preference={preference} onboarding={false} defaultAge={ageFromDate(profile.dateOfBirth)} />
      </Card>
    </>
  );
}
