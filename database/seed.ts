/**
 * Données de démonstration — ENTIÈREMENT FICTIVES.
 * Aucun de ces profils ne correspond à une personne réelle. Ils sont marqués is_demo = true
 * et leur présentation commence par « (Profil fictif de démonstration) ».
 *
 * Usage : npm run db:seed
 */
import { PrismaClient, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { COUNTRY_BY_CODE } from "../lib/constants/geo";
import { DEFAULT_INTERESTS } from "../lib/constants/interests";
import { BLOG_POSTS } from "./seed-blog";

const db = new PrismaClient();
const DEMO_PASSWORD = "Demo-Nikah-2026";

type DemoProfile = {
  key: string;
  name: string;
  gender: "MALE" | "FEMALE";
  age: number;
  country: string;
  city: string;
  marital: "SINGLE" | "DIVORCED" | "WIDOWED";
  children: number;
  profession: string;
  education: Prisma.ProfileCreateInput["educationLevel"];
  languages: string[];
  values: string[];
  familyValues: string[];
  interests: string[];
  religion: Prisma.ProfileCreateInput["religionImportance"];
  practice: Prisma.ProfileCreateInput["religiousPractice"];
  compat: Prisma.ProfileCreateInput["religiousCompatibility"];
  wantsChildren: "YES" | "NO" | "OPEN";
  acceptsChildren: "YES" | "NO" | "DEPENDS";
  relocation: "STAY_IN_COUNTRY" | "OPEN_TO_ABROAD" | "PREFER_ABROAD" | "FLEXIBLE";
  timeline: "WITHIN_6_MONTHS" | "WITHIN_1_YEAR" | "WITHIN_2_YEARS" | "NO_RUSH";
  bio: string;
  verified?: boolean;
  wali?: boolean;
};

const P = (p: DemoProfile) => p;

const PROFILES: DemoProfile[] = [
  P({ key: "amina", name: "Amina", gender: "FEMALE", age: 28, country: "NE", city: "Niamey", marital: "SINGLE", children: 0, profession: "Enseignante", education: "MASTER", languages: ["fr", "ar", "ha"], values: ["foi", "famille", "honnetete", "savoir"], familyValues: ["education_enfants", "proche_famille", "transmission"], interests: ["lecture", "coran", "education"], religion: "VERY_IMPORTANT", practice: "REGULAR", compat: "IMPORTANT", wantsChildren: "YES", acceptsChildren: "DEPENDS", relocation: "FLEXIBLE", timeline: "WITHIN_1_YEAR", bio: "Enseignante passionnée, j'aime transmettre et apprendre. Je cherche un homme sérieux, attentionné et patient, avec qui construire un foyer apaisé où la foi et le dialogue tiennent une place centrale.", verified: true, wali: true }),
  P({ key: "ibrahim", name: "Ibrahim", gender: "MALE", age: 33, country: "CI", city: "Abidjan", marital: "SINGLE", children: 0, profession: "Ingénieur réseaux", education: "MASTER", languages: ["fr", "dyu", "en"], values: ["foi", "travail", "respect", "famille"], familyValues: ["partage_taches", "stabilite", "education_enfants"], interests: ["technologie", "football", "voyages"], religion: "IMPORTANT", practice: "REGULAR", compat: "IMPORTANT", wantsChildren: "YES", acceptsChildren: "YES", relocation: "OPEN_TO_ABROAD", timeline: "WITHIN_1_YEAR", bio: "Ingénieur, posé et travailleur. Je souhaite rencontrer une femme bienveillante et ambitieuse pour fonder une famille unie, dans le respect mutuel et le partage des responsabilités.", verified: true }),
  P({ key: "mariam", name: "Mariam", gender: "FEMALE", age: 30, country: "SN", city: "Dakar", marital: "SINGLE", children: 0, profession: "Pharmacienne", education: "DOCTORATE", languages: ["fr", "wo", "ar"], values: ["foi", "bienveillance", "savoir", "patience"], familyValues: ["education_enfants", "hospitalite", "ambition_pro"], interests: ["lecture", "sciences-islamiques", "cuisine"], religion: "VERY_IMPORTANT", practice: "REGULAR", compat: "ESSENTIAL", wantsChildren: "YES", acceptsChildren: "NO", relocation: "STAY_IN_COUNTRY", timeline: "WITHIN_2_YEARS", bio: "Pharmacienne, j'aime mon métier et ma famille. J'aspire à un mariage fondé sur la confiance, la sincérité et la recherche commune de l'agrément d'Allah." }),
  P({ key: "oumar", name: "Oumar", gender: "MALE", age: 35, country: "NE", city: "Niamey", marital: "DIVORCED", children: 1, profession: "Comptable", education: "BACHELOR", languages: ["fr", "dje", "ha"], values: ["famille", "honnetete", "patience", "fidelite"], familyValues: ["proche_famille", "stabilite", "vie_simple"], interests: ["football", "lecture", "benevolat"], religion: "VERY_IMPORTANT", practice: "REGULAR", compat: "IMPORTANT", wantsChildren: "YES", acceptsChildren: "YES", relocation: "STAY_IN_COUNTRY", timeline: "WITHIN_6_MONTHS", bio: "Papa d'un petit garçon, je suis un homme calme et responsable. Je recherche une épouse douce et sincère, prête à construire une famille recomposée dans la sérénité.", wali: false }),
  P({ key: "fatoumata", name: "Fatoumata", gender: "FEMALE", age: 26, country: "ML", city: "Bamako", marital: "SINGLE", children: 0, profession: "Infirmière", education: "VOCATIONAL", languages: ["fr", "bm"], values: ["foi", "entraide", "famille", "pudeur"], familyValues: ["proche_famille", "education_enfants", "hospitalite"], interests: ["benevolat", "cuisine", "couture"], religion: "ESSENTIAL", practice: "REGULAR", compat: "ESSENTIAL", wantsChildren: "YES", acceptsChildren: "DEPENDS", relocation: "FLEXIBLE", timeline: "WITHIN_1_YEAR", bio: "Infirmière au grand cœur, je prends soin des autres au quotidien. Je cherche un homme pieux, respectueux et proche de sa famille.", wali: true }),
  P({ key: "youssef", name: "Youssef", gender: "MALE", age: 31, country: "FR", city: "Lyon", marital: "SINGLE", children: 0, profession: "Chef de projet", education: "MASTER", languages: ["fr", "ar", "en"], values: ["communication", "respect", "foi", "generosite"], familyValues: ["partage_taches", "transmission", "ambition_pro"], interests: ["randonnee", "voyages", "histoire"], religion: "IMPORTANT", practice: "MODERATE", compat: "IMPORTANT", wantsChildren: "YES", acceptsChildren: "DEPENDS", relocation: "OPEN_TO_ABROAD", timeline: "WITHIN_1_YEAR", bio: "Curieux, sportif et attaché à mes racines. Je souhaite rencontrer une femme avec qui partager une foi sincère, des projets et beaucoup de dialogue.", verified: true }),
  P({ key: "khadija", name: "Khadija", gender: "FEMALE", age: 33, country: "FR", city: "Paris", marital: "DIVORCED", children: 1, profession: "Juriste", education: "MASTER", languages: ["fr", "ar", "en"], values: ["honnetete", "respect", "communication", "foi"], familyValues: ["partage_taches", "education_enfants", "stabilite"], interests: ["lecture", "histoire", "langues"], religion: "IMPORTANT", practice: "MODERATE", compat: "IMPORTANT", wantsChildren: "OPEN", acceptsChildren: "YES", relocation: "STAY_IN_COUNTRY", timeline: "WITHIN_2_YEARS", bio: "Maman d'une fille de 6 ans, juriste. Je cherche un homme stable, mature et bienveillant, qui saura accueillir notre petite famille avec douceur." }),
  P({ key: "abdoulaye", name: "Abdoulaye", gender: "MALE", age: 29, country: "SN", city: "Thiès", marital: "SINGLE", children: 0, profession: "Entrepreneur (agroalimentaire)", education: "BACHELOR", languages: ["fr", "wo"], values: ["travail", "foi", "generosite", "entraide"], familyValues: ["proche_famille", "transmission", "hospitalite"], interests: ["entrepreneuriat", "football", "jardinage"], religion: "VERY_IMPORTANT", practice: "REGULAR", compat: "ESSENTIAL", wantsChildren: "YES", acceptsChildren: "DEPENDS", relocation: "STAY_IN_COUNTRY", timeline: "WITHIN_6_MONTHS", bio: "Entrepreneur dans la transformation de céréales locales. Je souhaite me marier rapidement avec une femme pieuse et dynamique." }),
  P({ key: "aicha", name: "Aïcha", gender: "FEMALE", age: 31, country: "BF", city: "Ouagadougou", marital: "SINGLE", children: 0, profession: "Économiste", education: "MASTER", languages: ["fr", "mos", "en"], values: ["savoir", "honnetete", "humilite", "famille"], familyValues: ["ambition_pro", "education_enfants", "partage_taches"], interests: ["lecture", "voyages", "langues"], religion: "IMPORTANT", practice: "REGULAR", compat: "IMPORTANT", wantsChildren: "YES", acceptsChildren: "DEPENDS", relocation: "OPEN_TO_ABROAD", timeline: "WITHIN_1_YEAR", bio: "Économiste dans une organisation de développement. J'aime les débats d'idées et les voyages. Je recherche un homme cultivé, respectueux et engagé.", verified: true }),
  P({ key: "moussa", name: "Moussa", gender: "MALE", age: 37, country: "ML", city: "Bamako", marital: "WIDOWED", children: 2, profession: "Professeur de mathématiques", education: "MASTER", languages: ["fr", "bm", "ar"], values: ["patience", "famille", "foi", "savoir"], familyValues: ["education_enfants", "stabilite", "transmission"], interests: ["lecture", "coran", "education"], religion: "ESSENTIAL", practice: "REGULAR", compat: "ESSENTIAL", wantsChildren: "OPEN", acceptsChildren: "YES", relocation: "STAY_IN_COUNTRY", timeline: "WITHIN_1_YEAR", bio: "Veuf et père de deux enfants, je suis enseignant. Je recherche une épouse pieuse et patiente, prête à rejoindre une famille aimante.", wali: true }),
  P({ key: "salma", name: "Salma", gender: "FEMALE", age: 27, country: "MA", city: "Casablanca", marital: "SINGLE", children: 0, profession: "Architecte", education: "MASTER", languages: ["ar", "fr", "en"], values: ["foi", "generosite", "communication", "respect"], familyValues: ["ambition_pro", "hospitalite", "partage_taches"], interests: ["calligraphie", "photographie", "voyages"], religion: "IMPORTANT", practice: "REGULAR", compat: "IMPORTANT", wantsChildren: "YES", acceptsChildren: "DEPENDS", relocation: "OPEN_TO_ABROAD", timeline: "WITHIN_2_YEARS", bio: "Architecte, passionnée d'art islamique et de calligraphie. Je cherche un homme équilibré, qui allie spiritualité et ouverture d'esprit." }),
  P({ key: "hamza", name: "Hamza", gender: "MALE", age: 30, country: "BE", city: "Bruxelles", marital: "SINGLE", children: 0, profession: "Développeur web", education: "BACHELOR", languages: ["fr", "ar", "en"], values: ["foi", "humilite", "respect", "travail"], familyValues: ["partage_taches", "vie_simple", "education_enfants"], interests: ["technologie", "sport", "sciences-islamiques"], religion: "VERY_IMPORTANT", practice: "REGULAR", compat: "IMPORTANT", wantsChildren: "YES", acceptsChildren: "DEPENDS", relocation: "OPEN_TO_ABROAD", timeline: "WITHIN_1_YEAR", bio: "Développeur, sportif, j'essaie chaque jour d'être une meilleure personne. Je souhaite fonder un foyer simple et heureux avec une femme sincère." }),
  P({ key: "zeinab", name: "Zeinab", gender: "FEMALE", age: 29, country: "NE", city: "Maradi", marital: "SINGLE", children: 0, profession: "Gestionnaire de projets", education: "MASTER", languages: ["fr", "ha", "ar"], values: ["foi", "famille", "entraide", "travail"], familyValues: ["proche_famille", "transmission", "stabilite"], interests: ["benevolat", "lecture", "cuisine"], religion: "VERY_IMPORTANT", practice: "REGULAR", compat: "IMPORTANT", wantsChildren: "YES", acceptsChildren: "DEPENDS", relocation: "FLEXIBLE", timeline: "WITHIN_1_YEAR", bio: "Engagée dans des projets associatifs, j'aime être utile. Je recherche un homme de foi, travailleur et attentionné.", wali: true }),
  P({ key: "issa", name: "Issa", gender: "MALE", age: 32, country: "NE", city: "Niamey", marital: "SINGLE", children: 0, profession: "Médecin", education: "DOCTORATE", languages: ["fr", "ha", "dje", "en"], values: ["foi", "savoir", "bienveillance", "famille"], familyValues: ["education_enfants", "proche_famille", "stabilite"], interests: ["lecture", "coran", "randonnee"], religion: "VERY_IMPORTANT", practice: "REGULAR", compat: "IMPORTANT", wantsChildren: "YES", acceptsChildren: "DEPENDS", relocation: "FLEXIBLE", timeline: "WITHIN_1_YEAR", bio: "Médecin généraliste, je consacre beaucoup de temps aux autres. Je souhaite rencontrer une femme instruite et pieuse pour bâtir ensemble un foyer serein.", verified: true }),
  P({ key: "nafissa", name: "Nafissa", gender: "FEMALE", age: 34, country: "CI", city: "Bouaké", marital: "DIVORCED", children: 0, profession: "Commerçante", education: "SECONDARY", languages: ["fr", "dyu"], values: ["travail", "honnetete", "fidelite", "patience"], familyValues: ["stabilite", "vie_simple", "hospitalite"], interests: ["cuisine", "couture", "entrepreneuriat"], religion: "IMPORTANT", practice: "MODERATE", compat: "FLEXIBLE", wantsChildren: "YES", acceptsChildren: "YES", relocation: "STAY_IN_COUNTRY", timeline: "WITHIN_6_MONTHS", bio: "Commerçante indépendante, souriante et travailleuse. Je souhaite me remarier avec un homme loyal et respectueux." }),
  P({ key: "souleymane", name: "Souleymane", gender: "MALE", age: 40, country: "GN", city: "Conakry", marital: "DIVORCED", children: 2, profession: "Transitaire", education: "BACHELOR", languages: ["fr", "ff"], values: ["famille", "respect", "generosite", "foi"], familyValues: ["proche_famille", "hospitalite", "stabilite"], interests: ["voyages", "football", "histoire"], religion: "IMPORTANT", practice: "MODERATE", compat: "FLEXIBLE", wantsChildren: "OPEN", acceptsChildren: "YES", relocation: "STAY_IN_COUNTRY", timeline: "WITHIN_1_YEAR", bio: "Père de deux adolescents, je suis un homme généreux et attaché aux valeurs familiales. Je recherche une compagne mature et sereine." }),
  P({ key: "rahma", name: "Rahma", gender: "FEMALE", age: 25, country: "TN", city: "Tunis", marital: "SINGLE", children: 0, profession: "Étudiante en médecine", education: "BACHELOR", languages: ["ar", "fr", "en"], values: ["savoir", "foi", "pudeur", "famille"], familyValues: ["transmission", "education_enfants", "ambition_pro"], interests: ["lecture", "poesie", "langues"], religion: "VERY_IMPORTANT", practice: "REGULAR", compat: "ESSENTIAL", wantsChildren: "YES", acceptsChildren: "NO", relocation: "FLEXIBLE", timeline: "WITHIN_2_YEARS", bio: "Étudiante en dernière année de médecine. J'aime la poésie et l'apprentissage. Je souhaite un mari qui soutienne mes études et partage ma foi.", wali: true }),
  P({ key: "karim", name: "Karim", gender: "MALE", age: 36, country: "CA", city: "Montréal", marital: "SINGLE", children: 0, profession: "Analyste financier", education: "MASTER", languages: ["fr", "ar", "en"], values: ["honnetete", "travail", "communication", "foi"], familyValues: ["partage_taches", "ambition_pro", "stabilite"], interests: ["randonnee", "photographie", "technologie"], religion: "IMPORTANT", practice: "MODERATE", compat: "IMPORTANT", wantsChildren: "YES", acceptsChildren: "DEPENDS", relocation: "PREFER_ABROAD", timeline: "WITHIN_1_YEAR", bio: "Installé à Montréal depuis dix ans. J'aime la nature et les projets au long cours. Je cherche une épouse ouverte à la vie au Canada." }),
  P({ key: "hawa", name: "Hawa", gender: "FEMALE", age: 32, country: "CM", city: "Garoua", marital: "SINGLE", children: 0, profession: "Sage-femme", education: "VOCATIONAL", languages: ["fr", "ff", "en"], values: ["bienveillance", "foi", "entraide", "patience"], familyValues: ["education_enfants", "proche_famille", "hospitalite"], interests: ["benevolat", "cuisine", "lecture"], religion: "VERY_IMPORTANT", practice: "REGULAR", compat: "IMPORTANT", wantsChildren: "YES", acceptsChildren: "YES", relocation: "FLEXIBLE", timeline: "WITHIN_1_YEAR", bio: "Sage-femme, j'accompagne chaque jour des familles. Je rêve à mon tour d'un foyer chaleureux avec un homme pieux et bienveillant." }),
  P({ key: "adam", name: "Adam", gender: "MALE", age: 27, country: "FR", city: "Marseille", marital: "SINGLE", children: 0, profession: "Électricien", education: "VOCATIONAL", languages: ["fr", "ar"], values: ["respect", "travail", "foi", "fidelite"], familyValues: ["vie_simple", "proche_famille", "partage_taches"], interests: ["football", "sport", "cuisine"], religion: "VERY_IMPORTANT", practice: "REGULAR", compat: "IMPORTANT", wantsChildren: "YES", acceptsChildren: "DEPENDS", relocation: "OPEN_TO_ABROAD", timeline: "WITHIN_6_MONTHS", bio: "Électricien à mon compte, simple et droit. Je souhaite me marier et construire une vie paisible, dans la foi et la bonne humeur." }),
  P({ key: "djamila", name: "Djamila", gender: "FEMALE", age: 36, country: "DZ", city: "Alger", marital: "WIDOWED", children: 1, profession: "Professeure d'arabe", education: "MASTER", languages: ["ar", "fr", "ber"], values: ["foi", "patience", "savoir", "pudeur"], familyValues: ["transmission", "education_enfants", "stabilite"], interests: ["coran", "calligraphie", "poesie"], religion: "ESSENTIAL", practice: "REGULAR", compat: "ESSENTIAL", wantsChildren: "OPEN", acceptsChildren: "YES", relocation: "STAY_IN_COUNTRY", timeline: "WITHIN_1_YEAR", bio: "Veuve, maman d'un garçon. J'enseigne l'arabe et j'aime transmettre. Je recherche un homme pieux, patient et doux." }),
  P({ key: "mahamadou", name: "Mahamadou", gender: "MALE", age: 34, country: "NE", city: "Zinder", marital: "SINGLE", children: 0, profession: "Agronome", education: "MASTER", languages: ["fr", "ha"], values: ["travail", "famille", "humilite", "foi"], familyValues: ["proche_famille", "vie_simple", "transmission"], interests: ["jardinage", "randonnee", "lecture"], religion: "VERY_IMPORTANT", practice: "REGULAR", compat: "IMPORTANT", wantsChildren: "YES", acceptsChildren: "DEPENDS", relocation: "STAY_IN_COUNTRY", timeline: "WITHIN_1_YEAR", bio: "Agronome passionné par la terre et le développement rural. Homme calme, je recherche une épouse sérieuse et attachée à la famille." }),
  P({ key: "leila", name: "Leïla", gender: "FEMALE", age: 30, country: "BE", city: "Liège", marital: "SINGLE", children: 0, profession: "Assistante sociale", education: "BACHELOR", languages: ["fr", "ar", "tr"], values: ["entraide", "bienveillance", "communication", "foi"], familyValues: ["partage_taches", "hospitalite", "education_enfants"], interests: ["benevolat", "voyages", "photographie"], religion: "IMPORTANT", practice: "MODERATE", compat: "IMPORTANT", wantsChildren: "YES", acceptsChildren: "YES", relocation: "OPEN_TO_ABROAD", timeline: "WITHIN_2_YEARS", bio: "Assistante sociale, je crois au pouvoir de l'écoute. Je souhaite rencontrer un homme sincère, communicatif et engagé dans sa foi." }),
  P({ key: "cheikh", name: "Cheikh", gender: "MALE", age: 38, country: "SN", city: "Touba", marital: "SINGLE", children: 0, profession: "Imprimeur", education: "SECONDARY", languages: ["wo", "fr", "ar"], values: ["foi", "generosite", "humilite", "famille"], familyValues: ["proche_famille", "hospitalite", "transmission"], interests: ["coran", "calligraphie", "artisanat"], religion: "ESSENTIAL", practice: "REGULAR", compat: "ESSENTIAL", wantsChildren: "YES", acceptsChildren: "YES", relocation: "STAY_IN_COUNTRY", timeline: "WITHIN_6_MONTHS", bio: "Imprimeur et calligraphe amateur, très attaché à ma communauté. Je recherche une épouse pieuse et souriante." }),
];

const DEMO_MEMBER = { email: "membre.demo@demo.nikah-connect.local", key: "issa" }; // compte de test pour explorer l'espace membre

function dob(age: number, offsetDays: number) {
  const d = new Date();
  d.setUTCFullYear(d.getUTCFullYear() - age);
  d.setUTCDate(d.getUTCDate() - 30 - offsetDays);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

async function main() {
  console.log("→ Centres d'intérêt");
  for (const i of DEFAULT_INTERESTS) await db.interest.upsert({ where: { slug: i.slug }, create: i, update: { label: i.label, category: i.category } });
  const interestIds = new Map((await db.interest.findMany()).map((i) => [i.slug, i.id]));

  console.log("→ Super-administrateur");
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@nikah-connect.local").toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMoi-Admin-2026";
  if ((process.env.VERCEL || process.env.NODE_ENV === "production") && (!process.env.SEED_ADMIN_PASSWORD || adminPassword.length < 12)) {
    throw new Error("Définissez SEED_ADMIN_PASSWORD (12 caractères minimum) avant d'initialiser une base de production.");
  }
  const adminHash = await bcrypt.hash(adminPassword, 12);
  const admin = await db.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      emailVerifiedAt: new Date(),
      onboardingStep: 6,
      termsAcceptedAt: new Date(),
      profile: { create: { displayName: "Équipe Modération", gender: "MALE", dateOfBirth: dob(40, 0), country: "NE", city: "Niamey", languages: ["fr"], values: [], familyValues: [], isVisible: false } },
      subscription: { create: { plan: "FREE" } },
    },
    update: {},
  });
  await db.adminUser.upsert({ where: { userId: admin.id }, create: { userId: admin.id, role: "SUPER_ADMIN" }, update: { role: "SUPER_ADMIN" } });

  console.log("→ Profils de démonstration (fictifs)");
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const ids = new Map<string, string>();
  for (const [i, p] of PROFILES.entries()) {
    const email = p.key === DEMO_MEMBER.key ? DEMO_MEMBER.email : `${p.key}@demo.nikah-connect.local`;
    const city = COUNTRY_BY_CODE.get(p.country)?.cities.find((c) => c.name === p.city);
    const profileData = {
      displayName: p.name,
      gender: p.gender,
      dateOfBirth: dob(p.age, i * 11),
      country: p.country,
      city: p.city,
      latitude: city?.lat,
      longitude: city?.lng,
      maritalStatus: p.marital,
      childrenCount: p.children,
      profession: p.profession,
      educationLevel: p.education,
      languages: p.languages,
      bio: `(Profil fictif de démonstration) ${p.bio}`,
      religionImportance: p.religion,
      religiousPractice: p.practice,
      values: p.values,
      marriageVision: "Le mariage est pour moi un engagement de compassion, de miséricorde et de responsabilité partagée, que l'on construit chaque jour.",
      religiousCompatibility: p.compat,
      seeksMarriage: true,
      wantsChildren: p.wantsChildren,
      acceptsPartnerChildren: p.acceptsChildren,
      relocation: p.relocation,
      marriageTimeline: p.timeline,
      familyVision: "Un foyer apaisé, ouvert sur la famille élargie, où chacun peut s'épanouir et où les enfants grandissent dans l'amour et les valeurs.",
      familyValues: p.familyValues,
      completeness: 88,
    } satisfies Omit<Prisma.ProfileUncheckedCreateInput, "userId">;

    const user = await db.user.upsert({
      where: { email },
      create: {
        email,
        passwordHash,
        isDemo: true,
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: p.verified ? new Date() : null,
        identityVerifiedAt: p.verified ? new Date() : null,
        onboardingStep: 6,
        termsAcceptedAt: new Date(),
        lastActiveAt: new Date(Date.now() - i * 3_600_000 * 5),
        profile: { create: profileData },
        subscription: { create: { plan: p.key === DEMO_MEMBER.key ? "PREMIUM" : "FREE", currentPeriodEnd: p.key === DEMO_MEMBER.key ? new Date(Date.now() + 365 * 86400_000) : null, provider: p.key === DEMO_MEMBER.key ? "manual" : null } },
      },
      update: { profile: { update: profileData } },
    });
    ids.set(p.key, user.id);

    await db.profileInterest.deleteMany({ where: { profileId: user.id } });
    await db.profileInterest.createMany({ data: p.interests.map((s) => interestIds.get(s)).filter((x): x is string => Boolean(x)).map((interestId) => ({ profileId: user.id, interestId })), skipDuplicates: true });

    const prefData = {
      ageMin: Math.max(18, p.age - (p.gender === "MALE" ? 10 : 2)),
      ageMax: p.age + (p.gender === "MALE" ? 3 : 10),
      countries: [],
      languages: [],
      maritalStatuses: [],
      religionImportances: [],
      cities: [],
    };
    await db.preference.upsert({ where: { userId: user.id }, create: { userId: user.id, ...prefData }, update: prefData });

    if (p.wali) {
      await db.trustedContact.upsert({
        where: { userId: user.id },
        create: { userId: user.id, name: "Contact fictif", relation: "PARENT", email: `wali.${p.key}@demo.nikah-connect.local`, showIndicator: true },
        update: {},
      });
    }
  }

  console.log("→ Interactions de démonstration pour le compte membre");
  const me = ids.get(DEMO_MEMBER.key)!;
  const amina = ids.get("amina")!;
  const zeinab = ids.get("zeinab")!;
  const fatoumata = ids.get("fatoumata")!;

  // Demande reçue (en attente)
  await db.like.upsert({ where: { fromUserId_toUserId: { fromUserId: zeinab, toUserId: me } }, create: { fromUserId: zeinab, toUserId: me, type: "INTEREST", status: "PENDING", note: "Assalamou alaykoum, votre profil m'a inspiré confiance. Je serais heureuse d'échanger, avec l'accord de nos familles." }, update: {} });
  // Demande envoyée (en attente)
  await db.like.upsert({ where: { fromUserId_toUserId: { fromUserId: me, toUserId: fatoumata } }, create: { fromUserId: me, toUserId: fatoumata, type: "INTEREST", status: "PENDING" }, update: {} });

  // Compatibilité mutuelle + conversation
  const [a, b] = me < amina ? [me, amina] : [amina, me];
  await db.like.upsert({ where: { fromUserId_toUserId: { fromUserId: me, toUserId: amina } }, create: { fromUserId: me, toUserId: amina, type: "INTEREST", status: "ACCEPTED" }, update: {} });
  await db.like.upsert({ where: { fromUserId_toUserId: { fromUserId: amina, toUserId: me } }, create: { fromUserId: amina, toUserId: me, type: "INTEREST", status: "ACCEPTED" }, update: {} });
  const match = await db.match.upsert({ where: { userAId_userBId: { userAId: a, userBId: b } }, create: { userAId: a, userBId: b, score: 90 }, update: {} });
  const existingConv = await db.conversation.findUnique({ where: { matchId: match.id } });
  if (!existingConv) {
    const t = Date.now() - 2 * 86400_000;
    await db.conversation.create({
      data: {
        matchId: match.id,
        lastMessageAt: new Date(t + 5 * 3600_000),
        participants: { create: [{ userId: a }, { userId: b }] },
        messages: {
          create: [
            { senderId: null, body: "Compatibilité mutuelle ! Vous pouvez désormais échanger dans le respect. Rappel : ne transférez jamais d'argent.", createdAt: new Date(t) },
            { senderId: me, body: "Assalamou alaykoum Amina, merci d'avoir accepté. J'ai lu avec attention votre présentation, notamment votre vision de la transmission.", createdAt: new Date(t + 3600_000) },
            { senderId: amina, body: "Wa alaykoum salam Issa. Merci pour votre message respectueux. Pouvez-vous me parler de votre projet de vie à Niamey ?", createdAt: new Date(t + 2 * 3600_000) },
            { senderId: me, body: "Bien sûr. J'exerce comme médecin et je souhaite m'établir durablement ici, près de ma famille. Et vous, quelles sont vos priorités pour le foyer ?", createdAt: new Date(t + 5 * 3600_000) },
          ],
        },
      },
    });
  }

  if ((await db.notification.count({ where: { userId: me } })) === 0) await db.notification.createMany({
    data: [
      { userId: me, type: "REQUEST_RECEIVED", title: "Nouvelle demande reçue", body: "Zeinab a manifesté son intérêt pour votre profil.", link: "/espace/demandes" },
      { userId: me, type: "REQUEST_ACCEPTED", title: "Compatibilité mutuelle", body: "Vous et Amina avez manifesté un intérêt réciproque.", link: "/espace/messages" },
    ],
  });

  console.log("→ Signalement automatique d'exemple (modération)");
  const souleymane = ids.get("souleymane")!;
  const reportExists = await db.report.findFirst({ where: { reportedUserId: souleymane, source: "SYSTEM" } });
  if (!reportExists) await db.report.create({ data: { reportedUserId: souleymane, reason: "SPAM", source: "SYSTEM", details: "Exemple fictif : volume anormal de demandes en moins d'une heure." } });

  console.log("→ Articles de conseils");
  for (const { daysAgo, ...post } of BLOG_POSTS) {
    const readingMinutes = Math.max(2, Math.round(post.content.split(/\s+/).length / 220));
    await db.blogPost.upsert({
      where: { slug: post.slug },
      create: { ...post, readingMinutes, published: true, publishedAt: new Date(Date.now() - daysAgo * 86400_000) },
      update: { title: post.title, excerpt: post.excerpt, content: post.content, readingMinutes },
    });
  }

  console.log(`\n✓ Seed terminé.
  Super-admin    : ${adminEmail} / (SEED_ADMIN_PASSWORD)
  Membre démo    : ${DEMO_MEMBER.email} / ${DEMO_PASSWORD}
  Autres profils : <prenom>@demo.nikah-connect.local / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
