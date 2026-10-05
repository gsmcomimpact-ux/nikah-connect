import Link from "next/link";
import type { BlogCategory } from "@prisma/client";
import { BLOG_CATEGORY_LABELS, BLOG_CATEGORY_SLUGS } from "@/lib/constants/options";
import { cn } from "@/lib/utils";

export function CategoryNav({ active }: { active?: BlogCategory }) {
  return (
    <nav aria-label="Catégories" className="flex flex-wrap justify-center gap-2">
      <Link href="/conseils" className={cn("rounded-full px-4 py-1.5 text-sm", !active ? "bg-primary text-cream" : "bg-white text-ink hover:text-primary")}>
        Tous
      </Link>
      {(Object.keys(BLOG_CATEGORY_LABELS) as BlogCategory[]).map((c) => (
        <Link key={c} href={`/conseils/categorie/${BLOG_CATEGORY_SLUGS[c]}`} className={cn("rounded-full px-4 py-1.5 text-sm", active === c ? "bg-primary text-cream" : "bg-white text-ink hover:text-primary")}>
          {BLOG_CATEGORY_LABELS[c]}
        </Link>
      ))}
    </nav>
  );
}
