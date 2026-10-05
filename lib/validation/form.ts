import { z } from "zod";

/** État retourné par les Server Actions aux formulaires (useActionState). */
export type FormState = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

export const initialFormState: FormState = {};

/** Convertit un FormData en objet ; les clés listées sont lues comme tableaux. */
export function formToObject(fd: FormData, arrayKeys: string[] = []): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const key of new Set(fd.keys())) {
    if (key.startsWith("$ACTION")) continue;
    if (arrayKeys.includes(key)) obj[key] = fd.getAll(key).filter((v) => typeof v === "string" && v !== "");
    else {
      const v = fd.get(key);
      obj[key] = typeof v === "string" ? v : v;
    }
  }
  for (const key of arrayKeys) obj[key] ??= [];
  return obj;
}

export function validationError(error: z.ZodError, message = "Merci de corriger les champs indiqués."): FormState {
  return { ok: false, message, errors: z.flattenError(error).fieldErrors as Record<string, string[]> };
}

/** Champ facultatif : chaîne vide → undefined. */
export const optional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === "" || v === null ? undefined : v), schema.optional());

export const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());
