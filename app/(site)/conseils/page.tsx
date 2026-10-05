import { BlogCard } from "@/components/blog/blog-card";
import { CategoryNav } from "@/components/blog/category-nav";
import { PageHero, Section } from "@/components/ui/section";
import { getLatestPosts } from "@/lib/blog/queries";
import { pageMetadata } from "@/lib/seo/metadata";

export const revalidate = 600;
export const metadata = pageMetadata({ title: "Conseils pour une rencontre sérieuse", description: "Préparer son mariage, compatibilité, communication, famille, vie conjugale et sécurité en ligne : nos conseils pour une rencontre musulmane sereine.", path: "/conseils" });

export default async function BlogIndexPage() {
  const posts = await getLatestPosts(30);
  return (
    <>
      <PageHero eyebrow="Conseils" title="Conseils pour une rencontre sérieuse" description="Des articles pour préparer votre projet de mariage avec sérénité." />
      <Section tone="cream">
        <CategoryNav />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <BlogCard key={p.slug} post={p} />
          ))}
        </div>
        {posts.length === 0 && <p className="mt-10 text-center text-gray-500">Les premiers articles arrivent bientôt.</p>}
      </Section>
    </>
  );
}
