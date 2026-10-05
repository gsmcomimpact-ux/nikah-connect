import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCard } from "@/components/blog/blog-card";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { Markdown } from "@/lib/blog/markdown";
import { getPostBySlug, getRelatedPosts } from "@/lib/blog/queries";
import { BLOG_CATEGORY_LABELS, BLOG_CATEGORY_SLUGS } from "@/lib/constants/options";
import { pageMetadata } from "@/lib/seo/metadata";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { formatDate } from "@/lib/utils";

export const revalidate = 600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);
  if (!post) return {};
  const meta = pageMetadata({ title: post.seoTitle ?? post.title, description: post.seoDescription ?? post.excerpt, path: `/conseils/${post.slug}` });
  return { ...meta, openGraph: { ...meta.openGraph, type: "article", publishedTime: post.publishedAt?.toISOString() } };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const related = await getRelatedPosts(post.category, post.slug);
  return (
    <>
      <JsonLd
        data={[
          articleJsonLd(post),
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "Conseils", path: "/conseils" },
            { name: post.title, path: `/conseils/${post.slug}` },
          ]),
        ]}
      />
      <article className="bg-white">
        <header className="border-b border-gray-100 bg-cream">
          <div className="container-page max-w-3xl py-12 sm:py-16">
            <nav aria-label="Fil d'Ariane" className="text-sm text-gray-500">
              <Link href="/conseils" className="hover:text-primary">Conseils</Link> ›{" "}
              <Link href={`/conseils/categorie/${BLOG_CATEGORY_SLUGS[post.category]}`} className="hover:text-primary">{BLOG_CATEGORY_LABELS[post.category]}</Link>
            </nav>
            <Badge tone="gold" className="mt-4">{BLOG_CATEGORY_LABELS[post.category]}</Badge>
            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-primary sm:text-4xl">{post.title}</h1>
            <p className="mt-4 text-lg text-gray-600">{post.excerpt}</p>
            <p className="mt-4 text-sm text-gray-500">
              {post.authorName} · {post.publishedAt ? formatDate(post.publishedAt) : ""} · {post.readingMinutes} min de lecture
            </p>
          </div>
        </header>
        <div className="container-page max-w-3xl py-10">
          <Markdown source={post.content} />
          <div className="mt-12 rounded-2xl bg-primary p-6 text-center text-cream">
            <p className="font-display text-xl">Prêt(e) à rencontrer une personne qui partage vos valeurs ?</p>
            <ButtonLink href="/inscription" variant="gold" className="mt-4">Créer mon profil</ButtonLink>
          </div>
        </div>
      </article>
      {related.length > 0 && (
        <Section tone="cream">
          <h2 className="font-display text-2xl font-semibold text-primary">À lire aussi</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {related.map((p) => (
              <BlogCard key={p.slug} post={p} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
