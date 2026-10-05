import { notFound } from "next/navigation";
import type { BlogCategory } from "@prisma/client";
import { BlogCard } from "@/components/blog/blog-card";
import { CategoryNav } from "@/components/blog/category-nav";
import { PageHero, Section } from "@/components/ui/section";
import { getLatestPosts } from "@/lib/blog/queries";
import { BLOG_CATEGORY_LABELS, BLOG_CATEGORY_SLUGS } from "@/lib/constants/options";
import { pageMetadata } from "@/lib/seo/metadata";

export const revalidate = 600;

function fromSlug(slug: string): BlogCategory | undefined {
  return (Object.keys(BLOG_CATEGORY_SLUGS) as BlogCategory[]).find((c) => BLOG_CATEGORY_SLUGS[c] === slug);
}

export function generateStaticParams() {
  return Object.values(BLOG_CATEGORY_SLUGS).map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = fromSlug(category);
  if (!cat) return {};
  return pageMetadata({ title: `${BLOG_CATEGORY_LABELS[cat]} — Conseils`, description: `Nos conseils « ${BLOG_CATEGORY_LABELS[cat]} » pour une rencontre musulmane sérieuse et un mariage serein.`, path: `/conseils/categorie/${category}` });
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = fromSlug(category);
  if (!cat) notFound();
  const posts = await getLatestPosts(30, cat);
  return (
    <>
      <PageHero eyebrow="Conseils" title={BLOG_CATEGORY_LABELS[cat]} />
      <Section tone="cream">
        <CategoryNav active={cat} />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <BlogCard key={p.slug} post={p} />
          ))}
        </div>
        {posts.length === 0 && <p className="mt-10 text-center text-gray-500">Aucun article dans cette catégorie pour le moment.</p>}
      </Section>
    </>
  );
}
