"use client";

import { ActionForm } from "@/components/forms/action-form";
import { Turnstile } from "@/components/forms/turnstile";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { contactAction } from "@/lib/actions/contact";

export function ContactForm() {
  return (
    <ActionForm action={contactAction}>
      {(s) =>
        s.ok ? null : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom" htmlFor="name" error={s.errors?.name}>
                <Input id="name" name="name" required autoComplete="name" />
              </Field>
              <Field label="E-mail" htmlFor="email" error={s.errors?.email}>
                <Input id="email" name="email" type="email" required autoComplete="email" />
              </Field>
            </div>
            <Field label="Objet" htmlFor="subject" error={s.errors?.subject}>
              <Select
                id="subject"
                name="subject"
                options={[
                  { value: "Question générale", label: "Question générale" },
                  { value: "Sécurité / signalement urgent", label: "Sécurité / signalement urgent" },
                  { value: "Données personnelles (RGPD)", label: "Données personnelles (RGPD)" },
                  { value: "Contestation d'une décision de modération", label: "Contestation d'une décision de modération" },
                  { value: "Témoignage", label: "Partager un témoignage" },
                  { value: "Partenariat / presse", label: "Partenariat / presse" },
                ]}
              />
            </Field>
            <Field label="Message" htmlFor="body" error={s.errors?.body}>
              <Textarea id="body" name="body" required maxLength={3000} className="min-h-40" />
            </Field>
            <div className="hidden" aria-hidden>
              <label htmlFor="website">Ne pas remplir</label>
              <input id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <Turnstile />
            <SubmitButton>Envoyer</SubmitButton>
          </>
        )
      }
    </ActionForm>
  );
}
