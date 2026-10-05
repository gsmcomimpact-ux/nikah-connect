import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export function Pagination({ page, total, pageSize, basePath, query = {} }: { page: number; total: number; pageSize: number; basePath: string; query?: Record<string, string | string[] | undefined> }) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (k === "page" || v === undefined) continue;
      for (const item of Array.isArray(v) ? v : [v]) if (item !== "") sp.append(k, item);
    }
    sp.set("page", String(p));
    return `${basePath}?${sp.toString()}`;
  };
  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-3">
      {page > 1 ? (
        <Link href={href(page - 1)} className={buttonClass("outline", "sm")}>
          ← Précédent
        </Link>
      ) : null}
      <span className="text-sm text-gray-600">
        Page {page} sur {pages}
      </span>
      {page < pages ? (
        <Link href={href(page + 1)} className={buttonClass("outline", "sm")}>
          Suivant →
        </Link>
      ) : null}
    </nav>
  );
}
