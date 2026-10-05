import { notFound } from "next/navigation";
import { AdminTitle } from "@/components/admin/table";
import { BlogForm } from "@/components/admin/blog-form";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/guards";
import { db } from "@/lib/db";

export const metadata = { title: "Article" };

export default async function AdminBlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("ADMIN");
  const { id } = await params;
  const post = id === "nouveau" ? null : await db.blogPost.findUnique({ where: { id } });
  if (id !== "nouveau" && !post) notFound();
  return (
    <>
      <AdminTitle title={post ? "Modifier l'article" : "Nouvel article"} />
      <Card>
        <BlogForm post={post} />
      </Card>
    </>
  );
}
