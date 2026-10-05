"use client";

import { useActionState, type ReactNode } from "react";
import { initialFormState, type FormState } from "@/lib/validation/form";
import { FormMessage } from "@/components/ui/alert";

/** Formulaire générique lié à une Server Action, avec affichage du message de retour. */
export function ActionForm({ action, children, className, encType }: { action: (prev: FormState, fd: FormData) => Promise<FormState>; children: (state: FormState) => ReactNode; className?: string; encType?: string }) {
  const [state, formAction] = useActionState(action, initialFormState);
  return (
    <form action={formAction} className={className ?? "space-y-4"} encType={encType}>
      <FormMessage state={state} />
      {children(state)}
    </form>
  );
}
