import { AdminTitle } from "@/components/admin/table";
import { SiteSettingsForm } from "@/components/admin/settings-form";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { hasRole, requireAdmin } from "@/lib/auth/guards";
import { getSiteSettings } from "@/lib/settings";

export const metadata = { title: "Paramètres du site" };

export default async function AdminSettingsPage() {
  const admin = await requireAdmin("ADMIN");
  const settings = await getSiteSettings();
  return (
    <>
      <AdminTitle title="Paramètres du site" description="Le nom, le logo et les couleurs se modifient dans lib/config/site.ts ; les quotas d'offres dans lib/billing/plans.ts." />
      <Card>{hasRole(admin, "SUPER_ADMIN") ? <SiteSettingsForm settings={settings} /> : <Alert tone="info">Réservé aux super-administrateurs.</Alert>}</Card>
    </>
  );
}
