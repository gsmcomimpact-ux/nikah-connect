import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BLOG_CATEGORY_LABELS } from "@/lib/constants/options";
import type { BlogListItem } from "@/lib/blog/queries";
import { formatDate } from "@/lib/utils";

export function BlogCard({ post }: { post: BlogListItem }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-200/80 bg-white p-6 transition hover:border-gold/60 hover:shadow-md">
      <Badge tone="gold" className="self-start">{BLOG_CATEGORY_LABELS[post.category]}</Badge>
      <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-ink">
        <Link href={`/conseils/${post.slug}`} className="hover:text-primary">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">{post.excerpt}</p>
      <p className="mt-4 text-xs text-gray-500">
        {post.publishedAt ? formatDate(post.publishedAt) : ""} · {post.readingMinutes} min de lecture
      </p>
    </article>
  );
}
