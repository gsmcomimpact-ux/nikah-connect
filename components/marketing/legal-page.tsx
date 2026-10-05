import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui/section";
import { Markdown } from "@/lib/blog/markdown";
import { LEGAL_BY_SLUG } from "@/lib/content/legal";
import { pageMetadata } from "@/lib/seo/metadata";

export function legalMetadata(slug: string) {
  const page = LEGAL_BY_SLUG.get(slug);
  return page ? pageMetadata({ title: page.title, description: page.description, path: `/${slug}` }) : {};
}

export function LegalPageView({ slug }: { slug: string }) {
  const page = LEGAL_BY_SLUG.get(slug);
  if (!page) notFound();
  return (
    <>
      <PageHero title={page.title} description={`Dernière mise à jour : ${page.updated}`} />
      <div className="bg-white">
        <div className="container-page max-w-3xl py-12">
          <Markdown source={page.content} />
        </div>
      </div>
    </>
  );
}
