import "server-only";
import type { BlogCategory } from "@prisma/client";
import { db } from "@/lib/db";

const listSelect = { slug: true, title: true, excerpt: true, category: true, publishedAt: true, readingMinutes: true, authorName: true } as const;

export type BlogListItem = Awaited<ReturnType<typeof getLatestPosts>>[number];

export async function getLatestPosts(limit = 12, category?: BlogCategory) {
  try {
    return await db.blogPost.findMany({
      where: { published: true, publishedAt: { lte: new Date() }, ...(category ? { category } : {}) },
      select: listSelect,
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
  } catch {
    // Permet la génération statique même si la base n'est pas joignable au moment du build.
    return [];
  }
}

export async function getPostBySlug(slug: string) {
  return db.blogPost.findFirst({ where: { slug, published: true, publishedAt: { lte: new Date() } } });
}

export async function getRelatedPosts(category: BlogCategory, excludeSlug: string) {
  return db.blogPost.findMany({
    where: { published: true, category, slug: { not: excludeSlug }, publishedAt: { lte: new Date() } },
    select: listSelect,
    orderBy: { publishedAt: "desc" },
    take: 3,
  });
}
