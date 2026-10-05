"use client";

import type { PhotoVisibility, TrustedContactRelation } from "@prisma/client";
import { ActionForm } from "@/components/forms/action-form";
import { Checkbox, Field, Input, RadioCards, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { changePasswordAction, deleteAccountAction, sendPhoneCodeAction, submitIdentityAction, verifyPhoneCodeAction } from "@/lib/actions/account";
import { saveTrustedContactAction, updatePrivacyAction } from "@/lib/actions/profile";
import { compressInputFile } from "@/lib/client/compress-image";
import { photoVisibilityOptions, trustedContactRelationOptions } from "@/lib/constants/options";

export function PrivacyForm({ defaults }: { defaults: { photoVisibility: PhotoVisibility; isVisible: boolean; emailNotifications: boolean } }) {
  return (
    <ActionForm action={updatePrivacyAction} className="space-y-5">
      {(s) => (
        <>
          <Field label="Qui peut voir mes photos ?" error={s.errors?.photoVisibility}>
            <RadioCards name="photoVisibility" options={photoVisibilityOptions} defaultValue={defaults.photoVisibility} />
          </Field>
          <Checkbox name="isVisible" defaultChecked={defaults.isVisible} label="Mon profil est visible dans les recherches et suggestions" description="Décochez pour mettre votre profil en pause : vos conversations en cours restent accessibles." />
          <Checkbox name="emailNotifications" defaultChecked={defaults.emailNotifications} label="Recevoir les notifications importantes par e-mail" description="Demandes reçues, compatibilités mutuelles, vérification. Les alertes de sécurité sont toujours envoyées." />
          <SubmitButton>Enregistrer</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}

export function ChangePasswordForm() {
  return (
    <ActionForm action={changePasswordAction}>
      {(s) => (
        <>
          <Field label="Mot de passe actuel" htmlFor="current" error={s.errors?.current}>
            <Input id="current" name="current" type="password" autoComplete="current-password" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nouveau mot de passe" htmlFor="password" error={s.errors?.password}>
              <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} />
            </Field>
            <Field label="Confirmation" htmlFor="confirm" error={s.errors?.confirm}>
              <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
            </Field>
          </div>
          <SubmitButton>Modifier le mot de passe</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}

export function PhoneVerificationForms({ phone }: { phone: string | null }) {
  return (
    <div className="space-y-4">
      <ActionForm action={sendPhoneCodeAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {(s) => (
          <>
            <Field label="Numéro de téléphone" htmlFor="phone" error={s.errors?.phone} className="flex-1">
              <Input id="phone" name="phone" type="tel" defaultValue={phone ?? ""} placeholder="+227 90 00 00 00" required />
            </Field>
            <SubmitButton variant="outline">Recevoir un code</SubmitButton>
          </>
        )}
      </ActionForm>
      <ActionForm action={verifyPhoneCodeAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {(s) => (
          <>
            <Field label="Code reçu par SMS" htmlFor="code" error={s.errors?.code} className="flex-1">
              <Input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required />
            </Field>
            <SubmitButton>Vérifier</SubmitButton>
          </>
        )}
      </ActionForm>
    </div>
  );
}

export function IdentityForm() {
  return (
    <ActionForm action={submitIdentityAction}>
      {(s) => (
        <>
          <Field label="Type de document" htmlFor="documentType" error={s.errors?.documentType}>
            <Select
              id="documentType"
              name="documentType"
              placeholder="Choisir…"
              options={[
                { value: "CNI", label: "Carte nationale d'identité" },
                { value: "PASSEPORT", label: "Passeport" },
                { value: "PERMIS", label: "Permis de conduire" },
                { value: "TITRE_SEJOUR", label: "Titre de séjour" },
              ]}
            />
          </Field>
          <Field label="Photo du document" htmlFor="document" error={s.errors?.document} hint="Photo (compressée automatiquement) ou PDF de 2 Mo maximum.">
            <Input id="document" name="document" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required onChange={(e) => void compressInputFile(e.currentTarget)} />
          </Field>
          <Field label="Selfie tenant le document" htmlFor="selfie" error={s.errors?.selfie} hint="Permet de vérifier que le document vous appartient.">
            <Input id="selfie" name="selfie" type="file" accept="image/jpeg,image/png,image/webp" required onChange={(e) => void compressInputFile(e.currentTarget)} />
          </Field>
          <SubmitButton pendingText="Envoi sécurisé…">Envoyer pour vérification</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}

export function TrustedContactForm({ defaults }: { defaults: { name: string; relation: TrustedContactRelation | ""; email: string; phone: string; showIndicator: boolean } | null }) {
  return (
    <ActionForm action={saveTrustedContactAction}>
      {(s) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom de la personne" htmlFor="name" error={s.errors?.name}>
              <Input id="name" name="name" defaultValue={defaults?.name} required maxLength={80} />
            </Field>
            <Field label="Lien" htmlFor="relation" error={s.errors?.relation}>
              <Select id="relation" name="relation" placeholder="Choisir…" options={trustedContactRelationOptions} defaultValue={defaults?.relation ?? ""} />
            </Field>
            <Field label="E-mail" htmlFor="tc-email" error={s.errors?.email} optional>
              <Input id="tc-email" name="email" type="email" defaultValue={defaults?.email} />
            </Field>
            <Field label="Téléphone" htmlFor="tc-phone" error={s.errors?.phone} optional>
              <Input id="tc-phone" name="phone" type="tel" defaultValue={defaults?.phone} placeholder="+227 …" />
            </Field>
          </div>
          <Checkbox name="showIndicator" defaultChecked={defaults?.showIndicator ?? true} label="Indiquer sur mon profil que je souhaite impliquer une personne de confiance" description="Seule cette mention est affichée. Le nom et les coordonnées restent privés." />
          <SubmitButton>Enregistrer</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}

export function DeleteAccountForm() {
  return (
    <ActionForm action={deleteAccountAction}>
      {(s) => (
        <>
          <Field label="Mot de passe" htmlFor="del-password" error={s.errors?.password}>
            <Input id="del-password" name="password" type="password" autoComplete="current-password" required />
          </Field>
          <Field label="Saisissez SUPPRIMER pour confirmer" htmlFor="confirmation" error={s.errors?.confirmation}>
            <Input id="confirmation" name="confirmation" required autoComplete="off" />
          </Field>
          <SubmitButton variant="danger" pendingText="Suppression…">
            Supprimer définitivement mon compte
          </SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
