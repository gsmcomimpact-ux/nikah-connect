import { z } from "zod";
import { ChildrenWish, EducationLevel, MaritalStatus, MarriageTimeline, RelocationPreference } from "@prisma/client";
import { COUNTRY_BY_CODE } from "@/lib/constants/geo";
import type { SearchFilters } from "@/lib/matching/candidates";

const arr = (v: unknown) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
const num = (min: number, max: number) => z.coerce.number().int().min(min).max(max).optional().catch(undefined);
const str = (max: number) => z.string().trim().max(max).optional().catch(undefined).transform((s) => s || undefined);

/** Lecture tolérante des filtres depuis l'URL : toute valeur invalide est ignorée. */
const schema = z.object({
  ageMin: num(18, 99),
  ageMax: num(18, 99),
  country: z.string().optional().catch(undefined).transform((c) => (c && COUNTRY_BY_CODE.has(c) ? c : undefined)),
  city: str(80),
  distanceKm: num(5, 20000),
  maritalStatuses: z.preprocess(arr, z.array(z.enum(MaritalStatus)).catch([])),
  children: z.enum(["with", "without"]).optional().catch(undefined),
  profession: str(80),
  minEducation: z.enum(EducationLevel).optional().catch(undefined),
  languages: z.preprocess(arr, z.array(z.string().max(5)).max(8).catch([])),
  values: z.preprocess(arr, z.array(z.string().max(30)).max(6).catch([])),
  marriageTimeline: z.enum(MarriageTimeline).optional().catch(undefined),
  wantsChildren: z.enum(ChildrenWish).optional().catch(undefined),
  relocation: z.enum(RelocationPreference).optional().catch(undefined),
  verifiedOnly: z.preprocess((v) => v === "on" || v === "1", z.boolean()).catch(false),
  sort: z.enum(["compatibility", "recent"]).optional().catch(undefined),
});

export function parseSearchFilters(params: Record<string, string | string[] | undefined>): SearchFilters {
  return schema.parse(params);
}
