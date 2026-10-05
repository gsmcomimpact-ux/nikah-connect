"use client";

import { ActionForm } from "@/components/forms/action-form";
import { Checkbox, Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveSiteSettingsAction } from "@/lib/actions/admin";
import type { SiteSettings } from "@/lib/settings";

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  return (
    <ActionForm action={saveSiteSettingsAction}>
      {() => (
        <>
          <Checkbox name="registrationOpen" defaultChecked={settings.registrationOpen} label="Inscriptions ouvertes" />
          <Field label="Bandeau d'annonce (pages publiques)" htmlFor="announcement" optional>
            <Input id="announcement" name="announcement" defaultValue={settings.announcement} maxLength={240} />
          </Field>
          <Field label="E-mail du support" htmlFor="supportEmail" optional>
            <Input id="supportEmail" name="supportEmail" type="email" defaultValue={settings.supportEmail} />
          </Field>
          <SubmitButton>Enregistrer</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
