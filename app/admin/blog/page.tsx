import Link from "next/link";
import { AdminTable, AdminTitle, Td } from "@/components/admin/table";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { deleteBlogPostAction } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { BLOG_CATEGORY_LABELS } from "@/lib/constants/options";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Contenus" };

export default async function AdminBlogPage() {
  await requireAdmin("ADMIN");
  const posts = await db.blogPost.findMany({ orderBy: { updatedAt: "desc" } });
  return (
    <>
      <div className="flex items-start justify-between">
        <AdminTitle title="Conseils (blog)" />
        <ButtonLink href="/admin/blog/nouveau" size="sm">Nouvel article</ButtonLink>
      </div>
      <AdminTable head={["Titre", "Catégorie", "Statut", "Mis à jour", ""]} empty={posts.length === 0}>
        {posts.map((p) => (
          <tr key={p.id}>
            <Td><Link href={`/admin/blog/${p.id}`} className="font-medium text-primary underline">{p.title}</Link></Td>
            <Td>{BLOG_CATEGORY_LABELS[p.category]}</Td>
            <Td>{p.published ? <Badge tone="green">Publié</Badge> : <Badge>Brouillon</Badge>}</Td>
            <Td className="text-xs text-gray-500">{formatDate(p.updatedAt, { dateStyle: "short" })}</Td>
            <Td>
              <form action={deleteBlogPostAction.bind(null, p.id)}>
                <Button type="submit" size="sm" variant="ghost">Supprimer</Button>
              </form>
            </Td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
